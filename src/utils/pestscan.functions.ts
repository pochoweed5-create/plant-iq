import { createServerFn } from "@tanstack/react-start";

type PestResult =
  | {
      ok: true;
      headline: string; // ELKAR style alert
      confidence: number; // 0-100
      patternsFound: number;
      candidates: Array<{
        name: string;
        probability: number; // 0-100
        severity: "leve" | "moderado" | "grave";
        propagation: "lenta" | "media" | "rápida";
        risk: "bajo" | "medio" | "alto";
        signals: string[]; // visual signals matched
      }>;
      damagedZones: Array<{
        label: string;
        x: number; // 0-100 (% of image)
        y: number; // 0-100
        radius: number; // 0-50 (% of min dim)
      }>;
      preventive: string[]; // 1-3 preventive forecasts
      treatment: string[]; // 3-5 immediate steps
      elkar: string; // mentor closing line
    }
  | { ok: false; error: string };

export const pestScan = createServerFn({ method: "POST" })
  .inputValidator((d: { imageBase64: string; environment?: string }) => d)
  .handler(async ({ data }): Promise<PestResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, error: "LOVABLE_API_KEY no configurada." };
    if (!data.imageBase64?.startsWith("data:image/")) {
      return { ok: false, error: "Imagen inválida." };
    }

    const systemPrompt = `Eres ELKAR PESTSCAN, un sistema de detección avanzada de plagas e insectos en plantas.

OBJETIVO: detectar la plaga o estresor responsable AUNQUE el insecto NO aparezca en la imagen, usando patrones de daño:
- mordidas, agujeros, bordes irregulares
- manchas (color, forma, distribución)
- decoloración / amarilleo / bronceado
- deformaciones, rizado, abarquillado
- huevos visibles, exuvias, telarañas finas
- tricomas dañados, puntos plateados (trips)
- daño en tallos o pecíolos
- patrones de daño (puntos vs vetas vs minas serpenteantes)

CANDIDATOS POSIBLES (elige los 2-4 más probables):
trips, araña roja, mosca blanca, pulgones, cochinilla, oruga, minadores,
oídio (hongo), botritis (hongo), mildiu, mancha foliar, exceso de riego,
deficiencia nutricional, estrés lumínico, quemadura por nutrientes.

ESTILO ELKAR:
- Frases cortas, directas, mentor experto.
- Nada de "se observa", "podría", "sería conveniente".
- Usa: "Tiene pinta de...", "Esto canta a...", "Actúa ya...", "Ojo aquí".
- headline empieza con un emoji ⚠️🧬🚨🌱⚡ y es 1 frase de 5-9 palabras.

REGLAS:
- confidence honesta (0-100). Si la imagen es ambigua, baja a 40-55.
- patternsFound = nº de zonas/síntomas independientes que coinciden.
- damagedZones: 1-4 puntos en coordenadas % (x,y de 0 a 100, radius 6-18).
  Si no puedes localizar, devuelve [].
- candidates ordenados por probabilidad descendente. Probabilidades suman ~100±10.
- preventive: 1-3 frases de PREDICCIÓN (24-72h) en tono "Si sigues así, en X horas..."
- treatment: 3-5 acciones imperativas concretas y aplicables hoy.
- Si la planta está sana sin signos: candidates=[{name:"Sin plaga detectada", probability:95, severity:"leve", propagation:"lenta", risk:"bajo", signals:["Hojas íntegras","Color uniforme"]}], headline "🌱 Sin señales de plaga.".`;

    const userText = data.environment
      ? `Analiza esta planta buscando plagas, hongos y daño biológico. Entorno del cultivador: ${data.environment}`
      : "Analiza esta planta buscando plagas, hongos y daño biológico. Sin contexto adicional.";

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
                name: "report_pest_scan",
                description: "Devuelve el análisis estructurado de plagas.",
                parameters: {
                  type: "object",
                  properties: {
                    headline: { type: "string" },
                    confidence: { type: "number" },
                    patternsFound: { type: "number" },
                    candidates: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          probability: { type: "number" },
                          severity: { type: "string", enum: ["leve", "moderado", "grave"] },
                          propagation: { type: "string", enum: ["lenta", "media", "rápida"] },
                          risk: { type: "string", enum: ["bajo", "medio", "alto"] },
                          signals: { type: "array", items: { type: "string" } },
                        },
                        required: ["name", "probability", "severity", "propagation", "risk", "signals"],
                        additionalProperties: false,
                      },
                    },
                    damagedZones: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          x: { type: "number" },
                          y: { type: "number" },
                          radius: { type: "number" },
                        },
                        required: ["label", "x", "y", "radius"],
                        additionalProperties: false,
                      },
                    },
                    preventive: { type: "array", items: { type: "string" } },
                    treatment: { type: "array", items: { type: "string" } },
                    elkar: { type: "string" },
                  },
                  required: [
                    "headline",
                    "confidence",
                    "patternsFound",
                    "candidates",
                    "damagedZones",
                    "preventive",
                    "treatment",
                    "elkar",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "report_pest_scan" } },
        }),
      });

      if (res.status === 429) return { ok: false, error: "Demasiadas solicitudes. Inténtalo en unos segundos." };
      if (res.status === 402) return { ok: false, error: "Créditos de IA agotados. Recarga en Settings > Workspace > Usage." };
      if (!res.ok) {
        const t = await res.text();
        return { ok: false, error: `Gateway IA: ${res.status} ${t.slice(0, 140)}` };
      }

      const json = await res.json();
      const tc = json?.choices?.[0]?.message?.tool_calls?.[0];
      const argsRaw = tc?.function?.arguments;
      if (!argsRaw) return { ok: false, error: "Respuesta sin estructura." };
      const parsed = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;

      return {
        ok: true,
        headline: String(parsed.headline ?? "🧬 Análisis completado."),
        confidence: Math.max(0, Math.min(100, Number(parsed.confidence ?? 0))),
        patternsFound: Math.max(0, Number(parsed.patternsFound ?? 0)),
        candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
        damagedZones: Array.isArray(parsed.damagedZones) ? parsed.damagedZones : [],
        preventive: Array.isArray(parsed.preventive) ? parsed.preventive : [],
        treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [],
        elkar: String(parsed.elkar ?? ""),
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error de red." };
    }
  });
