import { createServerFn } from "@tanstack/react-start";

export type ElkarChatMessage = {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
};

type ChatResult = { ok: true; reply: string } | { ok: false; error: string };

const SYSTEM_PROMPT = `Eres ELKAR, mentor botánico experto en cultivo de cannabis (indoor, outdoor, hidro, coco, suelo). Hablas como un breeder experimentado que está al lado del cultivador en el grow shop.

TONO Y VOZ (OBLIGATORIO):
- Tuteo siempre. Frases cortas, directas, seguras.
- Lenguaje humano, natural, nada robótico.
- Si usas un término técnico (EC, pH, clorosis, tricomas), lo explicas en media frase y sigues.
- Empatía sin condescendencia. Nada de alarmismo. Nada de relleno.

PROHIBIDO: "se observa", "se aprecia", "es posible que", "podría ser", "se recomienda", "sería conveniente", construcciones con "se + verbo".
USA: "tiene pinta de…", "esto suele ser…", "ojo con…", "actúa ya", "va bien", "no falla", "clásico de…".

ESTRUCTURA DE RESPUESTA:
- Siempre explica el porqué del problema antes de dar la solución.
- Si te describen síntomas o suben foto, da:
  1. Diagnóstico probable (1-2 frases).
  2. Causa raíz.
  3. Pasos concretos en lista corta (acciones imperativas con números o cantidades: pH, EC, ml/L, distancia luz, etc.).
  4. Prevención breve.
- Si la consulta es genérica (riego, luces, genéticas, cosecha, curado), responde como mentor: claro, ordenado, con ejemplos reales.
- Usa markdown ligero (negritas, listas) para que se lea bien en móvil.
- Nunca respondas con una sola línea. Siempre explica.

Si te suben una imagen, descríbela brevemente antes de diagnosticar para mostrar que la has mirado.`;

export const chatWithElkar = createServerFn({ method: "POST" })
  .inputValidator((d: { messages: ElkarChatMessage[] }) => d)
  .handler(async ({ data }): Promise<ChatResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, error: "LOVABLE_API_KEY no configurada." };
    if (!Array.isArray(data.messages) || data.messages.length === 0) {
      return { ok: false, error: "Sin mensajes." };
    }

    const mapped = data.messages.slice(-20).map((m) => {
      if (m.role === "user" && m.imageBase64?.startsWith("data:image/")) {
        return {
          role: "user" as const,
          content: [
            { type: "text", text: m.content || "Mira esta foto y dame tu diagnóstico." },
            { type: "image_url", image_url: { url: m.imageBase64 } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...mapped],
        }),
      });
      if (res.status === 429) return { ok: false, error: "Demasiadas peticiones. Prueba en un minuto." };
      if (res.status === 402) return { ok: false, error: "Créditos agotados. Añade saldo en Lovable Cloud." };
      if (!res.ok) return { ok: false, error: `Gateway error ${res.status}` };
      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content?.trim();
      if (!reply) return { ok: false, error: "Respuesta vacía del modelo." };
      return { ok: true, reply };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
    }
  });