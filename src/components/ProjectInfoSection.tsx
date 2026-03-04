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
    <section className="relative w-full bg-[var(--color-bg-warm)]">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-[104px]">
        <div className="mb-[18px] text-center leading-relaxed">
          <h2 className="text-[22px] font-bold md:text-[30px]">
            <span className="text-[var(--color-primary)]">경기도 거주자, 직장인</span>을 위한
            <br />
            멘탈케어 프로젝트
          </h2>
        </div>

        <div className="mb-6 flex flex-col gap-2 md:mx-auto md:max-w-[70%]">
          {INFO_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-2 rounded-xl bg-white p-[15px] md:px-10 md:py-5"
            >
              <span className="shrink-0 basis-[25%] text-[15px] font-bold text-[var(--color-primary)] md:basis-[15%] md:text-[22px]">
                {item.label}
              </span>
              <span className="shrink-0 basis-[75%] text-[15px] text-[var(--color-text-body)] md:basis-[50%] md:text-[22px]">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <a
            href="https://clify-app.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-[var(--color-primary)] px-10 py-4 text-center text-[18px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e06f05]"
          >
            상담 신청하러 가기
          </a>
        </div>
      </div>
    </section>
  );
}
