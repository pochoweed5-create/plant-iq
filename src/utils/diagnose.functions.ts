import { createServerFn } from "@tanstack/react-start";

type DiagnosisResult = {
  ok: true;
  plant: string;
  problem: string;
  severity: "leve" | "moderado" | "grave";
  urgency: "baja" | "media" | "alta";
  cause: string;
  explanation: string;
  steps: string[];
  recovery: string;
  elkar: string;
} | { ok: false; error: string };

export const diagnosePlant = createServerFn({ method: "POST" })
  .inputValidator((d: { imageBase64: string; note?: string }) => d)
  .handler(async ({ data }): Promise<DiagnosisResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, error: "LOVABLE_API_KEY no está configurada." };
    if (!data.imageBase64?.startsWith("data:image/")) {
      return { ok: false, error: "Imagen inválida." };
    }

    const systemPrompt = `Eres ELKAR, mentor botánico experto en cultivo de cannabis y plantas en general (indoor, outdoor, hidroponía y suelo). Tu rol es diagnosticar con precisión a partir de una imagen y guiar al cultivador como un maestro paciente.

TONO:
- Experto pero cercano. Hablas claro, sin tecnicismos innecesarios.
- Cuando uses un término técnico (ej: clorosis, tricomas, EC, pH), explícalo en una frase.
- Directo, sin rodeos. Nunca alarmista, nunca condescendiente.
- Te diriges al cultivador en segunda persona ("tu planta", "revisa", "ajusta").

REGLAS DE DIAGNÓSTICO:
- Observa color de hojas, manchas, bordes quemados, forma, turgencia, sustrato visible y entorno.
- Identifica el problema MÁS PROBABLE. Si hay varios candidatos, elige el principal y menciona alternativas dentro de "explanation".
- Si la imagen es de baja calidad, no es una planta, o no permite diagnóstico fiable: indícalo claramente en "problem" (ej: "Imagen insuficiente para diagnóstico") con severity "leve" y explica qué foto necesitas.
- Nunca inventes datos. Si no estás seguro, dilo en "explanation".

FORMATO OBLIGATORIO — devuelve EXCLUSIVAMENTE vía la función "report_diagnosis":
1. problem: nombre claro y corto del problema detectado.
2. severity: bajo (leve), medio (moderado) o alto (grave).
3. explanation: explicación sencilla en 2-3 frases, sin jerga.
4. cause: causa probable concreta (riego, nutrientes, plaga, luz, pH, etc.).
5. steps: 4-6 pasos accionables, en orden, empezando por verbo ("Reduce el riego a…", "Revisa el pH del agua…"). Cada paso es una acción concreta, no un consejo vago.
6. recovery: tiempo estimado realista (ej: "5-10 días si actúas hoy").
7. elkar: 1-2 frases de mentor que motiven y resuman la prioridad.`;

    const userText = data.note
      ? `Analiza esta planta y diagnostica el problema más probable siguiendo tu protocolo. Contexto del cultivador: ${data.note}`
      : "Analiza esta planta y diagnostica el problema más probable siguiendo tu protocolo. Sin contexto adicional del cultivador.";

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userText },
                { type: "image_url", image_url: { url: data.imageBase64 } },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "report_diagnosis",
                description: "Devuelve el diagnóstico estructurado de la planta.",
                parameters: {
                  type: "object",
                  properties: {
                    plant: { type: "string", description: "Tipo de planta detectada (ej: Cannabis, Tomate, Desconocida)" },
                    problem: { type: "string", description: "Nombre breve del problema (ej: Exceso de nitrógeno)" },
                    severity: { type: "string", enum: ["leve", "moderado", "grave"] },
                    urgency: { type: "string", enum: ["baja", "media", "alta"] },
                    cause: { type: "string", description: "Causa probable, 1-2 frases" },
                    explanation: { type: "string", description: "Explicación sencilla, 2-3 frases" },
                    steps: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-6 pasos accionables y concretos",
                    },
                    recovery: { type: "string", description: "Tiempo estimado de recuperación, ej: 7-14 días" },
                    elkar: { type: "string", description: "Mensaje breve de ELKAR (1-2 frases) en tono mentor" },
                  },
                  required: ["plant", "problem", "severity", "urgency", "cause", "explanation", "steps", "recovery", "elkar"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "report_diagnosis" } },
        }),
      });

      if (res.status === 429) return { ok: false, error: "Demasiadas peticiones. Inténtalo en un momento." };
      if (res.status === 402) return { ok: false, error: "Créditos de IA agotados. Añade saldo en Settings → Workspace → Usage." };
      if (!res.ok) {
        const t = await res.text();
        console.error("AI gateway error", res.status, t);
        return { ok: false, error: "Error del servicio de IA." };
      }

      const json = await res.json();
      const call = json.choices?.[0]?.message?.tool_calls?.[0];
      if (!call?.function?.arguments) return { ok: false, error: "Respuesta de IA inválida." };
      const parsed = JSON.parse(call.function.arguments);
      return { ok: true, ...parsed };
    } catch (e) {
      console.error("diagnose error", e);
      return { ok: false, error: e instanceof Error ? e.message : "Error desconocido." };
    }
  });
