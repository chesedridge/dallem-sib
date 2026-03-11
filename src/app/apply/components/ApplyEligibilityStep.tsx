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
    <section className="mt-14 rounded-[36px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] p-8 text-center md:mt-16 md:p-14">
      <div className="mb-2">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-[30px]">
          참여 대상 확인
        </h2>
      </div>
      <p className="mx-auto mb-12 mt-4 max-w-[36rem] text-[15px] leading-7 text-[var(--color-text-sub)] md:text-[17px] md:leading-8">
        현재 경기도에 거주 중이거나, 경기도 내 직장에 재직 중이신가요?
        <br />
        본 프로젝트는 경기도 거주자 또는 경기도 내 직장인을 대상으로
        진행됩니다.
      </p>
      <div className="mx-auto grid max-w-[32rem] grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={onEligible}
          className="rounded-full bg-[var(--color-primary)] px-6 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-light)] md:text-[17px]"
        >
          네, 해당합니다
        </button>
        <button
          type="button"
          onClick={onIneligible}
          className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-white)] px-6 py-4 text-[16px] font-semibold text-[var(--color-text-body)] transition-colors hover:bg-[var(--color-bg-gray)] md:text-[17px]"
        >
          아니요
        </button>
      </div>
    </section>
  );
}
