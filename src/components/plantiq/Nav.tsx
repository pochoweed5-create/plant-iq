import { Link } from "@tanstack/react-router";
import logo from "@/assets/verdara-logo.png";

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-gold/15">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-card border border-gold/30 overflow-hidden shadow-gold-glow">
            <img src={logo} alt="VERDARA" className="h-9 w-9 object-cover scale-[1.6]" />
          </span>
          <span className="font-sans text-base tracking-[0.32em] font-light">VER<span className="text-gold">D</span>ARA</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#diagnostico" className="hover:text-foreground transition-smooth">Diagnóstico</a>
          <a href="#elkar" className="hover:text-foreground transition-smooth">ELKAR AI</a>
          <a href="#features" className="hover:text-foreground transition-smooth">Funciones</a>
          <a href="#precios" className="hover:text-foreground transition-smooth">Precios</a>
        </nav>
        <Link
          to="/chat"
          className="text-sm px-4 py-2 rounded-full bg-gold text-gold-foreground font-medium hover:opacity-90 transition-smooth shadow-gold-glow"
        >
          Hablar con ELKAR
        </Link>
      </div>
    </header>
  );
}
