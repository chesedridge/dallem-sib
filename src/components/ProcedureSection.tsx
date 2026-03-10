import CtaButton from "@/components/CtaButton";

const STEPS = [
  {
    num: "01",
    title: "테스트",
    description: "PHQ9 우울증 테스트 진행",
  },
  {
    num: "02",
    title: "맞춤 상담",
    description: "전문심리상담사 맞춤 상담을 진행해요",
  },
  {
    num: "03",
    title: "선물 증정",
    description: "상담 받고 선물받자!",
  },
  {
    num: "04",
    title: "최종 테스트",
    description: "4회 상담 마무리 후 테스트 진행",
  },
  {
    num: "05",
    title: "선물 증정",
    description: "우울감이 나아지신 분들에게는 축하 선물이 기다리고 있답니다",
  },
];

export default function ProcedureSection() {
  return (
    <section className="relative w-full bg-bg-warm">
      <div className="page-shell">
        <h2 className="section-heading text-center">신청 절차</h2>

        <div className="mx-auto mt-10 max-w-[600px] md:mt-14 md:max-w-[1080px]">
          {/* Mobile: vertical timeline */}
          <div className="flex flex-col md:hidden">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex gap-5">
                {/* Timeline line + circle */}
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-white">
                    {step.num}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-[2px] grow bg-primary/20" />
                  )}
                </div>
                {/* Content */}
                <div className={i < STEPS.length - 1 ? "pb-8" : ""}>
                  <p className="mt-1 text-[18px] font-bold tracking-[-0.02em] text-text-dark">
                    {step.title}
                  </p>
                  <p className="mt-1.5 text-[15px] leading-6 text-text-sub">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block">
            <div className="relative flex">
              {/* Connecting line: from center of first circle to center of last */}
              <div className="absolute left-[10%] right-[10%] top-[36px] h-[2px] bg-primary/20" />
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className="relative z-10 flex flex-1 flex-col items-center gap-6"
                >
                  <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-primary text-[20px] font-bold text-white shadow-[0_4px_16px_rgba(240,135,119,0.25)]">
                    {step.num}
                  </div>
                  <div className="w-full px-2 text-center">
                    <p className="text-[20px] font-bold tracking-[-0.02em] text-text-dark">
                      {step.title}
                    </p>
                    <p className="mx-auto mt-2 max-w-[160px] text-[16px] leading-6 text-text-sub">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-cta">
          <CtaButton>상담 신청하러 가기</CtaButton>
        </div>
      </div>
    </section>
  );
}
