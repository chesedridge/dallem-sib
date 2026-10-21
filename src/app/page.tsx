import BarriersSection from "@/components/BarriersSection";
import DataSection from "@/components/DataSection";
import HeroSection from "@/components/HeroSection";
import MainPageAnalyticsEvents from "@/components/MainPageAnalyticsEvents";

import DisclaimerSection from "@/components/DisclaimerSection";
import FAQSection from "@/components/FAQSection";
import ProcedureSection from "@/components/ProcedureSection";
import StickyCtaBar from "@/components/StickyCtaBar";

export default function Home() {
  return (
    <main className="bg-bg-warm">
      <MainPageAnalyticsEvents />
      <HeroSection />
      <BarriersSection />
      <DataSection />

      <ProcedureSection />
      <FAQSection />
      <DisclaimerSection />
      <StickyCtaBar />
    </main>
  );
}
