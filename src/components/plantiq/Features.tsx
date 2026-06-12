import { Camera, BookOpen, Bell, CloudRain, Trophy, Sprout } from "lucide-react";

const features = [
  { icon: Camera, title: "Diagnóstico por imagen", desc: "Análisis IA de hojas, manchas, color y forma en segundos." },
  { icon: Sprout, title: "Diario de cultivo", desc: "Guarda cada planta y sigue su evolución con fotos periódicas." },
  { icon: Bell, title: "Alertas de cultivo", desc: "Recordatorios de riego, fertilización y cambios de ciclo." },
  { icon: CloudRain, title: "Alertas meteo", desc: "Heladas, olas de calor y lluvia según tu ubicación." },
  { icon: Trophy, title: "Concursos & sorteos", desc: "Mejor planta del mes, mutación más curiosa y premios." },
  { icon: BookOpen, title: "Base de conocimiento", desc: "Biblioteca visual de plagas, deficiencias y enfermedades." },
];

export function Features() {
  return (
    <section id="features" className="relative py-14 sm:py-20 px-5 sm:px-8 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-gold">Todo en una app</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">
            Más que un diagnóstico. <span className="italic text-gold">Un mentor completo.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative rounded-2xl bg-card/50 border border-border/50 p-7 hover:border-gold/40 hover:bg-card/80 transition-smooth shadow-card-soft"
            >
              <div className="h-11 w-11 rounded-xl bg-leaf-card border border-gold/20 flex items-center justify-center mb-5 group-hover:shadow-gold-glow transition-smooth">
                <Icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-serif text-xl mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
