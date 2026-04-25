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

    const systemPrompt = `Eres ELKAR, un mentor botánico experto en cultivo de cannabis y plantas. Tono: sabio, directo, cercano y profesional. Analiza la imagen y devuelve EXCLUSIVAMENTE el resultado vía la función "report_diagnosis". No inventes: si no estás seguro, indica baja confianza en la explicación.`;

    const userText = data.note
      ? `Analiza esta planta. Contexto del cultivador: ${data.note}`
      : "Analiza esta planta y diagnostica el problema más probable.";

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
