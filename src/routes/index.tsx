import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/plantiq/Nav";
import { Hero } from "@/components/plantiq/Hero";
import { Diagnose } from "@/components/plantiq/Diagnose";
import { WhyVerdara } from "@/components/plantiq/WhyVerdara";
import { PestScan } from "@/components/plantiq/PestScan";
import { Features } from "@/components/plantiq/Features";
import { Elkar } from "@/components/plantiq/Elkar";
import { Pricing } from "@/components/plantiq/Pricing";
import { Newsletter } from "@/components/plantiq/Newsletter";
import { Footer } from "@/components/plantiq/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <WhyVerdara />
      <Diagnose />
      <PestScan />
      <Elkar />
      <Features />
      <Pricing />
      <Newsletter />
      <Footer />
    </main>
  );
}
