import { useEffect, useState } from "react";
import heroLeaf from "@/assets/hero-leaf.jpg";
import logo from "@/assets/elkarion-logo.png.asset.json";
import { Sparkles, ArrowRight, Activity } from "lucide-react";

const elkarMessages = [
  { icon: "⚠️", text: "ELKAR detecta estrés hídrico." },
  { icon: "⚡", text: "Actúa ahora — 48h críticas." },
  { icon: "🌱", text: "Tu planta aún puede recuperarse." },
  { icon: "🧬", text: "Analizando patrones biológicos…" },
  { icon: "✦", text: "Diagnóstico completo en 2.4s." },
];

export function Hero() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % elkarMessages.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const current = elkarMessages[msgIndex];

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-hero pt-28 pb-24 sm:pt-36 sm:pb-32 grain"
    >
      {/* Background imagery */}
      <div className="absolute inset-0 -z-0">
        <img
          src={heroLeaf}
          alt=""
          width={1920}
          height={1080}
          className="absolute right-[-15%] top-[2%] w-[95%] sm:w-[65%] object-cover opacity-30 sm:opacity-50 mix-blend-screen blur-[2px] sm:blur-0 animate-float"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute block rounded-full bg-gold/40 blur-[1px] animate-particle"
            style={{
              left: `${(i * 73) % 100}%`,
              top: `${(i * 41) % 100}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${10 + (i % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-card/50 backdrop-blur text-[10px] sm:text-xs uppercase tracking-[0.22em] text-gold">
            <Sparkles className="h-3.5 w-3.5" /> ELKARION · Grow Intelligence
          </span>

          <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.02] sm:text-7xl tracking-tight">
            Tu planta habla.
            <br />
            <span className="shimmer-gold italic">ELKARION la entiende.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-foreground/80 max-w-xl leading-relaxed">
            Detecta problemas antes de que aparezcan. Analiza tu planta en
            segundos con IA botánica avanzada — y deja que ELKAR, tu mentor
            digital, te guíe en cada paso.
          </p>

          {/* ELKAR live card */}
          <div className="mt-8 max-w-md rounded-2xl bg-leaf-card border border-gold/20 p-4 shadow-elegant backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-gold/30 blur-md animate-pulse-soft" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-leaf-card border border-gold/40 overflow-hidden shadow-gold-glow">
                  <img src={logo} alt="ELKAR" className="h-11 w-11 object-cover scale-[1.6]" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold">ELKAR AI</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-foreground/60">
                    <Activity className="h-2.5 w-2.5 text-gold" /> en vivo
                  </span>
                </div>
                <div key={msgIndex} className="mt-1 text-sm text-foreground/90 animate-fade-in flex items-center gap-2">
                  <span className="text-base">{current.icon}</span>
                  <span className="truncate">{current.text}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a
              href="#newsletter"
              className="group relative inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gold text-gold-foreground font-medium shadow-gold-glow hover:scale-[1.02] active:scale-[0.99] transition-smooth overflow-hidden"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <span className="relative">Probar beta privada</span>
              <ArrowRight className="relative h-4 w-4 group-hover:translate-x-0.5 transition-smooth" />
            </a>
            <a
              href="#wow-demo"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-gold/30 bg-card/40 backdrop-blur text-sm text-foreground/90 hover:border-gold/60 hover:bg-card/70 transition-smooth"
            >
              Ver demo IA →
            </a>
          </div>

          <div className="mt-12 sm:mt-14 grid grid-cols-3 gap-6 max-w-md">
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
