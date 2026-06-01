import { useEffect, useState } from "react";
import { Upload, Scan, Sparkles, AlertTriangle, Activity, ShieldCheck } from "lucide-react";
import heroLeaf from "@/assets/hero-leaf.jpg";
import logo from "@/assets/elkarion-logo.png.asset.json";

const steps = [
  { icon: Upload, label: "Subiendo imagen…", detail: "hoja_planta.jpg · 2.1MB" },
  { icon: Scan, label: "Escaneando patrones biológicos…", detail: "Analizando 1.248 puntos de daño" },
  { icon: Sparkles, label: "Cruzando con base botánica…", detail: "12.480 referencias visuales" },
  { icon: AlertTriangle, label: "Diagnóstico generado", detail: "Confianza · 91%" },
];

const elkarLines = [
  "⚠️ Posible ataque de trips detectado.",
  "📊 Confianza del diagnóstico: 91%.",
  "🌱 Actúa ahora para evitar propagación.",
];

export function WowDemo() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [lineIdx, setLineIdx] = useState(0);

  // Step cycle
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (steps.length + 1)), 1800);
    return () => clearInterval(id);
  }, []);

  // Typing effect for ELKAR
  useEffect(() => {
    if (step < steps.length) return;
    const target = elkarLines[lineIdx];
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(id);
        setTimeout(() => setLineIdx((l) => (l + 1) % elkarLines.length), 1600);
      }
    }, 30);
    return () => clearInterval(id);
  }, [step, lineIdx]);

  const done = step >= steps.length;

  return (
    <section
      id="wow-demo"
      className="relative overflow-hidden border-t border-border/40 py-24 sm:py-32 px-5 sm:px-8"
    >
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gold/5 blur-[160px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-gold">Demo IA · En vivo</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">
            Sube una foto. <span className="italic shimmer-gold">ELKARION hace el resto.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Mira cómo la IA escanea, detecta y diagnostica el daño en segundos —
            con precisión de laboratorio botánico.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-8">
          {/* Scanner mockup */}
          <div className="relative rounded-3xl bg-leaf-card border border-gold/20 p-3 sm:p-4 shadow-elegant overflow-hidden">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] rounded-2xl overflow-hidden bg-background">
              <img src={heroLeaf} alt="Hoja escaneada" className="absolute inset-0 h-full w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />

              {/* Scan line */}
              {!done && (
                <div className="absolute left-0 right-0 h-[2px] bg-gold shadow-[0_0_20px_4px_var(--gold)] animate-scanline" />
              )}

              {/* Detection markers when done */}
              {done && (
                <>
                  <span className="absolute top-[28%] left-[34%] h-12 w-12 rounded-full border-2 border-destructive/80 animate-pulse-soft" />
                  <span className="absolute top-[55%] left-[58%] h-10 w-10 rounded-full border-2 border-destructive/80 animate-pulse-soft" />
                  <span className="absolute top-[42%] left-[20%] h-8 w-8 rounded-full border-2 border-gold/70 animate-pulse-soft" />
                </>
              )}

              {/* HUD top */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
                <span className="px-2 py-1 rounded-full bg-background/70 border border-gold/30 text-gold backdrop-blur">ELKARION · Scan</span>
                <span className="px-2 py-1 rounded-full bg-background/70 border border-border/60 text-foreground/80 backdrop-blur flex items-center gap-1">
                  <Activity className="h-3 w-3 text-gold" /> en vivo
                </span>
              </div>

              {/* HUD bottom — current step */}
              <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-background/80 backdrop-blur border border-gold/20 p-3">
                {!done ? (
                  <div className="flex items-center gap-3 animate-fade-in" key={step}>
                    {(() => {
                      const S = steps[step] ?? steps[steps.length - 1];
                      const Icon = S.icon;
                      return (
                        <>
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-card border border-gold/30 text-gold">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-foreground/90 truncate">{S.label}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{S.detail}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 animate-fade-in">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 border border-destructive/40 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-foreground">Trips · severidad media</div>
                      <div className="text-[10px] text-muted-foreground">Confianza 91% · propagación 48h</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ELKAR diagnosis card */}
          <div className="rounded-3xl bg-card/40 border border-border/50 p-6 sm:p-7 shadow-card-soft backdrop-blur-sm flex flex-col">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-gold/30 blur-md animate-pulse-soft" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-leaf-card border border-gold/40 overflow-hidden shadow-gold-glow">
                  <img src={logo} alt="ELKAR" className="h-11 w-11 object-cover scale-[1.6]" />
                </span>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold">ELKAR AI</div>
                <div className="text-xs text-muted-foreground">Mentor botánico · respondiendo</div>
              </div>
            </div>

            <div className="mt-5 min-h-[3.5rem] text-base text-foreground/90 leading-relaxed">
              {done ? (
                <span>{typed}<span className="inline-block w-1.5 h-4 ml-0.5 bg-gold align-middle animate-pulse-soft" /></span>
              ) : (
                <span className="text-muted-foreground">Esperando análisis…</span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "91%", v: "Confianza" },
                { k: "Media", v: "Severidad" },
                { k: "48h", v: "Propagación" },
              ].map((m) => (
                <div key={m.v} className="rounded-xl border border-border/50 bg-background/40 p-3">
                  <div className="font-serif text-xl text-gold">{m.k}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">{m.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-gold/20 bg-leaf-card p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold">
                <ShieldCheck className="h-3.5 w-3.5" /> Plan de acción
              </div>
              <ul className="mt-3 space-y-2 text-sm text-foreground/85">
                <li>· Aplicar jabón potásico al amanecer.</li>
                <li>· Revisar envés de hojas cada 24h.</li>
                <li>· Aumentar humedad ambiental al 60%.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}