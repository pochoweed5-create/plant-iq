import { useState } from "react";
import { Mail, Sparkles, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().trim().email("Introduce un email válido").max(255);

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email inválido");
      setStatus("error");
      return;
    }
    setError(null);
    setStatus("loading");

    const { error: insertError } = await supabase
      .from("usuarios_beta")
      .insert({ correo_electronico: parsed.data.toLowerCase() });

    if (insertError) {
      // 23505 = unique_violation → ya estaba registrado, lo tratamos como éxito
      if (insertError.code === "23505") {
        setEmail("");
        setStatus("success");
        return;
      }
      setError("No se pudo completar el registro. Inténtalo de nuevo.");
      setStatus("error");
      return;
    }

    setEmail("");
    setStatus("success");
  }

  return (
    <section
      id="newsletter"
      className="relative overflow-hidden border-t border-border/40 py-24 sm:py-32 px-5 sm:px-8"
    >
      {/* Botanical blurred backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-hero opacity-60" />
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 65%)", opacity: 0.18 }}
        />
        <div className="absolute inset-0 grain" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-7">
          {[
            { icon: Sparkles, label: "Beta privada" },
            { icon: Mail, label: "IA Botánica" },
            { icon: ShieldCheck, label: "Mentor ELKAR" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/25 bg-card/40 backdrop-blur-md text-[11px] uppercase tracking-[0.18em] text-foreground/80"
            >
              <Icon className="h-3 w-3 text-gold" />
              {label}
            </span>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          {/* Left — pitch + form */}
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight">
              La inteligencia botánica
              <br />
              <span className="shimmer-gold italic">evoluciona.</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Recibe diagnósticos IA, mejoras de ELKARION, consejos de cultivo y
              acceso anticipado a nuevas funciones — directo de nuestro laboratorio.
            </p>

            <form onSubmit={onSubmit} className="mt-8 max-w-lg">
              <div className="group relative flex flex-col sm:flex-row items-stretch gap-2 sm:gap-1.5 p-1.5 rounded-2xl border border-border bg-card/60 backdrop-blur-xl shadow-card-soft transition-smooth focus-within:border-gold/50 focus-within:shadow-gold-glow">
                <div className="flex items-center gap-2 px-3 sm:px-4 flex-1">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="tu@cultivo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    disabled={status === "success"}
                    maxLength={255}
                    className="w-full bg-transparent py-3 sm:py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none disabled:opacity-60"
                    aria-label="Email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="group/btn inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-gold text-gold-foreground text-sm font-medium shadow-gold-glow transition-smooth hover:scale-[1.02] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {status === "success" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Dentro
                    </>
                  ) : (
                    <>
                      Acceso anticipado
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 min-h-[20px] flex items-center gap-1.5 text-xs">
                {status === "error" && error ? (
                  <span className="text-destructive">{error}</span>
                ) : status === "success" ? (
                  <span className="text-gold animate-fade-in">
                    ✅ ELKAR te ha añadido a la beta privada.
                  </span>
                ) : (
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Sin spam. Solo inteligencia botánica.
                  </span>
                )}
              </div>
            </form>

            {/* User counter */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "linear-gradient(135deg,#3a5b3a,#1a2a1a)",
                  "linear-gradient(135deg,#4a7a4a,#243424)",
                  "linear-gradient(135deg,#6fae6f,#2c402c)",
                ].map((bg, i) => (
                  <span
                    key={i}
                    className="h-7 w-7 rounded-full border border-background ring-1 ring-gold/20"
                    style={{ background: bg }}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium tabular-nums">12.847</span> cultivadores ya están dentro
                <span className="mx-2 text-gold/60">•</span>
                <span className="text-foreground/80">+312</span> esta semana
              </div>
            </div>
          </div>

          {/* Right — exclusive email preview card */}
          <div className="relative">
            <div className="relative rounded-3xl border border-border bg-leaf-card p-6 shadow-elegant overflow-hidden">
              <div
                aria-hidden
                className="absolute -top-20 -right-16 h-56 w-56 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)", opacity: 0.18 }}
              />

              <div className="relative">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 text-gold">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    Códex ELKARION · #042
                  </span>
                  <span>Vol. Botánico</span>
                </div>

                <h3 className="mt-4 font-serif text-2xl leading-tight">
                  Diagnóstico semanal: <span className="italic text-gold">deficiencias de fósforo</span>
                </h3>

                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Esta semana ELKAR analiza 1.200 hojas reales, identifica patrones tempranos
                  y recomienda ajustes de EC, pH y CalMag para tus cultivos en floración.
                </p>

                <ul className="mt-5 space-y-2.5">
                  {[
                    "Acceso anticipado: ELKAR Vision 2.0",
                    "3 ajustes precisos para semana 5 de flora",
                    "Caso clínico: rescate de Gorilla Glue #4",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-foreground/85">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Lectura · 4 min</span>
                  <span className="text-gold/80">Solo para suscriptores</span>
                </div>
              </div>
            </div>

            {/* Floating mini badge */}
            <div className="hidden sm:flex absolute -bottom-4 -left-4 items-center gap-2 px-3 py-2 rounded-xl border border-gold/30 bg-card/80 backdrop-blur-xl shadow-card-soft">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="text-[11px] uppercase tracking-[0.18em]">Edición exclusiva</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
