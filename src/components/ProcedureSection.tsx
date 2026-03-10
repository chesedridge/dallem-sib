import CtaButton from "@/components/CtaButton";
import { ProcedureTimeline } from "@/components/VectorArtwork";

export default function ProcedureSection() {
  return (
    <section className="relative w-full bg-bg-gray">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-[104px]">
        <h2 className="text-center text-[22px] font-bold leading-relaxed text-[#363636] md:text-[36px]">
          신청 절차
        </h2>

        <div className="mx-auto mt-5 max-w-full md:hidden">
          <ProcedureTimeline compact />
        </div>

        <div className="mx-auto mt-5 hidden md:block md:max-w-[1000px]">
          <ProcedureTimeline />
        </div>

        <div className="mt-[30px] text-center">
          <CtaButton>상담 신청하러 가기</CtaButton>
        </div>
      </div>
    </section>
  );
}
