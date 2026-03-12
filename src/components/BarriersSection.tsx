import CtaButton from "@/components/CtaButton";
import { BenefitCard, CheckCircleIcon } from "@/components/VectorArtwork";

const BENEFITS = [
  {
    icon: "chat" as const,
    lines: ["익명성 보호"],
  },
  {
    icon: "tag" as const,
    lines: ["소속 회사와", "상관없이 신청 가능"],
  },
  {
    icon: "heart" as const,
    lines: ["전문상담", "4회 무료 지원"],
  },
];

const BARRIER_ITEMS = [
  "상담 비용이 부담되셨나요?",
  "회사에 알려질까 걱정되셨나요?",
  "상담 효과가 있을지 망설여지셨나요?",
  "시간을 내기 어려우셨나요?",
  "상담 자체가 낯설고 부담되셨나요?",
];

export default function BarriersSection() {
  return (
    <section className="relative w-full bg-bg-warm">
      <div className="page-shell">
        <p className="mx-auto mb-12 max-w-5xl text-center text-[18px] font-extrabold leading-[1.45] tracking-[-0.035em] text-text-dark md:mb-16 md:text-[32px]">
          우울 , 불안 , 스트레스 등 정서적 어려움을 겪는
          <br />
          <span className="text-primary-strong">
            경기도민 또는 경기도 재직자
          </span>
          를 위한 <span className="text-primary-strong">무료 심리상담</span>{" "}
          지원사업입니다
        </p>

        <div className="mx-auto max-w-[600px] overflow-hidden rounded-[20px] border border-border-soft bg-bg-white px-8 py-5 shadow-[0_2px_12px_rgba(240,135,119,0.08)] md:max-w-[840px] md:rounded-[24px] md:px-20 md:py-6">
          <div className="mx-auto w-fit mb-2">
            <p className="my-3 text-center text-[16px] font-bold tracking-[-0.02em] text-text-dark md:my-4 md:text-[20px]">
              이런 이유로 상담을 미뤄오셨나요?
            </p>
            {BARRIER_ITEMS.map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 md:gap-4 md:py-3"
              >
                <CheckCircleIcon className="h-6 w-6 shrink-0 md:h-7 md:w-7" />
                <span className="text-[15px] leading-7 text-text-body md:text-[17px] md:leading-8">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-12 mt-20 text-center md:mt-40 md:mb-16">
          <p className="text-[20px] font-extrabold leading-[1.3] tracking-[-0.03em] text-text-dark md:text-[32px]">
            부담 없이 지금 시작해보세요.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3 md:gap-7 md:max-w-5xl mx-auto">
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

        <div className="mb:12 mt-20 text-center md:mt-40 md:mb-16">
          <p className="text-[20px] font-extrabold leading-[1.3] tracking-[-0.03em] text-text-dark md:text-[30px] md:leading-[1.35] mb-1">
            누구나 힘들 수 있습니다.
          </p>
          <p className="text-[20px] font-extrabold leading-[1.3] tracking-[-0.03em] text-text-dark md:text-[30px] md:leading-[1.35]">
            중요한 건{" "}
            <span className="text-primary-strong">지금 시작하는 용기</span>
            입니다.
          </p>
        </div>

        <div className="section-cta">
          <CtaButton>무료 상담 받으러 가기</CtaButton>
        </div>
      </div>
    </section>
  );
}
