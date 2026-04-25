import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { diagnosePlant } from "@/utils/diagnose.functions";
import { Upload, Loader2, AlertTriangle, CheckCircle2, Clock, Sparkles, RotateCcw, Sun, Focus, Crop, Leaf } from "lucide-react";

type Result = Awaited<ReturnType<typeof diagnosePlant>>;

const severityColor: Record<string, string> = {
  leve: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
  moderado: "text-amber-200 border-amber-400/40 bg-amber-500/10",
  grave: "text-red-300 border-red-400/40 bg-red-500/10",
};

const checklistItems = [
  {
    key: "light",
    icon: Sun,
    title: "Buena luz natural",
    hint: "Evita flash directo y sombras duras. Luz de día indirecta es ideal.",
  },
  {
    key: "angle",
    icon: Crop,
    title: "Ángulo frontal",
    hint: "Sitúate de frente a la hoja o zona afectada, no en diagonal.",
  },
  {
    key: "focus",
    icon: Focus,
    title: "Enfoque nítido",
    hint: "Acércate hasta ver textura, manchas y bordes con detalle.",
  },
  {
    key: "leaves",
    icon: Leaf,
    title: "Hojas completas",
    hint: "Encuadra hojas enteras: el síntoma y los bordes deben verse.",
  },
] as const;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function Diagnose() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const diagnose = useServerFn(diagnosePlant);

  const allChecked = checklistItems.every((i) => checked[i.key]);

  function toggle(key: string) {
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  }

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      setResult({ ok: false, error: "La imagen debe pesar menos de 8 MB." });
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    setResult(null);
    setLoading(true);
    try {
      const r = await diagnose({ data: { imageBase64: dataUrl, note: note || undefined } });
      setResult(r);
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "Error de red." });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setNote("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section id="diagnostico" className="relative py-24 sm:py-32 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-gold">Diagnóstico instantáneo</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">
            Sube una foto. <span className="italic text-gold">Recibe respuestas.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            ELKAR analiza el color, las manchas, la forma y el estado general de tu planta para darte un diagnóstico real en segundos.
          </p>
        </div>

        <div className="rounded-3xl bg-card/60 backdrop-blur border border-border/60 shadow-elegant overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Uploader */}
            <div className="p-8 sm:p-10 border-b md:border-b-0 md:border-r border-border/50">
              {!preview ? (
                <label
                  htmlFor="plantfile"
                  className="flex flex-col items-center justify-center text-center min-h-[280px] rounded-2xl border-2 border-dashed border-border hover:border-gold/60 bg-leaf-card/40 transition-smooth cursor-pointer p-8"
                >
                  <span className="h-14 w-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-gold" />
                  </span>
                  <span className="font-serif text-xl">Arrastra o sube una foto</span>
                  <span className="text-sm text-muted-foreground mt-2">JPG, PNG · máx. 8 MB</span>
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-border/60 min-h-[280px]">
                  <img src={preview} alt="Tu planta" className="w-full h-full object-cover max-h-[420px]" />
                  <button
                    onClick={reset}
                    className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background transition-smooth"
                  >
                    <RotateCcw className="h-3 w-3" /> Cambiar
                  </button>
                </div>
              )}
              <input
                id="plantfile"
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />

              <div className="mt-5">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Contexto (opcional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej: cultivo indoor, semana 4 de floración, riego cada 2 días"
                  rows={2}
                  className="mt-2 w-full rounded-xl bg-input/60 border border-border/60 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                />
              </div>
            </div>

            {/* Result */}
            <div className="p-8 sm:p-10 min-h-[420px] flex flex-col">
              {!preview && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Sparkles className="h-8 w-8 text-gold/60 mb-3" />
                  <p className="font-serif text-xl text-foreground/80">El diagnóstico aparecerá aquí</p>
                  <p className="text-sm mt-2 max-w-xs">Sube una imagen para que ELKAR analice tu planta.</p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
                  <p className="font-serif text-xl">ELKAR está analizando…</p>
                  <p className="text-sm text-muted-foreground mt-2">Esto suele tardar 2–5 segundos.</p>
                </div>
              )}

              {result && !loading && result.ok === false && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
                  <p className="font-serif text-xl">No se pudo diagnosticar</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs">{result.error}</p>
                  <button onClick={reset} className="mt-5 text-sm px-4 py-2 rounded-full bg-secondary hover:bg-accent transition-smooth">
                    Intentar de nuevo
                  </button>
                </div>
              )}

              {result && !loading && result.ok === true && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Header: planta + nivel de gravedad */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">{result.plant}</span>
                      <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColor[result.severity] ?? severityColor.moderado}`}>
                        Gravedad {result.severity}
                      </span>
                    </div>
                  </div>

                  {/* 1. Problema */}
                  <Section index={1} label="Problema detectado">
                    <h3 className="font-serif text-2xl sm:text-3xl leading-tight text-foreground">
                      {result.problem}
                    </h3>
                  </Section>

                  {/* 2. Explicación */}
                  <Section index={2} label="Explicación">
                    <p className="text-sm text-foreground/85 leading-relaxed">{result.explanation}</p>
                  </Section>

                  {/* 3. Causa probable */}
                  <Section index={3} label="Causa probable">
                    <div className="rounded-xl bg-leaf-card/60 border border-border/50 p-4">
                      <p className="text-sm text-foreground/85 leading-relaxed">{result.cause}</p>
                    </div>
                  </Section>

                  {/* 4. Solución paso a paso */}
                  <Section index={4} label="Solución paso a paso">
                    <ol className="space-y-2.5">
                      {result.steps.map((s, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs flex items-center justify-center font-medium">
                            {i + 1}
                          </span>
                          <span className="text-foreground/85 leading-relaxed pt-0.5">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </Section>

                  {/* 5. Recuperación */}
                  <Section index={5} label="Tiempo de recuperación">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gold" />
                      <span className="text-foreground/90">{result.recovery}</span>
                      <span className="text-muted-foreground">· urgencia {result.urgency}</span>
                    </div>
                  </Section>

                  {/* Mensaje de ELKAR */}
                  <div className="rounded-xl border border-gold/30 bg-gold/[0.06] p-4 flex gap-3">
                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                    </span>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-gold mb-0.5">ELKAR · tu mentor</div>
                      <p className="text-sm italic text-foreground/90 leading-relaxed">"{result.elkar}"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Las recomendaciones son orientativas. Ante dudas, consulta a un profesional.
        </p>
      </div>
    </section>
  );
}

function Section({ index, label, children }: { index: number; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-medium text-gold/90 tabular-nums">0{index}</span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-gold">{label}</span>
        <span className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
      </div>
      {children}
    </div>
  );
}
