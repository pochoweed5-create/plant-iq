import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/plantiq/Nav";
import { Hero } from "@/components/plantiq/Hero";
import { Diagnose } from "@/components/plantiq/Diagnose";
import { Features } from "@/components/plantiq/Features";
import { Elkar } from "@/components/plantiq/Elkar";
import { Pricing } from "@/components/plantiq/Pricing";
import { Footer } from "@/components/plantiq/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Diagnose />
      <Elkar />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
