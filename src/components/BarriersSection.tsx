import CtaButton from "@/components/CtaButton";
import { CheckCircleIcon } from "@/components/VectorArtwork";

const BARRIER_ITEMS = [
  "상담 비용 부담 때문에 주저 하셨던 분들",
  "익명 보장이 어려워 망설이셨던 분들",
  "상담 효과에 대한 확신이 없어 망설이셨던 분들",
  "접근성 여건으로 상담 기관을 찾기 어려우셨던 분들",
  "정신질환에 대한 낙인과 편견으로 상담을 망설이셨던 분들",
];

export default function BarriersSection() {
  return (
    <section className="relative w-full bg-bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-[104px]">
        <p className="mb-[30px] text-center text-[20px] font-bold leading-relaxed text-text-body md:text-[36px]">
          우울, 불안 등 정서적 어려움을 겪고 계신
          <br />
          <span className="text-primary-light">
            경기도 직장인 및 경기도 거주자를 위한
          </span>
          <br />
          <span className="text-primary-light">
            「경기도 직장인을 위한 멘탈케어 프로젝트」
          </span>
          <br />
          시작되었습니다.
        </p>

        <div className="mb-[30px] rounded-2xl bg-bg-warm-light px-6 py-[30px] md:mx-auto md:mb-[40px] md:max-w-[800px] md:p-[40px]">
          <p className="mb-[20px] text-center text-[18px] font-bold text-text-body md:text-[24px]">
            그동안 상담을 받고 싶어도
          </p>

          {BARRIER_ITEMS.map((text) => (
            <div key={text} className="flex items-start gap-4 py-[10px]">
              <CheckCircleIcon className="mt-[2px] h-[24px] w-[24px] shrink-0" />
              <span className="text-[16px] leading-relaxed md:text-[24px]">
                {text}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-[10px] mt-[30px] text-center">
          <p className="text-[22px] font-bold leading-relaxed md:text-[36px]">
            이제 더 이상 미루지 마세요.
          </p>
        </div>

        <div className="mt-5 text-center">
          <CtaButton>우울증 1분 테스트 바로가기</CtaButton>
        </div>
      </div>
    </section>
  );
}
