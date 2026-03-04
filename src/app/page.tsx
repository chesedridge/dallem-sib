import HeroSection from "@/components/HeroSection";
import ProjectInfoSection from "@/components/ProjectInfoSection";
import BarriersSection from "@/components/BarriersSection";
import BenefitImagesSection from "@/components/BenefitImagesSection";
import DataSection from "@/components/DataSection";

import ProcedureSection from "@/components/ProcedureSection";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProjectInfoSection />
      <BarriersSection />
      <BenefitImagesSection />
      <DataSection />

      <ProcedureSection />
      <FAQSection />
      <FooterSection />
    </main>
  );
}
