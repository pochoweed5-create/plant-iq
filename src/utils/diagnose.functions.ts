import { createServerFn } from "@tanstack/react-start";

type DiagnosisResult = {
  ok: true;
  plant: string;
  status: "sana" | "leve" | "problema";
  problem: string;
  severity: "leve" | "moderado" | "grave";
  urgency: "baja" | "media" | "alta";
  issueType?: "exceso" | "carencia" | "estres" | "plaga" | "ninguno";
  confidence: number;
  growthPhase: "plantula" | "vegetativo" | "floracion" | "desconocida";
  nearRisk: { level: "ninguno" | "bajo" | "medio" | "alto"; message: string };
  cause: string;
  explanation: string;
  steps: string[];
  recovery: string;
  elkar: string;
  reminders: Array<{
    type: "riego" | "fertilizacion" | "revision" | "tratamiento";
    title: string;
    detail: string;
    inDays: number;
    repeatEveryDays?: number;
  }>;
  nutritionPlan: {
    stage: "plantula" | "crecimiento" | "prefloracion" | "floracion" | "engorde" | "lavado" | "desconocida";
    stageNote: string;
    targetEC?: string;
    targetPH?: string;
    medium?: "suelo" | "coco" | "hidro" | "desconocido";
    products: Array<{
      name: string;
      role: "base-a" | "base-b" | "crecimiento" | "floracion" | "pk-booster" | "cal-mag" | "enraizante" | "enzimas" | "microbiologia" | "corrector-ph" | "otro";
      dose: string;
      frequency: string;
      note?: string;
    }>;
    warnings: string[];
  };
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

TONO Y ESTILO DE VOZ (REGLA CRÍTICA, APLICA A TODOS LOS CAMPOS DE TEXTO):
ELKAR habla como un cultivador experto real hablando con otro cultivador. NO como una IA, NO como un manual, NO como un asistente formal.

Reglas de voz obligatorias:
- Frases CORTAS. Directas. Seguras. Sin rodeos.
- Lenguaje natural y humano. Tuteo siempre ("tu planta", "revisa", "ajusta", "actúa ya").
- Si usas un término técnico (clorosis, EC, pH, tricomas), lo explicas en media frase y sigues.
- Muestra seguridad sin exagerar. Nada de alarmismo. Nada de condescendencia.

PROHIBIDO usar estas expresiones (suenan a IA / manual):
- "Se observa...", "Se aprecia...", "Se evidencia..."
- "Es posible que...", "Podría ser...", "Podría indicar..."
- "Se recomienda...", "Se sugiere...", "Sería conveniente..."
- "El usuario debería...", "La planta presenta..."
- Cualquier construcción impersonal con "se + verbo".

USA en su lugar (estilo cultivador real):
- "Tiene pinta de...", "Esto suele ser...", "Todo apunta a..."
- "Ojo con esto", "Ojo aquí", "Cuidado con..."
- "Actúa ya", "Métele mano", "No esperes"
- "Va bien", "Buen trabajo", "Sigue así", "No toques mucho"
- "No falla", "Es de libro", "Clásico de..."

Ejemplos del tono ELKAR (imítalos):
- Sana: "Va bien. No toques mucho. Sigue con este ritmo."
- Sana: "Buen trabajo. Color y forma de libro."
- Leve: "Nada grave. Ojo al riego, te estás pasando un pelín."
- Problema (plaga): "Tiene pinta de araña roja. Esos puntitos no fallan."
- Problema (carencia): "Clásico de falta de nitrógeno. Las hojas viejas lo cantan."
- Riesgo: "Si no actúas ya, en 2–3 días esto va a más."
- Acción: "Actúa ya. Empieza con jabón potásico esta tarde."

CONTROL DE CALIDAD antes de devolver el JSON:
Relee cada campo de texto (problem, cause, explanation, steps, recovery, elkar, nearRisk.message, nutritionPlan.stageNote y warnings).
Pregúntate: ¿suena humano? ¿es directo? ¿lo diría un cultivador real en un grow shop?
Si alguna frase suena a IA, a manual o a "se observa / se recomienda", REESCRÍBELA antes de responder. No entregues nada que suene robótico.

REGLAS DE DIAGNÓSTICO:
- Observa color de hojas, manchas, bordes quemados, forma, turgencia, sustrato visible y entorno.
- NO inventes problemas. Si la planta se ve sana, dilo claramente. No fuerces un diagnóstico negativo.
- Si la imagen es de baja calidad, no es una planta, o no permite diagnóstico fiable: usa status "leve", problem "Imagen insuficiente para diagnóstico" y explica qué foto necesitas.
- Nunca inventes datos. Si no estás seguro, dilo en "explanation".

CLASIFICACIÓN OBLIGATORIA (campo "status"):
Clasifica el estado general de la planta en UNO de estos 3 niveles:
- "sana": la planta se ve bien, color y forma adecuados, sin síntomas claros. NO hay problema. En este caso:
  · problem = "Sin problemas detectados"
  · issueType = "ninguno"
  · severity = "leve", urgency = "baja"
  · cause describe por qué se ve sana (ej: "Color uniforme, turgencia correcta, sin manchas").
  · steps = mantenimiento (riego estable, observación, condiciones actuales).
  · elkar tono positivo, refuerza el buen manejo.
- "leve": ligera desviación o detalle a vigilar (ligero estrés, riego mejorable, hoja vieja amarilleando, etc.). NO es un problema serio. En este caso:
  · problem = nombre corto del detalle (ej: "Ligero estrés hídrico", "Hoja inferior amarilleando").
  · issueType opcional según corresponda.
  · severity = "leve".
  · Tono tranquilo, sin alarmismo. Recomienda ajuste suave.
- "problema": síntomas claros (carencias, excesos, plagas, hongos, bloqueos, quemaduras). En este caso:
  · problem = nombre corto y técnico del problema.
  · issueType OBLIGATORIO entre "exceso" | "carencia" | "estres" | "plaga".
  · severity y urgency reales según el caso.

CAMPOS:
1. status: "sana" | "leve" | "problema" (clasificación principal).
2. problem: nombre claro y corto. Si status="sana" usa "Sin problemas detectados".
3. issueType: tipo técnico cuando hay problema; "ninguno" si está sana.
4. severity y urgency: realistas, no infladas.
5. explanation: 2-3 frases sin jerga, basada en lo que se ve.
6. cause: causa probable concreta. Si está sana, describe por qué se ve bien.
7. steps: 3-6 acciones concretas, en imperativo directo ("Baja el EC a 1.2", "Pulveriza con jabón potásico al atardecer", "Riega 200ml a pH 6.2"). NUNCA empieces con "Se recomienda" ni "Sería bueno". Si está sana, son de mantenimiento ("Mantén el riego como vas", "Sigue observando cada 2 días").
8. recovery: tiempo estimado en lenguaje natural ("7-10 días si actúas hoy", "Lo notarás en 3-4 días"). Si está sana: "No hay nada que recuperar".
9. elkar: 1-2 frases de mentor cultivador. Tono ELKAR puro, frases cortas, humanas, seguras. Acorde al estado (sin alarmar si está sana, sin dudar si hay problema claro).
10. confidence: número entero 0-100 de confianza del diagnóstico, basado en claridad real de los síntomas visibles.
    · 85-100 → síntomas claros e inequívocos.
    · 60-84 → interpretación probable, hay margen.
    · <60 → pocas señales visibles, foto pobre o ambigua.
    Sé honesto. No infles la confianza. Si la imagen es ambigua, baja el valor.
11. growthPhase: fase del cultivo identificada visualmente. UNO de: "plantula", "vegetativo", "floracion".
    · plantula: pocas hojas, tallo fino, planta muy joven.
    · vegetativo: estructura desarrollada, sin flores ni cogollos.
    · floracion: flores, cogollos, pistilos o tricomas visibles.
    Si hay duda real, elige la más probable según tamaño y estructura. Solo usa "desconocida" si la imagen no permite verlo en absoluto.
12. nearRisk: predicción preventiva a corto plazo (24-72h).
    · level: "ninguno" | "bajo" | "medio" | "alto".
    · message: 1 frase corta, concreta, con plazo en horas/días y consecuencia real. Tono cultivador.
    Si no hay riesgo: level="ninguno" y message="Por ahora todo tranquilo, sin riesgos a la vista."
    Ejemplos válidos del tono: "Si sigues regando así, en 48h te toca encharcamiento seguro.", "Como no bajes el pH, en 3 días aparece la carencia de Mg.", "Si no actúas ya, en 2-3 días la plaga se te dispara."
    NO inventes riesgos. Solo usa level distinto de "ninguno" si hay un patrón claro en la imagen o el contexto.`;

    const remindersGuide = `

RECORDATORIOS (campo "reminders"):
Genera entre 3 y 5 recordatorios accionables que conviertan el diagnóstico en hábitos. Cada uno con:
- type: uno de "riego" | "fertilizacion" | "revision" | "tratamiento".
- title: muy corto (ej: "Riego ligero", "Aplicar cal-mag", "Revisar evolución").
- detail: 1 frase concreta con cantidad/método (ej: "Riega 200ml por maceta, agua a pH 6.2").
- inDays: días desde hoy hasta la primera ejecución (0 = hoy).
- repeatEveryDays (opcional): cada cuántos días repetir (ej: 3 para riego cíclico). Omitir si es tarea única.

Reglas:
- Incluye SIEMPRE al menos un recordatorio de "revision" para evaluar la evolución.
- Ajusta la frecuencia de riego según la causa (estrés hídrico, exceso, normal).
- Si la causa es nutricional, incluye un recordatorio de "fertilizacion" con producto/ratio orientativo.
- Convierte los pasos del tratamiento en recordatorios "tratamiento" cuando tengan tiempo asociado.`;

    const nutritionGuide = `

PLAN NUTRICIONAL POR ETAPA (campo "nutritionPlan"):
Genera un plan nutricional orientativo adaptado a la etapa de la planta y al diagnóstico:
- stage: deduce la etapa a partir de la imagen y el contexto del cultivador ("plantula", "crecimiento", "prefloracion", "floracion", "engorde", "lavado"). Si no es posible deducirla, usa "desconocida" y explícalo en stageNote.
- stageNote: 1 frase explicando en qué etapa está y por qué.
- targetEC y targetPH: rangos orientativos según etapa y medio (ej: "1.2–1.6 mS/cm", "5.8–6.2"). Omite si no aplica.
- medium: deduce el medio si es posible (suelo, coco, hidro), o "desconocido".
- products: 3 a 6 productos genéricos (NO marcas comerciales obligatorias; puedes citar tipos: "fertilizante base de crecimiento NPK alto en N", "PK 13/14", "Cal-Mag", "enzimas", "tricodermas", etc.). Cada producto con:
  · name: nombre genérico claro.
  · role: rol nutricional.
  · dose: dosis orientativa por litro de agua (ej: "1.5 ml/L", "0.5 g/L").
  · frequency: frecuencia (ej: "cada riego", "1 de cada 2 riegos", "1 vez por semana").
  · note (opcional): aviso útil (ej: "no mezclar con cal-mag en el mismo tanque").
- Ajusta el plan al diagnóstico: si hay exceso de nutrientes, prioriza un lavado de raíces y reduce dosis. Si hay carencia específica (N, P, K, Ca, Mg, Fe), incluye el correctivo adecuado.
- warnings: 1 a 3 avisos clave (ej: "Ajusta pH SIEMPRE después de mezclar nutrientes", "Empieza por el 50% de la dosis si la planta viene estresada").
- Las dosis son ORIENTATIVAS: deja claro en stageNote o warnings que el cultivador debe ajustar a su línea de nutrientes.`;

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
            { role: "system", content: systemPrompt + remindersGuide + nutritionGuide },
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
                    status: {
                      type: "string",
                      enum: ["sana", "leve", "problema"],
                      description: "Clasificación principal: sana = sin problemas, leve = ligera desviación, problema = síntomas claros.",
                    },
                    problem: { type: "string", description: "Nombre breve del problema (ej: Exceso de nitrógeno)" },
                    severity: { type: "string", enum: ["leve", "moderado", "grave"] },
                    urgency: { type: "string", enum: ["baja", "media", "alta"] },
                    issueType: {
                      type: "string",
                      enum: ["exceso", "carencia", "estres", "plaga", "ninguno"],
                      description: "Tipo técnico cuando hay problema; 'ninguno' si la planta está sana.",
                    },
                    confidence: {
                      type: "number",
                      description: "Confianza del diagnóstico de 0 a 100, basada en claridad de síntomas visibles.",
                    },
                    growthPhase: {
                      type: "string",
                      enum: ["plantula", "vegetativo", "floracion", "desconocida"],
                      description: "Fase del cultivo detectada visualmente.",
                    },
                    nearRisk: {
                      type: "object",
                      description: "Predicción preventiva a corto plazo (24-72h).",
                      properties: {
                        level: { type: "string", enum: ["ninguno", "bajo", "medio", "alto"] },
                        message: { type: "string", description: "Frase corta y concreta del riesgo o 'Sin riesgos detectados a corto plazo.'" },
                      },
                      required: ["level", "message"],
                      additionalProperties: false,
                    },
                    cause: { type: "string", description: "Causa probable, 1-2 frases" },
                    explanation: { type: "string", description: "Explicación sencilla, 2-3 frases" },
                    steps: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-6 pasos accionables y concretos",
                    },
                    recovery: { type: "string", description: "Tiempo estimado de recuperación, ej: 7-14 días" },
                    elkar: { type: "string", description: "Mensaje breve de ELKAR (1-2 frases) en tono mentor" },
                    reminders: {
                      type: "array",
                      description: "3-5 recordatorios accionables generados a partir del diagnóstico.",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["riego", "fertilizacion", "revision", "tratamiento"] },
                          title: { type: "string", description: "Título corto del recordatorio" },
                          detail: { type: "string", description: "Acción concreta en 1 frase" },
                          inDays: { type: "number", description: "Días desde hoy hasta la primera ejecución" },
                          repeatEveryDays: { type: "number", description: "Repetición en días (opcional)" },
                        },
                        required: ["type", "title", "detail", "inDays"],
                        additionalProperties: false,
                      },
                    },
                    nutritionPlan: {
                      type: "object",
                      description: "Plan nutricional orientativo por etapa.",
                      properties: {
                        stage: {
                          type: "string",
                          enum: ["plantula", "crecimiento", "prefloracion", "floracion", "engorde", "lavado", "desconocida"],
                        },
                        stageNote: { type: "string", description: "Explicación breve de la etapa detectada" },
                        targetEC: { type: "string", description: "Rango orientativo de EC, ej: '1.2-1.6 mS/cm'" },
                        targetPH: { type: "string", description: "Rango orientativo de pH, ej: '5.8-6.2'" },
                        medium: { type: "string", enum: ["suelo", "coco", "hidro", "desconocido"] },
                        products: {
                          type: "array",
                          description: "3-6 productos orientativos con dosis y frecuencia.",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              role: {
                                type: "string",
                                enum: [
                                  "base-a",
                                  "base-b",
                                  "crecimiento",
                                  "floracion",
                                  "pk-booster",
                                  "cal-mag",
                                  "enraizante",
                                  "enzimas",
                                  "microbiologia",
                                  "corrector-ph",
                                  "otro",
                                ],
                              },
                              dose: { type: "string", description: "Dosis orientativa, ej: '1.5 ml/L'" },
                              frequency: { type: "string", description: "Frecuencia, ej: 'cada riego'" },
                              note: { type: "string" },
                            },
                            required: ["name", "role", "dose", "frequency"],
                            additionalProperties: false,
                          },
                        },
                        warnings: {
                          type: "array",
                          items: { type: "string" },
                          description: "1-3 avisos clave sobre aplicación del plan.",
                        },
                      },
                      required: ["stage", "stageNote", "products", "warnings"],
                      additionalProperties: false,
                    },
                  },
                  required: ["plant", "status", "problem", "severity", "urgency", "issueType", "confidence", "growthPhase", "nearRisk", "cause", "explanation", "steps", "recovery", "elkar", "reminders", "nutritionPlan"],
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
