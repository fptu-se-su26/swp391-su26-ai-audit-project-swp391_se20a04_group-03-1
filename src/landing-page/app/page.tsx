import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { CoreCapabilities } from "@/components/landing/CoreCapabilities";
import { Stats } from "@/components/landing/Stats";
import { Footer } from "@/components/landing/Footer";
import { FAB } from "@/components/landing/FAB";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <Hero />
      <CoreCapabilities />
      <Stats />
      <Footer />
      <FAB />
    </>
  );
}
