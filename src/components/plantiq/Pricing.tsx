import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0€",
    desc: "Empieza a diagnosticar hoy mismo.",
    features: ["3 diagnósticos / mes", "Diario básico", "Alertas limitadas", "Acceso a concursos"],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "4,99€",
    suffix: "/ mes",
    desc: "Todo el poder de ELKAR sin límites.",
    features: [
      "Diagnósticos ilimitados",
      "Modo experto ELKAR AI",
      "Alertas de clima + cultivo",
      "Seguimiento ilimitado de plantas",
      "Acceso prioritario a sorteos",
    ],
    cta: "Probar Premium",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="precios" className="relative py-14 sm:py-20 px-5 sm:px-8 border-t border-border/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-gold">Precios</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-4">
            Empieza gratis. <span className="italic text-gold">Crece con Premium.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-8 sm:p-10 border transition-smooth ${
                p.highlighted
                  ? "bg-leaf-card border-gold/40 shadow-elegant"
                  : "bg-card/50 border-border/60"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-8 text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-gold text-gold-foreground font-medium">
                  Más popular
                </span>
              )}
              <div className="font-serif text-2xl">{p.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-serif text-5xl">{p.price}</span>
                {p.suffix && <span className="text-muted-foreground text-sm">{p.suffix}</span>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>

              <ul className="mt-7 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${p.highlighted ? "text-gold" : "text-primary"}`} />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#diagnostico"
                className={`mt-8 block text-center px-5 py-3 rounded-full font-medium transition-smooth ${
                  p.highlighted
                    ? "bg-gold text-gold-foreground shadow-gold-glow hover:scale-[1.02]"
                    : "bg-secondary hover:bg-accent text-foreground"
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
