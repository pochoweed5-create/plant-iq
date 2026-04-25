import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { diagnosePlant } from "@/utils/diagnose.functions";
import { Upload, Loader2, AlertTriangle, CheckCircle2, Clock, Sparkles, RotateCcw, Sun, Focus, Crop, Leaf, Camera, Droplets, FlaskConical, Eye, Stethoscope, Bell, BellRing, Repeat, Sprout, FlaskRound, Beaker, Gauge, AlertCircle } from "lucide-react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { PhotoGuide } from "./PhotoGuide";

type Result = Awaited<ReturnType<typeof diagnosePlant>>;

const severityColor: Record<string, string> = {
  leve: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
  moderado: "text-amber-200 border-amber-400/40 bg-amber-500/10",
  grave: "text-red-300 border-red-400/40 bg-red-500/10",
};

const reminderMeta: Record<string, { icon: typeof Droplets; label: string; tone: string }> = {
  riego: { icon: Droplets, label: "Riego", tone: "text-sky-300 border-sky-400/30 bg-sky-500/10" },
  fertilizacion: { icon: FlaskConical, label: "Fertilización", tone: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10" },
  revision: { icon: Eye, label: "Revisión", tone: "text-amber-200 border-amber-400/30 bg-amber-500/10" },
  tratamiento: { icon: Stethoscope, label: "Tratamiento", tone: "text-rose-300 border-rose-400/30 bg-rose-500/10" },
};

const stageMeta: Record<string, { label: string; tone: string }> = {
  plantula: { label: "Plántula", tone: "text-emerald-200 border-emerald-400/30 bg-emerald-500/10" },
  crecimiento: { label: "Crecimiento", tone: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10" },
  prefloracion: { label: "Prefloración", tone: "text-amber-200 border-amber-400/30 bg-amber-500/10" },
  floracion: { label: "Floración", tone: "text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-500/10" },
  engorde: { label: "Engorde", tone: "text-rose-200 border-rose-400/30 bg-rose-500/10" },
  lavado: { label: "Lavado de raíces", tone: "text-sky-300 border-sky-400/30 bg-sky-500/10" },
  desconocida: { label: "Etapa por confirmar", tone: "text-muted-foreground border-border/60 bg-card/40" },
};

const roleLabel: Record<string, string> = {
  "base-a": "Base A",
  "base-b": "Base B",
  crecimiento: "Crecimiento",
  floracion: "Floración",
  "pk-booster": "PK Booster",
  "cal-mag": "Cal-Mag",
  enraizante: "Enraizante",
  enzimas: "Enzimas",
  microbiologia: "Microbiología",
  "corrector-ph": "Corrector pH",
  otro: "Otro",
};

function formatWhen(inDays: number): string {
  if (inDays <= 0) return "Hoy";
  if (inDays === 1) return "Mañana";
  if (inDays < 7) return `En ${inDays} días`;
  if (inDays < 14) return `En 1 semana`;
  return `En ${Math.round(inDays / 7)} semanas`;
}

function formatDate(inDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(0, inDays));
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

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
  const [guideOpen, setGuideOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
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
    setChecked({});
    setSaved(false);
    setSaving(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSave() {
    if (saved || saving) return;
    setSaving(true);
    // Simulación de guardado — futura versión persistirá en backend
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 700);
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
                <div className="space-y-4">
                  {/* Checklist previo */}
                  <div className="rounded-2xl border border-border/60 bg-leaf-card/40 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-gold">
                        Antes de subir · checklist
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setGuideOpen(true)}
                          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold hover:text-gold/80 transition-smooth"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          Ver guía
                        </button>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {checklistItems.filter((i) => checked[i.key]).length}/{checklistItems.length}
                        </span>
                      </div>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {checklistItems.map(({ key, icon: Icon, title, hint }) => {
                        const isOn = !!checked[key];
                        return (
                          <li key={key}>
                            <button
                              type="button"
                              onClick={() => toggle(key)}
                              aria-pressed={isOn}
                              className={`w-full text-left flex gap-3 p-3 rounded-xl border transition-smooth ${
                                isOn
                                  ? "border-gold/50 bg-gold/[0.07]"
                                  : "border-border/60 bg-background/30 hover:border-gold/30"
                              }`}
                            >
                              <span
                                className={`flex-shrink-0 h-8 w-8 rounded-full border flex items-center justify-center transition-smooth ${
                                  isOn ? "border-gold/50 bg-gold/15 text-gold" : "border-border text-muted-foreground"
                                }`}
                              >
                                {isOn ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-foreground">{title}</span>
                                <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">
                                  {hint}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Uploader */}
                  <label
                    htmlFor="plantfile"
                    aria-disabled={!allChecked}
                    onClick={(e) => {
                      if (!allChecked) e.preventDefault();
                    }}
                    className={`flex flex-col items-center justify-center text-center min-h-[200px] rounded-2xl border-2 border-dashed transition-smooth p-8 ${
                      allChecked
                        ? "border-gold/50 hover:border-gold bg-leaf-card/40 cursor-pointer"
                        : "border-border/60 bg-background/20 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span
                      className={`h-14 w-14 rounded-full border flex items-center justify-center mb-4 ${
                        allChecked ? "bg-gold/15 border-gold/40 text-gold" : "bg-muted/30 border-border text-muted-foreground"
                      }`}
                    >
                      <Upload className="h-6 w-6" />
                    </span>
                    <span className="font-serif text-xl">
                      {allChecked ? "Arrastra o sube tu foto" : "Confirma el checklist primero"}
                    </span>
                    <span className="text-sm text-muted-foreground mt-2">
                      {allChecked ? "JPG, PNG · máx. 8 MB" : "Marca los 4 puntos para activar la subida"}
                    </span>
                  </label>
                </div>
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

                  {/* Recordatorios automáticos */}
                  {result.reminders && result.reminders.length > 0 && (
                    <Section index={6} label="Plan de cuidados · recordatorios">
                      <div className="flex items-center gap-2 mb-3 text-[11px] text-muted-foreground">
                        {saved ? <BellRing className="h-3.5 w-3.5 text-gold" /> : <Bell className="h-3.5 w-3.5" />}
                        <span>
                          {saved
                            ? "Recordatorios activos · ELKAR te avisará en cada fecha"
                            : "ELKAR ha generado un plan. Guarda la planta para activarlos."}
                        </span>
                      </div>
                      <ul className="space-y-2.5">
                        {result.reminders.map((r, i) => {
                          const meta = reminderMeta[r.type] ?? reminderMeta.revision;
                          const Icon = meta.icon;
                          return (
                            <li
                              key={i}
                              className={`rounded-xl border bg-card/40 p-3 sm:p-4 flex gap-3 transition-smooth ${
                                saved ? "border-gold/30" : "border-border/60"
                              }`}
                            >
                              <span className={`flex-shrink-0 h-9 w-9 rounded-full border flex items-center justify-center ${meta.tone}`}>
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                    {meta.label}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">·</span>
                                  <span className="text-[11px] font-medium text-gold">
                                    {formatWhen(r.inDays)}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatDate(r.inDays)}
                                  </span>
                                  {r.repeatEveryDays ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground border border-border/60 rounded-full px-1.5 py-0.5">
                                      <Repeat className="h-2.5 w-2.5" />
                                      cada {r.repeatEveryDays} d
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-sm font-medium text-foreground mt-1 leading-snug">{r.title}</p>
                                <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-0.5">{r.detail}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </Section>
                  )}

                  {/* Plan nutricional por etapa */}
                  {result.nutritionPlan && (
                    <Section index={7} label="Plan nutricional por etapa">
                      {(() => {
                        const np = result.nutritionPlan;
                        const stage = stageMeta[np.stage] ?? stageMeta.desconocida;
                        return (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${stage.tone}`}>
                                <Sprout className="h-3 w-3" />
                                {stage.label}
                              </span>
                              {np.medium && np.medium !== "desconocido" ? (
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border/60 rounded-full px-2 py-0.5">
                                  Medio · {np.medium}
                                </span>
                              ) : null}
                              {np.targetEC ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground border border-border/60 rounded-full px-2 py-0.5">
                                  <Gauge className="h-3 w-3" /> EC {np.targetEC}
                                </span>
                              ) : null}
                              {np.targetPH ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground border border-border/60 rounded-full px-2 py-0.5">
                                  <Beaker className="h-3 w-3" /> pH {np.targetPH}
                                </span>
                              ) : null}
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">{np.stageNote}</p>

                            <ul className="space-y-2">
                              {np.products.map((p, i) => (
                                <li
                                  key={i}
                                  className="rounded-xl border border-border/60 bg-card/40 p-3 sm:p-4 flex gap-3"
                                >
                                  <span className="flex-shrink-0 h-9 w-9 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 flex items-center justify-center">
                                    <FlaskRound className="h-4 w-4" />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-medium text-foreground leading-snug">{p.name}</span>
                                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border/60 rounded-full px-1.5 py-0.5">
                                        {roleLabel[p.role] ?? p.role}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]">
                                      <span className="inline-flex items-center gap-1 text-gold">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Dosis</span>
                                        <span className="font-medium tabular-nums">{p.dose}</span>
                                      </span>
                                      <span className="inline-flex items-center gap-1 text-foreground/85">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Frecuencia</span>
                                        <span>{p.frequency}</span>
                                      </span>
                                    </div>
                                    {p.note ? (
                                      <p className="text-[11.5px] text-muted-foreground italic leading-relaxed mt-1">{p.note}</p>
                                    ) : null}
                                  </div>
                                </li>
                              ))}
                            </ul>

                            {np.warnings && np.warnings.length > 0 && (
                              <ul className="space-y-1.5 pt-1">
                                {np.warnings.map((w, i) => (
                                  <li key={i} className="flex gap-2 text-[11.5px] text-amber-200/90 leading-relaxed">
                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-amber-300" />
                                    <span>{w}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <p className="text-[10.5px] text-muted-foreground italic">
                              Dosis orientativas. Ajusta según las indicaciones de tu línea de nutrientes y la respuesta de la planta.
                            </p>
                          </div>
                        );
                      })()}
                    </Section>
                  )}

                  {/* Guardar planta (simulado) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || saved}
                      aria-live="polite"
                      className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border text-sm font-medium transition-smooth ${
                        saved
                          ? "bg-gold/15 border-gold/50 text-gold cursor-default"
                          : "bg-gold text-background border-gold hover:bg-gold/90 disabled:opacity-70"
                      }`}
                    >
                      {saved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4" />
                          Planta guardada · recordatorios activos
                        </>
                      ) : saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando…
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" />
                          Guardar planta y activar recordatorios
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-muted-foreground mt-2">
                      {saved
                        ? "Próximamente recibirás los avisos por email/push en cada fecha programada."
                        : "Tu jardín personal y los avisos automáticos llegarán en próximas versiones."}
                    </p>
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
      <PhotoGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
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
