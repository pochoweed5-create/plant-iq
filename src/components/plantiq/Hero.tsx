import heroLeaf from "@/assets/hero-leaf.jpg";
import { Sparkles, ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-hero pt-28 pb-20 sm:pt-36 sm:pb-28 grain">
      <div className="absolute inset-0 -z-0">
        <img
          src={heroLeaf}
          alt=""
          width={1920}
          height={1080}
          className="absolute right-[-10%] top-[5%] w-[80%] sm:w-[60%] object-cover opacity-40 sm:opacity-55 mix-blend-screen animate-float"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-card/40 backdrop-blur text-xs uppercase tracking-[0.18em] text-gold">
            <Sparkles className="h-3.5 w-3.5" /> ELKAR AI · Diagnóstico botánico
          </span>

          <h1 className="mt-6 font-serif text-5xl sm:text-7xl leading-[1.02] tracking-tight">
            Tu planta habla.
            <br />
            <span className="shimmer-gold italic">Nosotros traducimos.</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Sube una foto y descubre en segundos qué le pasa a tu cultivo.
            Diagnóstico inteligente con IA, soluciones paso a paso y un mentor
            experto en cannabis siempre a tu lado.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href="#diagnostico"
              className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-gold text-gold-foreground font-medium shadow-gold-glow hover:scale-[1.02] transition-smooth"
            >
              Diagnosticar mi planta
              <ArrowDown className="h-4 w-4 group-hover:translate-y-0.5 transition-smooth" />
            </a>
            <a href="#elkar" className="text-sm text-muted-foreground hover:text-foreground transition-smooth underline-offset-4 hover:underline">
              Conoce a ELKAR →
            </a>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md">
            {[
              { k: "98%", v: "Precisión IA" },
              { k: "<3s", v: "Diagnóstico" },
              { k: "24/7", v: "ELKAR contigo" },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-serif text-2xl text-gold">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
