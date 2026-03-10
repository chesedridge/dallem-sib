import CtaButton from "@/components/CtaButton";

const INFO_ITEMS = [
  {
    label: "대상자",
    value:
      "무기력하고 번아웃 또는 우울감이 있는 경기도 직장인 or 경기도 거주자",
  },
  {
    label: "상담 방식",
    value: "비대면(전화 or 화상통화)",
  },
  {
    label: "지원 내용",
    value: "심리상담 4회",
  },
  {
    label: "참여 기간",
    value: "2025년",
  },
  {
    label: "참여 방법",
    value: "우울증 1분 테스트(PHQ9 테스트) 후 진단 결과에 따라 상담 신청",
  },
];

export default function ProjectInfoSection() {
  return (
    <section className="relative w-full bg-bg-warm-light">
      <div className="page-shell">
        <div className="mb-10 text-center leading-relaxed md:mb-14">
          <h2 className="section-heading">
            <span className="text-primary-strong">경기도 거주자, 직장인</span>을 위한
            <br />
            멘탈케어 프로젝트
          </h2>
        </div>

        <div className="mx-auto max-w-[600px] overflow-hidden rounded-[20px] border border-border-soft bg-bg-white px-8 py-4 shadow-[0_2px_12px_rgba(240,135,119,0.08)] md:max-w-[840px] md:rounded-[24px] md:px-20 md:py-6">
          {INFO_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 py-3 md:gap-4 md:py-4"
            >
              <span className="shrink-0 rounded-full bg-primary-pale px-4 py-1.5 text-[13px] font-bold text-primary-strong md:px-5 md:py-2 md:text-[16px]">
                {item.label}
              </span>
              <span className="text-[15px] leading-7 text-text-body md:text-[17px] md:leading-8">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="section-cta">
          <CtaButton>상담 신청하러 가기</CtaButton>
        </div>
      </div>
    </section>
  );
}
