import { useEffect, useState } from "react";
import { Activity, Sparkles, Leaf } from "lucide-react";

const feed = [
  { tag: "Detección", text: "Trips identificados en Cannabis sativa · Madrid", tone: "warn" },
  { tag: "Diagnóstico", text: "Estrés hídrico detectado · Monstera · Barcelona", tone: "info" },
  { tag: "IA", text: "ELKAR aprendiendo nuevos patrones de oídio", tone: "ai" },
  { tag: "Detección", text: "Araña roja · severidad alta · Valencia", tone: "warn" },
  { tag: "Diagnóstico", text: "Carencia de magnesio · Tomate · Sevilla", tone: "info" },
  { tag: "IA", text: "Modelo botánico actualizado · v2.4.1", tone: "ai" },
];

export function LiveActivity() {
  const [count, setCount] = useState(1248);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3) + 1), 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % feed.length), 2200);
    return () => clearInterval(id);
  }, []);

  const visible = [0, 1, 2].map((o) => feed[(idx + o) % feed.length]);

  return (
    <section className="relative border-t border-border/40 py-20 sm:py-28 px-5 sm:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] rounded-full bg-gold/5 blur-[140px]" />
      </div>

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-gold">ELKARION en vivo</span>
          <h2 className="font-serif text-3xl sm:text-4xl mt-4 leading-tight">
            <span className="text-gold italic">{count.toLocaleString("es-ES")}</span>
            <br />
            diagnósticos realizados.
          </h2>
          <p className="mt-5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
            La IA botánica de ELKARION aprende cada día con cultivadores reales.
            Cada hoja analizada hace al modelo más preciso.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { icon: Activity, label: "IA activa 24/7" },
              { icon: Sparkles, label: "Modelo v2.4" },
              { icon: Leaf, label: "12.480 especies" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/25 bg-card/40 text-[11px] text-foreground/80 backdrop-blur"
              >
                <Icon className="h-3 w-3 text-gold" /> {label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-5 shadow-card-soft">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold">Actividad reciente</span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-soft" /> en vivo
            </span>
          </div>

          <ul className="space-y-2">
            {visible.map((item, i) => (
              <li
                key={`${idx}-${i}`}
                className="animate-fade-in flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 p-3"
              >
                <span
                  className={
                    "mt-1 h-2 w-2 rounded-full flex-shrink-0 " +
                    (item.tone === "warn"
                      ? "bg-destructive shadow-[0_0_8px_var(--destructive)]"
                      : item.tone === "ai"
                      ? "bg-gold shadow-[0_0_8px_var(--gold)]"
                      : "bg-foreground/60")
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.tag}</div>
                  <div className="text-sm text-foreground/90 truncate">{item.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}