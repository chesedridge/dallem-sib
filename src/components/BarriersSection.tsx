const BARRIER_ITEMS = [
  {
    icon: "/archive_files/53db9bc135f5f.png",
    text: "상담 비용 부담 때문에 주저 하셨던 분들",
  },
  {
    icon: "/archive_files/776839dc32f54.png",
    text: "익명 보장이 어려워 망설이셨던 분들",
  },
  {
    icon: "/archive_files/f533ba74e335c.png",
    text: "상담 효과에 대한 확신이 없어 망설이셨던 분들",
  },
  {
    icon: "/archive_files/01d66f56890cb.png",
    text: "접근성 여건으로 상담 기관을 찾기 어려우셨던 분들",
  },
  {
    icon: "/archive_files/5788d37ac6714.png",
    text: "정신질환에 대한 낙인과 편견으로 상담을 망설이셨던 분들",
  },
];

export default function BarriersSection() {
  return (
    <section className="relative w-full bg-[var(--color-bg-white)]">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-[104px]">
        <p className="mb-[30px] text-center text-[20px] font-bold leading-relaxed text-[var(--color-text-body)] md:text-[36px]">
          우울, 불안 등 정서적 어려움을 겪고 계신
          <br />
          <span className="text-[var(--color-primary-light)]">
            경기도 직장인 및 경기도 거주자를 위한
          </span>
          <br />
          <span className="text-[var(--color-primary-light)]">
            「경기도 직장인을 위한 멘탈케어 프로젝트」
          </span>
          <br />
          시작되었습니다.
        </p>

        <div className="mb-[30px] rounded-2xl bg-[var(--color-bg-warm-light)] px-6 py-[30px] md:mx-auto md:mb-[40px] md:max-w-[800px] md:p-[40px]">
          <p className="mb-[20px] text-center text-[18px] font-bold text-[var(--color-text-body)] md:text-[24px]">
            그동안 상담을 받고 싶어도
          </p>

          {BARRIER_ITEMS.map((item) => (
            <div key={item.text} className="flex items-start py-[10px]">
              <img
                src={item.icon}
                alt=""
                className="mt-[2px] h-[24px] w-[24px] shrink-0 basis-[15%] object-none object-left-top md:basis-[35px]"
              />
              <span className="shrink-0 basis-[85%] text-[16px] leading-relaxed md:basis-[65%] md:text-[24px]">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-[10px] mt-[30px] text-center">
          <p className="text-[22px] font-bold leading-relaxed md:text-[36px]">
            이제 더 이상 미루지 마세요.
          </p>
        </div>

        <div className="mt-5 text-center">
          <a
            href="https://clify-app.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-[var(--color-primary)] px-10 py-4 text-center text-[18px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e06f05]"
          >
            우울증 1분 테스트 바로가기
          </a>
        </div>
      </div>
    </section>
  );
}
