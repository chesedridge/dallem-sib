export default function FooterSection() {
  return (
    <section className="block w-full bg-[var(--color-bg-white)] px-5 pb-[60px] pt-[30px] md:hidden">
      <div className="mx-auto max-w-[1200px] text-left">
        <p className="text-[13px] leading-[1.5] text-[#666]">
          「경기도 직장인을 위한 멘탈케어 프로젝트」 지원사업에 관해
          <br />
          더 궁금하신 점은 무엇이든지 편하게 아래를 통해 문의해 주세요.
        </p>
        <p className="mt-3 text-[13px] text-[#666]">
          이메일 : support@clify.co.kr
        </p>

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
