import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { diagnosePlant } from "@/utils/diagnose.functions";
import { Upload, Loader2, AlertTriangle, CheckCircle2, Clock, Sparkles, RotateCcw, Sun, Focus, Crop, Leaf, Camera, Droplets, FlaskConical, Eye, Stethoscope, Bell, BellRing, Repeat, Sprout, FlaskRound, Beaker, Gauge, AlertCircle, Activity, ShieldAlert, TrendingUp, X, RefreshCw, Check, ImageIcon, SwitchCamera } from "lucide-react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { PhotoGuide } from "./PhotoGuide";

type Result = Awaited<ReturnType<typeof diagnosePlant>>;
type OkResult = Extract<Result, { ok: true }>;

const severityColor: Record<string, string> = {
  leve: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
  moderado: "text-amber-200 border-amber-400/40 bg-amber-500/10",
  grave: "text-red-300 border-red-400/40 bg-red-500/10",
};

const urgencyMeta: Record<string, { dot: string; label: string; tone: string; emoji: string }> = {
  baja: {
    dot: "bg-emerald-400",
    label: "Urgencia baja",
    tone: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
    emoji: "🟢",
  },
  media: {
    dot: "bg-amber-300",
    label: "Urgencia media",
    tone: "text-amber-200 border-amber-400/40 bg-amber-500/10",
    emoji: "🟡",
  },
  alta: {
    dot: "bg-rose-400",
    label: "Urgencia alta",
    tone: "text-rose-300 border-rose-400/40 bg-rose-500/10",
    emoji: "🔴",
  },
};

const statusMeta: Record<string, { label: string; emoji: string; tone: string; sectionLabel: string }> = {
  sana: {
    label: "Planta sana",
    emoji: "✅",
    tone: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
    sectionLabel: "Estado de la planta",
  },
  leve: {
    label: "Leve desviación",
    emoji: "⚠️",
    tone: "text-amber-200 border-amber-400/40 bg-amber-500/10",
    sectionLabel: "Detalle a vigilar",
  },
  problema: {
    label: "Problema detectado",
    emoji: "❗",
    tone: "text-rose-300 border-rose-400/40 bg-rose-500/10",
    sectionLabel: "Problema detectado",
  },
};

const issueTypeLabel: Record<string, string> = {
  exceso: "Exceso (agua / nutrientes)",
  carencia: "Carencia (N, P, K, microelementos)",
  estres: "Estrés ambiental (luz, calor, viento)",
  plaga: "Plaga / enfermedad",
  ninguno: "Sin tipología",
};

const phaseMeta: Record<string, { label: string; tone: string }> = {
  plantula: { label: "Plántula", tone: "text-emerald-200 border-emerald-400/30 bg-emerald-500/10" },
  vegetativo: { label: "Vegetativo", tone: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10" },
  floracion: { label: "Floración", tone: "text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-500/10" },
  desconocida: { label: "Fase por confirmar", tone: "text-muted-foreground border-border/60 bg-card/40" },
};

const riskMeta: Record<string, { label: string; tone: string; emoji: string }> = {
  ninguno: { label: "Sin riesgo", tone: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10", emoji: "✅" },
  bajo: { label: "Riesgo bajo", tone: "text-emerald-200 border-emerald-400/30 bg-emerald-500/10", emoji: "🟢" },
  medio: { label: "Riesgo medio", tone: "text-amber-200 border-amber-400/30 bg-amber-500/10", emoji: "⚠️" },
  alto: { label: "Riesgo alto", tone: "text-rose-300 border-rose-400/30 bg-rose-500/10", emoji: "⚠️" },
};

function confidenceTier(c: number): { label: string; tone: string; barClass: string } {
  if (c >= 85) return { label: "Alta", tone: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10", barClass: "bg-emerald-400" };
  if (c >= 60) return { label: "Media", tone: "text-amber-200 border-amber-400/40 bg-amber-500/10", barClass: "bg-amber-300" };
  return { label: "Baja", tone: "text-rose-300 border-rose-400/40 bg-rose-500/10", barClass: "bg-rose-400" };
}

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

type TodayAction = {
  kind: "fertilizar" | "pk" | "ph-ec" | "lavar" | "riego" | "revision" | "tratamiento" | "observar";
  title: string;
  detail: string;
  icon: typeof Droplets;
  tone: string;
  badge: string;
};

function getTodayAction(r: OkResult): TodayAction {
  const np = r.nutritionPlan;
  const stage = np?.stage ?? "desconocida";

  // 1. Lavado de raíces si la etapa lo indica explícitamente
  if (stage === "lavado") {
    return {
      kind: "lavar",
      title: "Lava las raíces hoy",
      detail: "Riega solo con agua a pH correcto hasta drenar 20-30% del volumen. Sin nutrientes.",
      icon: Droplets,
      tone: "text-sky-300 border-sky-400/40 bg-sky-500/10",
      badge: "Lavado",
    };
  }

  // 2. Recordatorios programados para HOY (inDays <= 0)
  const dueToday = r.reminders?.filter((x) => x.inDays <= 0) ?? [];
  const dueFert = dueToday.find((x) => x.type === "fertilizacion");
  const dueTrat = dueToday.find((x) => x.type === "tratamiento");
  const dueRiego = dueToday.find((x) => x.type === "riego");
  const dueRev = dueToday.find((x) => x.type === "revision");

  // 3. PK booster si está en floración/engorde y el plan lo incluye
  const hasPK = np?.products?.some((p) => p.role === "pk-booster");
  if (hasPK && (stage === "floracion" || stage === "engorde") && (dueFert || !dueTrat)) {
    const pk = np!.products.find((p) => p.role === "pk-booster")!;
    return {
      kind: "pk",
      title: "Añade PK booster hoy",
      detail: `${pk.name} · ${pk.dose} · ${pk.frequency}. Ajusta pH tras mezclar.`,
      icon: FlaskConical,
      tone: "text-fuchsia-300 border-fuchsia-400/40 bg-fuchsia-500/10",
      badge: "PK",
    };
  }

  // 4. Tratamiento prioritario si está vencido hoy
  if (dueTrat) {
    return {
      kind: "tratamiento",
      title: dueTrat.title,
      detail: dueTrat.detail,
      icon: Stethoscope,
      tone: "text-rose-300 border-rose-400/40 bg-rose-500/10",
      badge: "Tratamiento",
    };
  }

  // 5. Fertilización programada hoy
  if (dueFert) {
    return {
      kind: "fertilizar",
      title: dueFert.title,
      detail: dueFert.detail,
      icon: FlaskConical,
      tone: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
      badge: "Fertilizar",
    };
  }

  // 6. Si la causa apunta a pH/EC o corrector pH presente
  const causeText = `${r.cause} ${r.problem}`.toLowerCase();
  const hasPhFix = np?.products?.some((p) => p.role === "corrector-ph");
  if (causeText.includes("ph") || causeText.includes("ec") || causeText.includes("salinidad") || hasPhFix) {
    return {
      kind: "ph-ec",
      title: "Revisa pH y EC del riego",
      detail: `Mide antes de regar. Objetivo${np?.targetPH ? ` pH ${np.targetPH}` : ""}${np?.targetEC ? ` · EC ${np.targetEC}` : ""}. Ajusta antes de aplicar nutrientes.`,
      icon: Beaker,
      tone: "text-amber-200 border-amber-400/40 bg-amber-500/10",
      badge: "pH / EC",
    };
  }

  // 7. Riego programado hoy
  if (dueRiego) {
    return {
      kind: "riego",
      title: dueRiego.title,
      detail: dueRiego.detail,
      icon: Droplets,
      tone: "text-sky-300 border-sky-400/40 bg-sky-500/10",
      badge: "Riego",
    };
  }

  // 8. Revisión hoy
  if (dueRev) {
    return {
      kind: "revision",
      title: dueRev.title,
      detail: dueRev.detail,
      icon: Eye,
      tone: "text-amber-200 border-amber-400/40 bg-amber-500/10",
      badge: "Revisión",
    };
  }

  // 9. Sin acción crítica: observar
  const next = [...(r.reminders ?? [])].sort((a, b) => a.inDays - b.inDays)[0];
  return {
    kind: "observar",
    title: "Hoy: solo observa",
    detail: next
      ? `Sin acción nutricional crítica. Próxima tarea: ${next.title.toLowerCase()} ${formatWhen(next.inDays).toLowerCase()}.`
      : "Sin acción nutricional crítica. Mantén el régimen actual y vigila la planta.",
    icon: Eye,
    tone: "text-emerald-200 border-emerald-400/30 bg-emerald-500/10",
    badge: "Observar",
  };
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
  const galleryRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [guideOpen, setGuideOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const diagnose = useServerFn(diagnosePlant);

  const loadingMessages = [
    "Analizando planta...",
    "Detectando anomalías...",
    "Evaluando salud...",
    "Revisando hojas y color...",
    "Preparando diagnóstico...",
  ];
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!loading) {
      setLoadingMsgIdx(0);
      return;
    }
    const id = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % loadingMessages.length);
    }, 1100);
    return () => clearInterval(id);
  }, [loading]);

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

                  {/* Acciones de captura */}
                  <div
                    className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-smooth ${
                      allChecked ? "border-gold/50 bg-leaf-card/40" : "border-border/60 bg-background/20 opacity-60"
                    }`}
                  >
                    <div className="text-center mb-5">
                      <p className="font-serif text-xl">
                        {allChecked ? "Captura tu planta" : "Confirma el checklist primero"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        {allChecked
                          ? "Acerca la cámara a las hojas y enfoca bien los detalles."
                          : "Marca los 4 puntos para activar la captura."}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={!allChecked}
                        onClick={() => allChecked && setCameraOpen(true)}
                        className={`group flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-5 transition-smooth ${
                          allChecked
                            ? "border-gold/50 bg-gold/10 text-gold hover:bg-gold/15 cursor-pointer"
                            : "border-border/60 bg-background/20 text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        <span className={`h-12 w-12 rounded-full border flex items-center justify-center ${
                          allChecked ? "border-gold/50 bg-gold/15" : "border-border bg-muted/20"
                        }`}>
                          <Camera className="h-5 w-5" />
                        </span>
                        <span className="text-base font-medium">📸 Hacer foto</span>
                        <span className="text-[11px] text-muted-foreground">Cámara en vivo</span>
                      </button>
                      <button
                        type="button"
                        disabled={!allChecked}
                        onClick={() => allChecked && galleryRef.current?.click()}
                        className={`group flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-5 transition-smooth ${
                          allChecked
                            ? "border-border hover:border-gold/40 bg-background/30 hover:bg-leaf-card/40 cursor-pointer"
                            : "border-border/60 bg-background/20 text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        <span className={`h-12 w-12 rounded-full border flex items-center justify-center ${
                          allChecked ? "border-border bg-muted/20 text-foreground" : "border-border bg-muted/20 text-muted-foreground"
                        }`}>
                          <ImageIcon className="h-5 w-5" />
                        </span>
                        <span className="text-base font-medium">🖼️ Subir desde galería</span>
                        <span className="text-[11px] text-muted-foreground">JPG · PNG · máx. 8 MB</span>
                      </button>
                    </div>
                    <ul className="mt-5 grid sm:grid-cols-3 gap-1.5 text-[11px] text-muted-foreground">
                      <li className="flex items-center gap-1.5"><Sun className="h-3 w-3 text-gold/70" /> Evita sombras fuertes</li>
                      <li className="flex items-center gap-1.5"><Focus className="h-3 w-3 text-gold/70" /> Haz la foto de cerca</li>
                      <li className="flex items-center gap-1.5"><Leaf className="h-3 w-3 text-gold/70" /> Muestra las hojas afectadas</li>
                    </ul>
                  </div>
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
              <input
                ref={galleryRef}
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
                <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                  <div className="relative h-20 w-20 mb-5">
                    <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-gold/10 flex items-center justify-center">
                      <Leaf className="h-7 w-7 text-gold animate-pulse" />
                    </div>
                  </div>
                  <p className="font-serif text-xl text-foreground transition-opacity duration-300">
                    {loadingMessages[loadingMsgIdx]}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <div className="mt-5 w-full max-w-[220px] h-1 rounded-full bg-gold/10 overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-gold to-transparent"
                      style={{ animation: "elkar-loader 1.4s ease-in-out infinite" }}
                    />
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-4">
                    ELKAR · análisis en curso
                  </p>
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
                  {/* Header: planta + estado principal */}
                  {(() => {
                    const status = statusMeta[result.status] ?? statusMeta.problema;
                    const phase = phaseMeta[result.growthPhase] ?? phaseMeta.desconocida;
                    const conf = Math.max(0, Math.min(100, Math.round(result.confidence ?? 0)));
                    const tier = confidenceTier(conf);
                    const urg = urgencyMeta[result.urgency] ?? urgencyMeta.media;
                    return (
                      <div>
                        {/* Indicador de urgencia destacado */}
                        {result.status !== "sana" && (
                          <div className={`mb-3 rounded-xl border px-3 py-2 flex items-center gap-2.5 ${urg.tone}`}>
                            <span className="relative flex h-3 w-3 flex-shrink-0">
                              <span className={`absolute inline-flex h-full w-full rounded-full ${urg.dot} opacity-60 ${result.urgency === "alta" ? "animate-ping" : ""}`} />
                              <span className={`relative inline-flex rounded-full h-3 w-3 ${urg.dot}`} />
                            </span>
                            <span className="text-[11px] uppercase tracking-[0.18em] font-medium">
                              {urg.emoji} {urg.label}
                            </span>
                            <span className="text-[11px] text-foreground/70 ml-auto">
                              {result.urgency === "alta" ? "Actúa ya" : result.urgency === "media" ? "Atiende esta semana" : "Sin prisa"}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">{result.plant}</span>
                          <span className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${status.tone}`}>
                            <span aria-hidden>{status.emoji}</span>
                            Estado · {status.label}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${phase.tone}`}>
                            <Sprout className="h-3 w-3" />
                            Fase · {phase.label}
                          </span>
                          {result.status === "problema" && (
                            <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColor[result.severity] ?? severityColor.moderado}`}>
                              Gravedad {result.severity}
                            </span>
                          )}
                        </div>

                        {/* Confianza del diagnóstico */}
                        <div className={`mt-3 rounded-xl border p-3 sm:p-3.5 ${tier.tone}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Activity className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="text-[11px] uppercase tracking-wider opacity-90">
                                Confianza del diagnóstico · {tier.label}
                              </span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums text-foreground">{conf}%</span>
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-background/40 overflow-hidden">
                            <div className={`h-full ${tier.barClass} transition-all`} style={{ width: `${conf}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Riesgo próximo */}
                  {result.nearRisk && (() => {
                    const r = riskMeta[result.nearRisk.level] ?? riskMeta.ninguno;
                    const isRisk = result.nearRisk.level !== "ninguno";
                    return (
                      <div className={`rounded-2xl border p-4 ${r.tone}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          {isRisk ? <ShieldAlert className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                          <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">Riesgo próximo · 24-72h</span>
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-current/40 bg-background/20">
                            {r.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-foreground/90 leading-relaxed">
                          <span aria-hidden className="mr-1">{r.emoji}</span>
                          {result.nearRisk.message}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Acción nutricional de hoy */}
                  {result.status !== "sana" && (() => {
                    const action = getTodayAction(result);
                    const Icon = action.icon;
                    return (
                      <div className={`rounded-2xl border p-4 sm:p-5 ${action.tone}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">Hoy · acción nutricional</span>
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-current/40 bg-background/20">
                            {action.badge}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 h-11 w-11 rounded-full border border-current/40 bg-background/20 flex items-center justify-center">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-serif text-lg sm:text-xl leading-snug text-foreground">{action.title}</p>
                            <p className="text-[12.5px] text-foreground/80 leading-relaxed mt-1">{action.detail}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 1. Estado / Problema */}
                  <Section index={1} label={statusMeta[result.status]?.sectionLabel ?? "Diagnóstico"}>
                    <h3 className="font-serif text-2xl sm:text-3xl leading-tight text-foreground">
                      {result.problem}
                    </h3>
                    {result.status === "problema" && result.issueType && result.issueType !== "ninguno" && (
                      <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                        Tipo · <span className="text-gold normal-case tracking-normal">{issueTypeLabel[result.issueType] ?? result.issueType}</span>
                      </p>
                    )}
                  </Section>

                  {/* 2. Explicación */}
                  <Section index={2} label="Explicación">
                    <p className="text-sm text-foreground/85 leading-relaxed">{result.explanation}</p>
                  </Section>

                  {/* 3. Causa probable / Por qué se ve así */}
                  <Section index={3} label={result.status === "sana" ? "Por qué se ve sana" : "Causa probable"}>
                    <div className="rounded-xl bg-leaf-card/60 border border-border/50 p-4">
                      <p className="text-sm text-foreground/85 leading-relaxed">{result.cause}</p>
                    </div>
                  </Section>

                  {/* 4. Acciones recomendadas */}
                  <Section index={4} label={result.status === "sana" ? "Mantenimiento recomendado" : "Acción recomendada · paso a paso"}>
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

                  {/* 5. Recuperación / Próxima revisión */}
                  <Section index={5} label={result.status === "sana" ? "Próxima revisión" : "Tiempo de recuperación"}>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gold" />
                      <span className="text-foreground/90">{result.recovery}</span>
                      {result.status !== "sana" && (
                        <span className="text-muted-foreground">· urgencia {result.urgency}</span>
                      )}
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
      {cameraOpen && (
        <CameraCapture
          onClose={() => setCameraOpen(false)}
          onCapture={async (file) => {
            setCameraOpen(false);
            await onFile(file);
          }}
        />
      )}
    </section>
  );
}

function CameraCapture({ onClose, onCapture }: { onClose: () => void; onCapture: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [starting, setStarting] = useState(true);

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function start(mode: "environment" | "user") {
    stop();
    setStarting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e) {
      setError(
        e instanceof Error && e.name === "NotAllowedError"
          ? "Permiso de cámara denegado. Usa la galería o habilita el permiso en tu navegador."
          : "No pudimos acceder a la cámara. Usa la galería como alternativa.",
      );
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    start(facing);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing]);

  function takeShot() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(v.videoWidth, v.videoHeight));
    const w = Math.round(v.videoWidth * scale);
    const h = Math.round(v.videoHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setShot(dataUrl);
  }

  function confirmShot() {
    if (!shot) return;
    fetch(shot)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], `plantiq-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      });
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium">Hacer foto</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-border hover:bg-accent transition-smooth"
          aria-label="Cerrar cámara"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        {error ? (
          <div className="text-center px-6 max-w-sm">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
            <p className="text-sm text-foreground/90">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 text-sm px-4 py-2 rounded-full bg-gold/15 border border-gold/40 text-gold hover:bg-gold/20 transition-smooth"
            >
              Volver y usar galería
            </button>
          </div>
        ) : shot ? (
          <img src={shot} alt="Vista previa" className="max-h-full max-w-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="max-h-full max-w-full object-contain"
            />
            {/* Guía de encuadre */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[78%] aspect-square max-w-md rounded-2xl border-2 border-gold/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
            <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-background/70 border border-border/60 text-[11px] text-foreground/90">
              Acerca la cámara a las hojas y enfoca bien los detalles
            </div>
            {starting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-7 w-7 text-gold animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      {!error && (
        <div className="px-5 py-5 border-t border-border/60 bg-card/40">
          {shot ? (
            <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setShot(null)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-border hover:bg-accent transition-smooth text-sm"
              >
                <RefreshCw className="h-4 w-4" /> Repetir
              </button>
              <button
                type="button"
                onClick={confirmShot}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gold text-leaf-deep font-medium hover:bg-gold/90 transition-smooth text-sm"
              >
                <Check className="h-4 w-4" /> Usar esta foto
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
                className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-border hover:bg-accent transition-smooth"
                aria-label="Cambiar cámara"
              >
                <SwitchCamera className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={takeShot}
                disabled={starting}
                className="h-16 w-16 rounded-full bg-gold border-4 border-background hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-elegant"
                aria-label="Capturar"
              />
              <span className="h-11 w-11" aria-hidden />
            </div>
          )}
        </div>
      )}
    </div>
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
