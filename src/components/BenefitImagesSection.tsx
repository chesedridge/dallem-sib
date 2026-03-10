import CtaButton from "@/components/CtaButton";
import { BenefitCard } from "@/components/VectorArtwork";

const BENEFITS = [
  {
    icon: "chat" as const,
    lines: ["익명 상담 보장"],
  },
  {
    icon: "tag" as const,
    lines: ["모든 회사", "무료 상담 제공"],
  },
  {
    icon: "heart" as const,
    lines: [
      "사회공헌 자금을 통해",
      "상담 전 회차 무료 제공되는",
      "전문 상담 서비스",
    ],
  },
];

export default function BenefitImagesSection() {
  return (
    <section className="relative w-full bg-bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-[104px]">
        <div className="mb-[30px] grid gap-5 md:grid-cols-3 md:gap-6">
          {BENEFITS.map((benefit) => (
            <BenefitCard
              key={benefit.lines.join("-")}
              icon={benefit.icon}
              title={benefit.lines.map((line, index) => (
                <span key={`${benefit.lines.join("-")}-${index}`}>
                  {line}
                  {index < benefit.lines.length - 1 ? <br /> : null}
                </span>
              ))}
            />
          ))}
        </div>

        <div className="mb-[20px] text-center">
          <p className="text-[22px] font-bold leading-relaxed md:text-[36px] md:leading-relaxed">
            누구나 힘들 수 있습니다. 중요한 건{" "}
            <span className="text-primary">지금 시작하는 용기</span>입니다.
          </p>
          <p className="text-[22px] font-bold leading-relaxed md:text-[36px] md:leading-relaxed">
            부담 없이 지금 시작해보세요.
          </p>
        </div>

        <div className="mt-5 text-center">
          <CtaButton>우울증 1분 테스트 바로가기</CtaButton>
        </div>
      </div>
    </section>
  );
}
