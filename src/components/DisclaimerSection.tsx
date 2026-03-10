export default function DisclaimerSection() {
  return (
    <section className="w-full bg-bg-gray">
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-10 md:py-20">
        <p className="text-center text-[16px] leading-[1.8] font-bold tracking-[-0.02em] text-text-sub md:text-[25px] md:leading-[1.8]">
          <span className="md:hidden">
            이 프로젝트는 상업적 광고나 유료 서비스가 아닙니다. 당신의 마음을
            최우선으로 생각하는 공공 지원 프로그램으로, 사회공헌 자금을 통해
            상담 전 회차 무상 제공되는 전문 상담 서비스입니다.
          </span>
          <span className="hidden md:inline">
            이 프로젝트는 상업적 광고나 유료 서비스가 아닙니다.
            <br />
            당신의 마음을 최우선으로 생각하는 공공 지원 프로그램으로,
            <br />
            사회공헌 자금을 통해 상담 전 회차 무상 제공되는 전문 상담
            서비스입니다.
          </span>
        </p>
      </div>
    </section>
  );
}
