import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { pestScan } from "@/utils/pestscan.functions";
import {
  Bug, ShieldAlert, ScanLine, Upload, Loader2, AlertTriangle,
  CloudDrizzle, Sparkles, Target, Activity, X, Wind, Thermometer,
} from "lucide-react";

type Result = Awaited<ReturnType<typeof pestScan>>;
type OkResult = Extract<Result, { ok: true }>;

const severityTone: Record<string, string> = {
  leve: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
  moderado: "text-amber-200 border-amber-400/40 bg-amber-500/10",
  grave: "text-rose-300 border-rose-400/40 bg-rose-500/10",
};
const riskTone: Record<string, string> = {
  bajo: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
  medio: "text-amber-200 border-amber-400/30 bg-amber-500/10",
  alto: "text-rose-300 border-rose-400/30 bg-rose-500/10",
};
const propagationTone: Record<string, string> = {
  lenta: "text-emerald-300",
  media: "text-amber-200",
  "rápida": "text-rose-300",
};

const pestLibrary = [
  { name: "Trips", glyph: "🪲", signs: "Puntos plateados, hojas bronceadas", phase: "Vegetativo / Floración" },
  { name: "Araña roja", glyph: "🕸️", signs: "Telarañas finas, puntos amarillos", phase: "Calor + baja humedad" },
  { name: "Mosca blanca", glyph: "🦟", signs: "Insectos al sacudir, melaza", phase: "Indoor / invernadero" },
  { name: "Pulgones", glyph: "🐛", signs: "Brotes pegajosos, hormigas", phase: "Primavera vegetativo" },
  { name: "Oruga", glyph: "🐍", signs: "Mordidas grandes, excrementos", phase: "Floración tardía" },
  { name: "Oídio", glyph: "🍥", signs: "Polvo blanco en hojas", phase: "Humedad alta nocturna" },
];

const preventiveAlerts = [
  { icon: Wind, title: "Baja humedad", forecast: "Posible aparición de araña roja en 48h.", tone: "text-amber-200" },
  { icon: Thermometer, title: "Calor + estancamiento", forecast: "Condiciones favorables para hongos.", tone: "text-rose-300" },
  { icon: CloudDrizzle, title: "Rocío persistente", forecast: "Riesgo de botritis en cogollos densos.", tone: "text-fuchsia-300" },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

const scanMessages = [
  "Inicializando escáner biológico…",
  "Mapeando patrones de daño…",
  "Comparando con biblioteca de plagas…",
  "Cruzando señales visuales…",
  "Calculando probabilidades…",
];

export function PestScan() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const scan = useServerFn(pestScan);

  useEffect(() => {
    if (!loading) return setMsgIdx(0);
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % scanMessages.length), 900);
    return () => clearInterval(id);
  }, [loading]);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      setResult({ ok: false, error: "Imagen >8MB." });
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    setResult(null);
    setLoading(true);
    try {
      const r = await scan({ data: { imageBase64: dataUrl } });
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
    if (inputRef.current) inputRef.current.value = "";
  }

  const ok = result && result.ok ? (result as OkResult) : null;

  return (
    <section
      id="pestscan"
      className="relative py-14 sm:py-20 px-5 sm:px-8 border-t border-border/40 overflow-hidden"
    >
      {/* Ambient backdrop */}
      <div className="absolute inset-0 -z-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-[480px] h-[480px] rounded-full bg-gold/5 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-rose-500/5 blur-[140px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Heading */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
            <Bug className="h-3.5 w-3.5" /> PestScan · IA Botánica
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">
            Detecta la plaga{" "}
            <span className="italic text-gold">aunque el insecto no aparezca.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            ELKARION analiza mordidas, manchas, telarañas, deformaciones y patrones
            biológicos para identificar al culpable con probabilidad, gravedad y
            velocidad de propagación.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
          {/* Scanner panel */}
          <div className="rounded-3xl bg-card/50 backdrop-blur border border-border/60 shadow-elegant overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-gold/60 animate-ping" />
                  <span className="relative h-2 w-2 rounded-full bg-gold" />
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Escáner activo</span>
              </div>
              {preview && (
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <X className="h-3 w-3" /> Reiniciar
                </button>
              )}
            </div>

            {!preview ? (
              <div className="p-5 sm:p-6 space-y-5">
                <label className="block cursor-pointer">
                  <div className="rounded-2xl border-2 border-dashed border-gold/30 bg-leaf-card/40 p-8 text-center hover:border-gold/60 transition-smooth">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
                      <Upload className="h-5 w-5 text-gold" />
                    </div>
                    <div className="font-serif text-xl">Sube una hoja sospechosa</div>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                      Mordidas, manchas, agujeros o decoloración. La IA hace el resto.
                    </p>
                    <span className="inline-flex mt-5 items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-gold-foreground text-sm font-medium shadow-gold-glow">
                      <ScanLine className="h-4 w-4" /> Iniciar escáner
                    </span>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                  />
                </label>

                {/* Example demo preview when idle */}
                <div className="rounded-2xl border border-gold/15 bg-background/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> Última detección · demo
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-300">·  Confianza 94%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Trips", val: "Severidad media", tone: "text-amber-300", border: "border-amber-400/40" },
                      { name: "Mosca blanca", val: "Riesgo bajo", tone: "text-emerald-300", border: "border-emerald-400/40" },
                      { name: "Oídio", val: "Probabilidad 32%", tone: "text-sky-300", border: "border-sky-400/40" },
                    ].map((d) => (
                      <div key={d.name} className={`rounded-xl border ${d.border} bg-card/50 px-3 py-2.5`}>
                        <div className="text-[11px] font-medium text-foreground/95">{d.name}</div>
                        <div className={`text-[10px] mt-0.5 ${d.tone}`}>{d.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { k: "1.248", v: "Puntos analizados" },
                      { k: "<2.4s", v: "Tiempo medio" },
                      { k: "12.4k", v: "Refs biológicas" },
                    ].map((s) => (
                      <div key={s.v} className="text-center rounded-lg bg-leaf-card/60 border border-border/40 py-2">
                        <div className="font-serif text-base text-gold">{s.k}</div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-6 space-y-5">
                {/* Image with overlay */}
                <div className="relative rounded-2xl overflow-hidden border border-gold/20 bg-black">
                  <img src={preview} alt="" className="w-full max-h-[420px] object-contain" />
                  {/* Scanner line */}
                  {loading && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_20px_var(--gold)] animate-scanline" />
                      <div className="absolute inset-0 bg-[linear-gradient(transparent_0,transparent_calc(100%-1px),oklch(0.7_0.15_145/0.12)_100%)] bg-[length:100%_24px]" />
                    </>
                  )}
                  {/* Damage zones */}
                  {ok?.damagedZones?.map((z, i) => (
                    <div
                      key={i}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: `${z.x}%`, top: `${z.y}%` }}
                    >
                      <span
                        className="block rounded-full border-2 border-rose-400/80 shadow-[0_0_18px_rgba(244,63,94,0.6)] animate-pulse-soft"
                        style={{ width: `${Math.max(28, z.radius * 4)}px`, height: `${Math.max(28, z.radius * 4)}px` }}
                      />
                      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[10px] uppercase tracking-wider text-rose-200 bg-black/70 px-1.5 py-0.5 rounded">
                        {z.label}
                      </span>
                    </div>
                  ))}
                </div>

                {loading && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    <span key={msgIdx} className="animate-fade-in">{scanMessages[msgIdx]}</span>
                  </div>
                )}

                {result && !result.ok && (
                  <div className="flex items-start gap-2 text-sm rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-rose-200">
                    <AlertTriangle className="h-4 w-4 mt-0.5" /> {result.error}
                  </div>
                )}

                {ok && (
                  <div className="space-y-4">
                    {/* Headline */}
                    <div className="rounded-2xl border border-gold/30 bg-leaf-card p-4 shadow-gold-glow">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-gold flex items-center gap-2">
                        <Sparkles className="h-3 w-3" /> ELKAR
                      </div>
                      <p className="mt-1.5 text-base sm:text-lg leading-snug">{ok.headline}</p>
                      {ok.elkar && (
                        <p className="mt-2 text-sm text-muted-foreground">{ok.elkar}</p>
                      )}
                    </div>

                    {/* Confidence */}
                    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Confianza del diagnóstico
                        </span>
                        <span className="text-2xl font-serif text-gold tabular-nums">{ok.confidence}%</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold/70 to-gold transition-all duration-700"
                          style={{ width: `${ok.confidence}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Patrones compatibles detectados en {ok.patternsFound} zona{ok.patternsFound === 1 ? "" : "s"}.
                      </p>
                    </div>

                    {/* Candidates */}
                    <div className="space-y-2">
                      {ok.candidates.map((c, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-border/60 bg-card/40 p-3.5 hover:border-gold/40 transition-smooth"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Target className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                              <span className="font-medium truncate">{c.name}</span>
                            </div>
                            <span className="text-sm font-serif text-gold tabular-nums">{c.probability}%</span>
                          </div>
                          <div className="mt-2 h-1 rounded-full bg-secondary/60 overflow-hidden">
                            <div
                              className="h-full bg-gold/80"
                              style={{ width: `${c.probability}%` }}
                            />
                          </div>
                          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
                            <span className={`px-2 py-0.5 rounded-full border ${severityTone[c.severity]}`}>
                              {c.severity}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full border ${riskTone[c.risk]}`}>
                              riesgo {c.risk}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full border border-border/60 bg-background/40 ${propagationTone[c.propagation]}`}>
                              <Activity className="inline h-2.5 w-2.5 mr-1" />
                              {c.propagation}
                            </span>
                          </div>
                          {c.signals?.length > 0 && (
                            <ul className="mt-2 text-[11px] text-muted-foreground space-y-0.5">
                              {c.signals.slice(0, 3).map((s, j) => (
                                <li key={j} className="flex gap-1.5">
                                  <span className="text-gold">·</span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Treatment */}
                    {ok.treatment.length > 0 && (
                      <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                        <div className="text-[11px] uppercase tracking-wider text-gold mb-2 flex items-center gap-1.5">
                          <ShieldAlert className="h-3 w-3" /> Plan de acción
                        </div>
                        <ol className="space-y-1.5 text-sm">
                          {ok.treatment.map((t, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-gold tabular-nums">{i + 1}.</span>
                              <span className="text-foreground/85">{t}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Preventive */}
                    {ok.preventive.length > 0 && (
                      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
                        <div className="text-[11px] uppercase tracking-wider text-amber-200 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3" /> Predicción 24-72h
                        </div>
                        <ul className="space-y-1 text-sm text-amber-100/90">
                          {ok.preventive.map((p, i) => (
                            <li key={i}>· {p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side: library + preventive alerts */}
          <div className="space-y-6">
            {/* Pest library */}
            <div className="rounded-3xl bg-card/40 backdrop-blur border border-border/60 p-5 sm:p-6 shadow-card-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Biblioteca</span>
                  <h3 className="font-serif text-2xl mt-1">Plagas conocidas</h3>
                </div>
                <span className="text-[10px] text-muted-foreground">+120 patrones</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {pestLibrary.map((p) => (
                  <div
                    key={p.name}
                    className="group rounded-xl border border-border/60 bg-background/30 p-3 hover:border-gold/40 hover:bg-leaf-card/60 transition-smooth"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl group-hover:scale-110 transition-smooth">{p.glyph}</span>
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground leading-snug">{p.signs}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gold/70">{p.phase}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preventive forecasts */}
            <div className="rounded-3xl bg-card/40 backdrop-blur border border-border/60 p-5 sm:p-6 shadow-card-soft">
              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Predicción preventiva</span>
                <h3 className="font-serif text-2xl mt-1">Antes de que aparezcan</h3>
              </div>
              <div className="space-y-2.5">
                {preventiveAlerts.map(({ icon: Icon, title, forecast, tone }) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-xl border border-border/60 bg-background/30 p-3 hover:border-gold/40 transition-smooth"
                  >
                    <div className="h-9 w-9 rounded-lg bg-leaf-card border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <Icon className={`h-4 w-4 ${tone}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{title}</div>
                      <div className="text-[12px] text-muted-foreground leading-snug">{forecast}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
