const RESULT_ITEMS = [
  {
    icon: "/archive_files/53db9bc135f5f.png",
    text: "4회기 심리상담 진행 후, 주요 지표들에서 유의미한 변화가 나타남",
  },
  {
    icon: "/archive_files/776839dc32f54.png",
    text: "우울, 불안, 스트레스, 외로움 등 부정 정서가 유의하게 감소함",
  },
  {
    icon: "/archive_files/f533ba74e335c.png",
    text: "자아존중감, 회복탄력성, 삶의 만족도는 유의하게 상승함",
  },
];

export default function DataSection() {
  return (
    <section className="relative w-full bg-[var(--color-bg-gray)]">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-[104px]">
        <h2 className="text-center text-[22px] font-bold leading-relaxed text-[var(--color-text-body)] md:text-[36px]">상담 받으면 정말 나아질까?</h2>
        <p className="mt-2 text-center text-[18px] leading-relaxed text-[var(--color-text-body)] md:text-[30px]">
          심리상담의 효과와 필요성에 대해 확신이
          <br className="md:hidden" />
          없으셨다면 아래 데이터를 확인해 보세요.
        </p>

        {/* Mobile Charts */}
        <div className="my-[30px] flex flex-col gap-[30px] md:hidden">
          <div className="text-center">
            <img src="/archive_files/5a0501750c81b.png" alt="긍정 정서 증진 효과 차트" className="mx-auto w-full max-w-[615px]" />
            <p className="mt-[10px] text-center text-[18px] font-bold text-[var(--color-text-sub)] md:text-[24px]">긍정 정서 증진 효과</p>
          </div>
          <div className="text-center">
            <img src="/archive_files/ed2badd6fb32b.png" alt="부정 정서 감소 효과 차트" className="mx-auto w-full max-w-[615px]" />
            <p className="mt-[10px] text-center text-[18px] font-bold text-[var(--color-text-sub)] md:text-[24px]">부정 정서 감소 효과</p>
          </div>
        </div>

        {/* PC Charts */}
        <div className="my-[50px] hidden md:flex md:flex-row md:gap-[40px]">
          <div className="flex-1 text-center">
            <img src="/archive_files/2020334cf52c5.png" alt="긍정 정서 증진 효과 차트" className="mx-auto w-full max-w-[615px]" />
            <p className="mt-[10px] text-center text-[18px] font-bold text-[var(--color-text-sub)] md:text-[24px]">긍정 정서 증진 효과</p>
          </div>
          <div className="flex-1 text-center">
            <img src="/archive_files/93445f534cb7e.png" alt="부정 정서 감소 효과 차트" className="mx-auto w-full max-w-[615px]" />
            <p className="mt-[10px] text-center text-[18px] font-bold text-[var(--color-text-sub)] md:text-[24px]">부정 정서 감소 효과</p>
          </div>
        </div>

        <div className="my-[40px] rounded-2xl bg-white px-6 py-[30px] md:mx-auto md:my-[60px] md:max-w-[800px] md:p-[40px]">
          <p className="mb-[20px] text-center text-[18px] font-bold text-[var(--color-text-body)] md:text-[30px]">심리상담의 주요 성과</p>
          {RESULT_ITEMS.map((item) => (
            <div key={item.text} className="flex items-start py-[10px]">
              <img src={item.icon} alt="" className="mt-[2px] h-[24px] w-[24px] shrink-0 basis-[15%] object-none object-left-top md:basis-[31.3%]" />
              <span className="shrink-0 basis-[85%] text-[16px] leading-relaxed md:basis-[68.7%] md:text-[24px]">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="mb-[10px] mt-[30px] text-center">
          <p className="text-[22px] font-bold leading-relaxed md:text-[40px] md:leading-relaxed">이 모든변화는 당신도 경험할 수 있습니다.</p>
        </div>

        <div className="mt-5 text-center">
          <a
            href="https://clify-app.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-[var(--color-primary)] px-10 py-4 text-center text-[18px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e06f05]"
          >
            지금 무료로 시작해보세요
          </a>
        </div>
      </div>
    </section>
  );
}
