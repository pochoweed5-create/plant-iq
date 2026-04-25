import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-full bg-leaf-card border border-gold/30 flex items-center justify-center">
            <Leaf className="h-3.5 w-3.5 text-gold" />
          </span>
          <span className="font-serif text-lg">Plant<span className="text-gold">IQ</span></span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Plant IQ · Diagnóstico inteligente con ELKAR AI
        </p>
      </div>
    </footer>
  );
}
