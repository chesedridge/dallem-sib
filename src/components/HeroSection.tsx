import CtaButton from "@/components/CtaButton";
import {
  HeroBackdrop,
  HeroBadgeChip,
  HeroFeatureStrip,
  MouseArrowIcon,
} from "@/components/VectorArtwork";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full overflow-hidden bg-[#efd8a2]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.42),_transparent_48%),linear-gradient(180deg,_#efd8a2_0%,_#f6e5bb_45%,_#f2d58f_100%)]" />
        <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:26px_26px]" />
        <HeroBackdrop className="absolute bottom-0 right-[-24%] w-[122%] max-w-none md:right-[-6%] md:w-[760px] lg:w-[860px]" />
      </div>

      <div className="relative z-10 flex w-full flex-col px-5 py-6 md:px-10 md:py-10">
        <HeroBadgeChip />

        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center pb-28 pt-10 text-center md:pb-20 md:pt-8">
          <h1 className="text-[22px] font-bold leading-relaxed text-text-dark md:text-[60px] md:leading-[1.28]">
            지금 너무 힘들다면,
            <br />
            우리와 함께 이야기해 보세요.
          </h1>

          <p className="mt-7 text-[16px] leading-relaxed text-primary md:mt-10 md:text-[36px] md:leading-[1.5]">
            마음의 어려움을 겪고있는 <strong className="font-bold">경기도 직장인</strong>들에게
            <br />
            <strong className="font-bold">전문 심리 상담 서비스를 무료로 제공합니다.</strong>
          </p>

          <div className="mt-8 w-full max-w-[330px] md:mt-12 md:max-w-[760px]">
            <HeroFeatureStrip />
          </div>

          <p className="mt-8 text-[18px] font-bold text-text-dark md:mt-12 md:text-[36px]">
            부담없이 지금 시작해 보세요
          </p>

          <div className="mt-5">
            <CtaButton>우울증 1분 테스트 바로가기</CtaButton>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 md:bottom-10">
          <MouseArrowIcon className="h-[48px] w-[48px] md:h-[58px] md:w-[58px]" />
        </div>
      </div>
    </section>
  );
}
