import CtaButton from "@/components/CtaButton";
import { CheckCircleIcon, MetricChart } from "@/components/VectorArtwork";

const RESULT_ITEMS = [
  "4회 상담 후 주요 심리 지표에서 긍정적 변화가 확인되었습니다",
  "우울, 불안, 스트레스, 외로움 등 부정 정서는 감소했습니다",
  "자아존중감, 회복탄력성, 삶의 만족도는 향상되었습니다",
];

export default function DataSection() {
  return (
    <section className="relative w-full bg-bg-warm-light">
      <div className="page-shell">
        <h2 className="section-heading text-center">
          상담 받으면 정말 나아질까?
        </h2>
        <p className="mx-auto mt-5 max-w-[820px] text-center text-[15px] leading-7 text-text-body md:mt-8 md:text-[18px] md:leading-[1.6]">
          심리상담의 효과와 필요성에 대해 확신이
          <br className="md:hidden" />
          없으셨다면 아래 데이터를 확인해 보세요.
        </p>

        <div className="my-12 grid gap-10 md:my-20 md:grid-cols-2 md:gap-12">
          <div className="mx-auto w-full max-w-[400px] text-center md:max-w-none">
            <MetricChart kind="positive" />
            <p className="mt-4 text-center text-[15px] font-bold tracking-[-0.02em] text-text-sub md:text-[17px]">
              긍정 정서 증진 효과
            </p>
          </div>
          <div className="mx-auto w-full max-w-[400px] text-center md:max-w-none">
            <MetricChart kind="negative" />
            <p className="mt-4 text-center text-[15px] font-bold tracking-[-0.02em] text-text-sub md:text-[17px]">
              부정 정서 감소 효과
            </p>
          </div>
        </div>

        <div className="mx-auto md:max-w-[1000px]">
          <p className="mb-8 text-center text-[18px] font-extrabold tracking-[-0.03em] text-text-dark md:mb-10 md:text-[26px]">
            심리상담의 주요 성과
          </p>
          <div className="mx-auto max-w-[600px] overflow-hidden rounded-[20px] border border-border-soft bg-bg-white px-8 py-7 shadow-[0_2px_12px_rgba(240,135,119,0.08)] md:max-w-[840px] md:rounded-[24px] md:px-10 md:py-6">
            <div className="w-fit mx-auto">
              {RESULT_ITEMS.map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-3 py-1 md:gap-4 md:py-3"
                >
                  <CheckCircleIcon className="h-6 w-6 shrink-0 md:h-7 md:w-7" />
                  <span className="text-[15px] leading-7 text-text-body md:text-[17px] md:leading-8">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 text-center md:mt-30">
          <p className="text-[18px] font-extrabold leading-[1.35] tracking-[-0.03em] text-primary-strong md:text-[30px]">
            부담 없이 지금, 첫 상담을 시작해보세요.
          </p>
        </div>

        <div className="section-cta">
          <CtaButton>무료 상담 신청하기</CtaButton>
        </div>
      </div>
    </section>
  );
}
