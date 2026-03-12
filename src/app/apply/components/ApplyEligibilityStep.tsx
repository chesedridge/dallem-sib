"use client";

type ApplyEligibilityStepProps = {
  onEligible: () => void;
  onIneligible: () => void;
};

export function ApplyEligibilityStep({
  onEligible,
  onIneligible,
}: ApplyEligibilityStepProps) {
  return (
    <section className="mt-14 rounded-[36px] border border-border-soft bg-bg-white p-8 text-center md:mt-16 md:p-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-3xl">
          참여 대상 확인
        </h2>
        <p className="text-[15px] leading-7 whitespace-pre-line break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          본 프로젝트는 경기도에 거주 중이거나 경기도 소재 회사에 재직중인
          직장인을 대상으로 진행됩니다.
        </p>
        <p className="text-[15px] leading-7 whitespace-pre-line break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          ※ 경기도와 관련된 사업장이 있는 기업에 재직 중이라면 대부분 참여가
          가능합니다 ※
        </p>
        <div className="mx-auto mt-8 max-w-3xl rounded-[28px] bg-bg-warm px-6 py-9 text-center">
          <h3 className="font-bold text-base">경기도 소재 기업 재직자 참여 기준</h3>
          <ul className="mt-5 list-outside list-disc space-y-1 px-6 text-left text-sm md:text-base">
            <li>경기도에 본사가 있는 기업에 재직 중인 경우</li>
            <li>본사는 다른 지역에 있더라도 경기도에 지사, 지점, 사무소 등
              사업장이 있는 기업에 재직 중인 경우
            </li>
            <li>경기도에 공장, 연구소, 물류센터 등 사업 운영 시설이 있는 기업에
              재직 중인 경우
            </li>
            <li>모회사 본사가 다른 지역에 있더라도 경기도에 자회사 또는 계열사가
              있는 기업에 재직 중인 경우
            </li>
            <li>그 밖에 경기도 내에서 사업 활동을 하고 있는 기업의 재직자</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-[32rem] grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={onEligible}
          className="rounded-full bg-primary px-6 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-primary-light md:text-[17px]"
        >
          네, 해당합니다
        </button>
        <button
          type="button"
          onClick={onIneligible}
          className="rounded-full border border-[var(--color-border-strong)] bg-bg-white px-6 py-4 text-[16px] font-semibold text-[var(--color-text-body)] transition-colors hover:bg-bg-gray md:text-[17px]"
        >
          아니요
        </button>
      </div>
    </section>
  );
}
