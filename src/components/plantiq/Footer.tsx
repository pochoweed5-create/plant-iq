import logo from "@/assets/verdara-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-gold/10 py-12 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg bg-leaf-card border border-gold/30 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="VERDARA" className="h-8 w-8 object-cover scale-[1.6]" />
          </span>
          <span className="font-sans tracking-[0.3em] text-sm">VER<span className="text-gold">D</span>ARA</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} VERDARA · Grow Intelligence · ELKAR AI
        </p>
      </div>
    </footer>
  );
}
