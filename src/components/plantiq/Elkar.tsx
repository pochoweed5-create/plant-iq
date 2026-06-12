import { MessageCircle } from "lucide-react";

export function Elkar() {
  return (
    <section id="elkar" className="relative py-14 sm:py-20 px-5 sm:px-8 border-t border-border/40 overflow-hidden">
      <div className="absolute inset-0 -z-0 opacity-60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
      </div>
      <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-gold">Modo experto</span>
          <h2 className="font-serif text-5xl sm:text-6xl mt-4 leading-[1.05]">
            Conoce a <span className="italic shimmer-gold">ELKAR</span>.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Sabio. Directo. Botánico de corazón. ELKAR es tu mentor digital:
            responde tus dudas, guía tu cultivo y propone soluciones avanzadas
            como un experto que llevas en el bolsillo.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Diagnóstico conversacional ilimitado",
              "Recomendaciones personalizadas por fase de cultivo",
              "Detección temprana de plagas y deficiencias",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl bg-leaf-card border border-gold/20 p-6 shadow-elegant">
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="bg-secondary/80 rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%]">
                  Mis hojas tienen las puntas amarillas, ¿qué hago?
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-3.5 w-3.5 text-gold-foreground" />
                </div>
                <div className="bg-background/60 border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%]">
                  <span className="text-gold text-xs uppercase tracking-wider">ELKAR</span>
                  <p className="mt-1 text-foreground/90 leading-relaxed">
                    Suena a <em>quemado por nutrientes</em>. Reduce el EC un 20%,
                    haz un lavado de raíces con agua a pH 6.2 y observa 48h.
                    ¿Indoor u outdoor?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
