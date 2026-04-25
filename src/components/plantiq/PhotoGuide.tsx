import { useEffect } from "react";
import { X, Camera, Check, AlertTriangle } from "lucide-react";
import guideAngle from "@/assets/guide-angle.jpg";
import guideDistance from "@/assets/guide-distance.jpg";
import guideFraming from "@/assets/guide-framing.jpg";

type Step = {
  image: string;
  label: string;
  title: string;
  description: string;
  do: string[];
  dont: string[];
};

const steps: Step[] = [
  {
    image: guideAngle,
    label: "01 · Ángulo",
    title: "De frente, perpendicular a la hoja",
    description:
      "Coloca el móvil paralelo a la superficie de la hoja, no en diagonal. Un ángulo recto permite a ELKAR leer color y manchas con precisión.",
    do: ["Móvil paralelo a la hoja", "Pantalla mirando la cara superior", "Sostén el móvil firme"],
    dont: ["Fotos en picado o contrapicado", "Hojas inclinadas en el aire"],
  },
  {
    image: guideDistance,
    label: "02 · Distancia",
    title: "Acércate hasta unos 15-20 cm",
    description:
      "Suficiente cerca para distinguir textura, venas y manchas. Si tu cámara desenfoca, retrocede unos centímetros y mantén el pulso.",
    do: ["15-20 cm de la hoja", "Toca para enfocar", "Espera a que estabilice"],
    dont: ["Fotos lejanas de toda la planta", "Acercarse tanto que desenfoque"],
  },
  {
    image: guideFraming,
    label: "03 · Encuadre",
    title: "Hoja completa dentro del marco",
    description:
      "Encuadra la hoja entera con un pequeño margen alrededor. Los bordes y la punta dan pistas clave sobre nutrientes y plagas.",
    do: ["Hoja entera visible", "Pequeño margen alrededor", "Fondo neutro o uniforme"],
    dont: ["Hojas cortadas por el borde", "Varias plantas mezcladas en la foto"],
  },
];

export function PhotoGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guía de encuadre para tomar la foto"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-background/80 backdrop-blur animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card border border-border/60 shadow-elegant animate-in slide-in-from-bottom-6 duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-border/50 bg-card/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
              <Camera className="h-4 w-4 text-gold" />
            </span>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Modo guía</div>
              <div className="font-serif text-lg leading-tight">Cómo tomar la foto perfecta</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar guía"
            className="h-9 w-9 rounded-full border border-border hover:bg-accent transition-smooth flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="p-6 sm:p-8 space-y-8">
          {steps.map((step) => (
            <article key={step.label} className="grid sm:grid-cols-[200px_1fr] gap-5 sm:gap-6">
              <div className="rounded-2xl overflow-hidden border border-border/60 bg-leaf-card aspect-square">
                <img
                  src={step.image}
                  alt={`Ejemplo: ${step.title}`}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-gold mb-1">{step.label}</div>
                <h3 className="font-serif text-2xl leading-tight mb-2">{step.title}</h3>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">{step.description}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <ul className="space-y-1.5">
                    {step.do.map((d) => (
                      <li key={d} className="flex gap-2 text-sm text-foreground/85">
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-1.5">
                    {step.dont.map((d) => (
                      <li key={d} className="flex gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 text-red-400/80 flex-shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 sm:px-8 py-4 border-t border-border/50 bg-card/95 backdrop-blur flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Una buena foto puede multiplicar la precisión del diagnóstico.
          </p>
          <button
            onClick={onClose}
            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-[#0a1f14] text-sm font-medium hover:bg-gold/90 transition-smooth"
          >
            Entendido, tomar foto
          </button>
        </div>
      </div>
    </div>
  );
}