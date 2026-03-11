"use client";

type ApplyIneligibleStepProps = {
  onRetry: () => void;
};

export function ApplyIneligibleStep({ onRetry }: ApplyIneligibleStepProps) {
  return (
    <section className="mt-14 rounded-[36px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] p-8 text-center md:mt-16 md:p-14">
      <div className="mx-auto max-w-3xl rounded-[28px] bg-[var(--color-bg-warm)] px-6 py-8 text-center">
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--color-text-dark)] md:text-[18px]">
          이번 프로젝트의 대상자가 아닙니다
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-body)] md:text-[15px] md:leading-7">
          본 프로젝트는 경기도 거주자 또는 경기도 내 직장인을 대상으로
          운영됩니다.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-white)] px-10 py-4 text-[16px] font-semibold text-[var(--color-text-body)] transition-colors hover:bg-[var(--color-bg-gray)] md:text-[17px]"
      >
        다시 확인하기
      </button>
    </section>
  );
}
