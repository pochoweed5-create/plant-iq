import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/plantiq/Nav";
import { Hero } from "@/components/plantiq/Hero";
import { WowDemo } from "@/components/plantiq/WowDemo";
import { Diagnose } from "@/components/plantiq/Diagnose";
import { WhyElkarion } from "@/components/plantiq/WhyElkarion";
import { PestScan } from "@/components/plantiq/PestScan";
import { LiveActivity } from "@/components/plantiq/LiveActivity";
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
      <WowDemo />
      <WhyElkarion />
      <Diagnose />
      <PestScan />
      <LiveActivity />
      <Elkar />
      <Features />
      <Pricing />
      <Newsletter />
      <Footer />
    </main>
  );
}
