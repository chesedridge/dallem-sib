import CtaButton from "@/components/CtaButton";
import { CheckCircleIcon, MetricChart } from "@/components/VectorArtwork";

const RESULT_ITEMS = [
  "4회기 심리상담 진행 후, 주요 지표들에서 유의미한 변화가 나타남",
  "우울, 불안, 스트레스, 외로움 등 부정 정서가 유의하게 감소함",
  "자아존중감, 회복탄력성, 삶의 만족도는 유의하게 상승함",
];

export default function DataSection() {
  return (
    <section className="relative w-full bg-bg-gray">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-[104px]">
        <h2 className="text-center text-[22px] font-bold leading-relaxed text-text-body md:text-[36px]">
          상담 받으면 정말 나아질까?
        </h2>
        <p className="mt-2 text-center text-[18px] leading-relaxed text-text-body md:text-[30px]">
          심리상담의 효과와 필요성에 대해 확신이
          <br className="md:hidden" />
          없으셨다면 아래 데이터를 확인해 보세요.
        </p>

        <div className="my-[30px] grid gap-[24px] md:my-[50px] md:grid-cols-2 md:gap-[40px]">
          <div className="text-center">
            <MetricChart kind="positive" />
            <p className="mt-[10px] text-center text-[18px] font-bold text-text-sub md:text-[24px]">
              긍정 정서 증진 효과
            </p>
          </div>
          <div className="text-center">
            <MetricChart kind="negative" />
            <p className="mt-[10px] text-center text-[18px] font-bold text-text-sub md:text-[24px]">
              부정 정서 감소 효과
            </p>
          </div>
        </div>

        <div className="my-[40px] rounded-2xl bg-white px-6 py-[30px] md:mx-auto md:my-[60px] md:max-w-[800px] md:p-[40px]">
          <p className="mb-[20px] text-center text-[18px] font-bold text-text-body md:text-[30px]">
            심리상담의 주요 성과
          </p>
          {RESULT_ITEMS.map((text) => (
            <div key={text} className="flex items-start gap-4 py-[10px]">
              <CheckCircleIcon className="mt-[2px] h-[24px] w-[24px] shrink-0" />
              <span className="text-[16px] leading-relaxed md:text-[24px]">{text}</span>
            </div>
          ))}
        </div>

        <div className="mb-[10px] mt-[30px] text-center">
          <p className="text-[22px] font-bold leading-relaxed md:text-[40px] md:leading-relaxed">
            이 모든변화는 당신도 경험할 수 있습니다.
          </p>
        </div>

        <div className="mt-5 text-center">
          <CtaButton>지금 무료로 시작해보세요</CtaButton>
        </div>
      </div>
    </section>
  );
}
