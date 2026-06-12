import { useEffect, useState } from "react";
import { Droplets, Leaf, Activity, AlertTriangle, CheckCircle2, Sun } from "lucide-react";
import heroLeaf from "@/assets/hero-leaf.jpg";

const plantQuotes = [
  { icon: Droplets, text: "Detecto estrés hídrico — riégame en 6h.", tone: "text-sky-300", dot: "bg-sky-400" },
  { icon: Leaf, text: "Necesito más nitrógeno en las hojas bajas.", tone: "text-amber-200", dot: "bg-amber-300" },
  { icon: CheckCircle2, text: "Estoy sana. Todo dentro del rango óptimo.", tone: "text-emerald-300", dot: "bg-emerald-400" },
  { icon: Sun, text: "Demasiada luz directa al mediodía.", tone: "text-orange-300", dot: "bg-orange-400" },
  { icon: AlertTriangle, text: "Posible plaga en el envés — revísame.", tone: "text-rose-300", dot: "bg-rose-400" },
];

const vitals = [
  { label: "Humedad", value: 62, unit: "%", color: "from-sky-400 to-cyan-300" },
  { label: "Nutrientes", value: 78, unit: "%", color: "from-emerald-400 to-gold" },
  { label: "Luz", value: 84, unit: "%", color: "from-amber-300 to-orange-400" },
];

export function Elkar() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % plantQuotes.length), 3200);
    return () => clearInterval(id);
  }, []);
  const current = plantQuotes[idx];
  const Icon = current.icon;

  return (
    <section id="elkar" className="relative py-14 sm:py-20 px-5 sm:px-8 border-t border-border/40 overflow-hidden">
      <div className="absolute inset-0 -z-0 opacity-60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
      </div>
      <div className="relative max-w-6xl mx-auto grid md:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-gold">Voz botánica · IA</span>
          <h2 className="font-serif text-5xl sm:text-6xl mt-4 leading-[1.05]">
            Tu planta <span className="italic shimmer-gold">habla</span>.
            <br />
            ELKAR la traduce.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Cada hoja emite señales: color, textura, simetría, brillo. ELKAR
            convierte esas señales biológicas en frases claras, accionables y
            humanas. Como si tu planta tuviera voz propia.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Lectura biométrica en tiempo real",
              "Lenguaje natural — sin tecnicismos",
              "Alertas predictivas 24/7",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          {/* Plant card */}
          <div className="relative rounded-3xl overflow-hidden border border-gold/25 shadow-elegant bg-leaf-card">
            <div className="relative aspect-[4/5]">
              <img src={heroLeaf} alt="Planta hablando con ELKAR" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />

              {/* HUD top */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-background/70 border border-gold/30 text-gold text-[10px] uppercase tracking-[0.2em] backdrop-blur">
                  ELKAR · Listening
                </span>
                <span className="px-2.5 py-1 rounded-full bg-background/70 border border-emerald-400/40 text-emerald-300 text-[10px] uppercase tracking-[0.2em] backdrop-blur flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                  en vivo
                </span>
              </div>

              {/* Speech bubble */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 sm:left-6 sm:right-6">
                <div key={idx} className="relative animate-fade-in">
                  <div className="rounded-2xl rounded-bl-sm bg-background/85 backdrop-blur border border-gold/30 px-4 py-3.5 shadow-gold-glow">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold">
                      <span className={`h-1.5 w-1.5 rounded-full ${current.dot} animate-pulse-soft`} />
                      Mi planta dice
                    </div>
                    <div className="mt-2 flex items-start gap-2.5">
                      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${current.tone}`} />
                      <p className="text-sm sm:text-[15px] text-foreground/95 leading-snug">
                        "{current.text}"
                      </p>
                    </div>
                  </div>
                  <span className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 bg-background/85 border-r border-b border-gold/30" />
                </div>
              </div>

              {/* Vitals strip */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-background/80 backdrop-blur border border-gold/20 p-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold mb-2.5">
                  <Activity className="h-3 w-3" /> Bio-señales
                </div>
                <div className="space-y-2">
                  {vitals.map((v) => (
                    <div key={v.label} className="flex items-center gap-3">
                      <span className="w-16 text-[10px] uppercase tracking-wider text-muted-foreground">{v.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${v.color}`}
                          style={{ width: `${v.value}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-[11px] font-mono text-foreground/90">
                        {v.value}{v.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating mini stat */}
          <div className="hidden sm:block absolute -bottom-4 -left-4 rounded-2xl bg-leaf-card border border-gold/30 px-4 py-3 shadow-gold-glow">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Confianza IA</div>
            <div className="font-serif text-2xl text-foreground">96%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
