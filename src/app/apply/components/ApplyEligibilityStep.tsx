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
    <section className="mx-auto mt-8 max-w-[48rem] rounded-[28px] border border-border-soft bg-bg-white px-5 py-7 text-center shadow-[0_12px_40px_rgba(128,86,79,0.04)] sm:px-8 md:mt-10 md:rounded-[32px] md:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-3 text-2xl font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-3xl">
          참여 대상 확인
        </h2>
        <p className="text-[15px] leading-7 whitespace-pre-line break-keep text-[var(--color-text-body)] md:text-[16px] md:leading-7">
          직장인으로서 아래 조건 중 하나에 해당하면 이용할 수 있습니다.
        </p>
        <ol className="my-8 space-y-6 rounded-2xl bg-bg-warm px-6 py-5 text-left text-[15px] font-semibold leading-7 text-text-dark md:my-10 md:space-y-7 md:px-8 md:py-6 md:text-[18px] md:leading-8">
          {[
            "경기도에 거주하는 직장인입니다",
            "경기도 소재 회사에 재직 중인 직장인입니다",
          ].map((condition, index) => (
            <li key={condition} className="flex items-start gap-3 md:gap-4">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary-strong md:h-8 md:w-8"
              >
                {index + 1}
              </span>
              <span className="break-keep">{condition}</span>
            </li>
          ))}
        </ol>
        <div className="border-y border-border-soft text-left">
          <h3 className="py-4 text-sm font-semibold text-text-body md:text-[15px]">
            경기도 소재 기업 재직자 참여 기준
          </h3>
          <ul className="list-outside list-disc space-y-3 pb-5 pl-5 pr-2 text-left text-sm leading-6 marker:text-primary-strong">
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
          className="rounded-full bg-primary px-6 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong md:text-[17px]"
        >
          네, 해당합니다
        </button>
        <button
          type="button"
          onClick={onIneligible}
          className="rounded-full border border-[var(--color-border-strong)] bg-bg-white px-6 py-4 text-[16px] font-semibold text-text-body transition-colors hover:bg-bg-gray focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong md:text-[17px]"
        >
          아니요
        </button>
      </div>
    </section>
  );
}
