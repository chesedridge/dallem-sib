import CtaButton from "@/components/CtaButton";

export default function FooterSection() {
  return (
    <section className="block w-full bg-bg-warm-light px-5 pb-16 pt-8 md:hidden">
      <div className="mx-auto max-w-[1200px] text-center">
        <p className="text-2xl leading-6 text-text-sub">
          「경기도 직장인을 위한 멘탈케어 프로젝트」 지원사업에 관해
          <br />
          더 궁금하신 점은 무엇이든지 편하게 아래를 통해 문의해 주세요.
        </p>
        <p className="mt-2 text-[13px] leading-6 text-text-sub">
          이메일 : support@clify.co.kr
        </p>

        <div className="section-cta">
          <CtaButton>상담 신청하러 가기</CtaButton>
        </div>
      </div>
    </section>
  );
}
