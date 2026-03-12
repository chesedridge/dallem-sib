import Image from "next/image";

import CtaButton from "@/components/CtaButton";
import {
  HeroBadgeChip,
  MouseArrowIcon,
} from "@/components/VectorArtwork";
import ProjectInfoList from "./ProjectInfoList";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full overflow-hidden bg-[var(--color-bg-warm)]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.62),_transparent_42%),radial-gradient(circle_at_18%_24%,_rgba(240,135,119,0.24),_transparent_28%),linear-gradient(180deg,_#fff6f4_0%,_#fbded8_44%,_#f4beb4_100%)]" />
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(215,101,84,0.14)_1px,transparent_1px)] [background-size:26px_26px]" />
        {/* <HeroBackdrop className="absolute bottom-0 right-[-24%] w-[110%] max-w-none opacity-50 md:right-[-6%] md:w-[680px] md:opacity-65 lg:w-[780px]" /> */}
      </div>

      <div className="relative z-10 flex w-full flex-col px-6 py-8 md:px-14 md:py-14">
        <div className="absolute right-6 top-8 md:right-14 md:top-14">
          <Image
            src="/logo.png"
            alt="달램 로고"
            width={782}
            height={319}
            className="h-auto w-24 md:w-39 translate-x-4 -translate-y-2"
            priority
          />
        </div>

        <HeroBadgeChip />

        <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center pb-32 pt-14 text-center md:pb-28 md:pt-12">
          <h1 className="max-w-[860px] text-[26px] font-extrabold leading-[1.2] tracking-[-0.04em] text-text-dark md:text-[50px] md:leading-[1.1]">
            지금 너무 힘들다면,
            <br />
            우리와 함께 이야기해 보세요.
          </h1>
          <p className="mt-7 max-w-[800px] text-[15px] leading-[1.55] tracking-[-0.02em] text-primary-strong md:mt-10 md:text-[26px] md:leading-[1.4]">
            <strong className="font-bold">경기도민</strong> 또는{" "}
            <strong className="font-bold">경기도 재직자</strong>라면,
            <br />1인당 4회{" "}
            <strong className="font-bold">무료 심리상담</strong>을 받을 수
            있습니다.
          </p>
          <ProjectInfoList className="mt-7" />
          <div className="mt-7 md:mt-9">
            <CtaButton>무료 상담 받으러 가기</CtaButton>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 md:bottom-10">
          <MouseArrowIcon className="h-[44px] w-[44px] md:h-[56px] md:w-[56px]" />
        </div>
      </div>
    </section>
  );
}
