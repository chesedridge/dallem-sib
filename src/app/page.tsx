import BarriersSection from "@/components/BarriersSection";
import AnalyticsStats from "@/components/AnalyticsStats";
import DataSection from "@/components/DataSection";
import HeroSection from "@/components/HeroSection";
import MainPageAnalyticsEvents from "@/components/MainPageAnalyticsEvents";

import DisclaimerSection from "@/components/DisclaimerSection";
import FAQSection from "@/components/FAQSection";
import ProcedureSection from "@/components/ProcedureSection";

export default function Home() {
  return (
    <main>
      <MainPageAnalyticsEvents />
      <HeroSection />
      <AnalyticsStats />
      <BarriersSection />
      <DataSection />

      <ProcedureSection />
      <FAQSection />
      <DisclaimerSection />
    </main>
  );
}
