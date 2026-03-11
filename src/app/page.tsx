import BarriersSection from "@/components/BarriersSection";
import DataSection from "@/components/DataSection";
import HeroSection from "@/components/HeroSection";

import DisclaimerSection from "@/components/DisclaimerSection";
import FAQSection from "@/components/FAQSection";
import ProcedureSection from "@/components/ProcedureSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <BarriersSection />
      <DataSection />

      <ProcedureSection />
      <FAQSection />
      <DisclaimerSection />
    </main>
  );
}
