import { Header } from "@/components/f-manager/Header";
import { Hero } from "@/components/f-manager/Hero";
import { TestimonialSection } from "@/components/f-manager/TestimonialSection";
import { FeaturesSection } from "@/components/f-manager/FeaturesSection";
import { TrustSection } from "@/components/f-manager/TrustSection";
import { PricingSection } from "@/components/f-manager/PricingSection";
import { FAQSection } from "@/components/f-manager/FAQSection";
import { Footer } from "@/components/f-manager/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <TestimonialSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
