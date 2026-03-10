import CtaButton from "@/components/CtaButton";
import { BenefitCard, CheckCircleIcon } from "@/components/VectorArtwork";

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

const BARRIER_ITEMS = [
  "상담 비용 부담 때문에 주저 하셨던 분들",
  "익명 보장이 어려워 망설이셨던 분들",
  "상담 효과에 대한 확신이 없어 망설이셨던 분들",
  "접근성 여건으로 상담 기관을 찾기 어려우셨던 분들",
  "정신질환에 대한 낙인과 편견으로 상담을 망설이셨던 분들",
];

export default function BarriersSection() {
  return (
    <section className="relative w-full bg-bg-warm">
      <div className="page-shell">
        <p className="mx-auto mb-12 max-w-5xl text-center text-[18px] font-extrabold leading-[1.45] tracking-[-0.035em] text-text-dark md:mb-16 md:text-[32px]">
          우울, 불안 등 정서적 어려움을 겪고 계신
          <br className="min-sm:hidden" />
          <span className="text-primary-strong">
            경기도 직장인 및 경기도 거주자를 위한
          </span>
          <br />
          <span className="text-primary-strong">
            「경기도 직장인을 위한 멘탈케어 프로젝트」
          </span>
          <br className="min-sm:hidden" />
          시작되었습니다.
        </p>

        <div className="mx-auto max-w-[600px] overflow-hidden rounded-[20px] border border-border-soft bg-bg-white px-8 py-4 shadow-[0_2px_12px_rgba(240,135,119,0.08)] md:max-w-[840px] md:rounded-[24px] md:px-20 md:py-6">
          <div className="mx-auto w-fit">
            <p className="my-3 text-center text-[16px] font-bold tracking-[-0.02em] text-text-dark md:my-4 md:text-[20px]">
              그동안 상담을 받고 싶어도
            </p>
            {BARRIER_ITEMS.map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 md:gap-4 md:py-4"
              >
                <CheckCircleIcon className="h-6 w-6 shrink-0 md:h-7 md:w-7" />
                <span className="text-[15px] leading-7 text-text-body md:text-[17px] md:leading-8">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-12 mt-20 text-center md:mt-30 md:mb-16">
          <p className="text-[20px] font-extrabold leading-[1.3] tracking-[-0.03em] text-text-dark md:text-[32px]">
            이제 더 이상 미루지 마세요.
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

        <div className="mb:12 mt-20 text-center md:mt-30 md:mb-16">
          <p className="text-[20px] font-extrabold leading-[1.3] tracking-[-0.03em] text-text-dark md:text-[30px] md:leading-[1.35] mb-1">
            누구나 힘들 수 있습니다. 중요한 건{" "}
            <span className="text-primary-strong">지금 시작하는 용기</span>
            입니다.
          </p>
          <p className="text-[20px] font-extrabold leading-[1.3] tracking-[-0.03em] text-text-dark md:text-[30px] md:leading-[1.35]">
            부담 없이 지금 시작해보세요.
          </p>
        </div>

        <div className="section-cta">
          <CtaButton>우울증 1분 테스트 바로가기</CtaButton>
        </div>
      </div>
    </section>
  );
}
