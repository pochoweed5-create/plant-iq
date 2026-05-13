import { ShieldAlert, Eye, Clock, Zap, LineChart, Sparkles } from "lucide-react";

const blocks = [
  { icon: ShieldAlert, title: "Evita perder cosechas", desc: "Anticípate al daño irreversible con alertas tempranas." },
  { icon: Eye, title: "Detecta problemas invisibles", desc: "La IA ve lo que el ojo humano aún no puede percibir." },
  { icon: Clock, title: "Ahorra semanas de errores", desc: "Decisiones correctas desde el primer día de cultivo." },
  { icon: Zap, title: "Diagnóstico en segundos", desc: "Análisis botánico instantáneo, precisión de laboratorio." },
  { icon: LineChart, title: "Seguimiento visual", desc: "Memoria fotográfica de cada planta y su evolución." },
  { icon: Sparkles, title: "Mentor ELKAR 24/7", desc: "Consejos personalizados según fase, especie y entorno." },
];

export function WhyVerdara() {
  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 border-t border-border/40 overflow-hidden">
      <div className="absolute inset-0 -z-0 opacity-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gold/5 blur-[140px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14 sm:mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-gold">¿Por qué VERDARA?</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">
            Protege tus plantas <span className="italic shimmer-gold">antes de que sea tarde.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Cada hoja cuenta una historia. VERDARA la traduce en datos, alertas
            y acciones concretas para que nunca más cultives a ciegas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {blocks.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative rounded-2xl bg-card/40 border border-border/50 p-6 sm:p-7 hover:border-gold/40 hover:bg-card/70 transition-smooth shadow-card-soft overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold/10 blur-3xl opacity-0 group-hover:opacity-100 transition-smooth" />
              <div className="relative h-11 w-11 rounded-xl bg-leaf-card border border-gold/20 flex items-center justify-center mb-5 group-hover:shadow-gold-glow transition-smooth">
                <Icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="relative font-serif text-xl mb-2">{title}</h3>
              <p className="relative text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
