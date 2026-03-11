"use client";

type ApplyIntroStepProps = {
  onStart: () => void;
};

export function ApplyIntroStep({ onStart }: ApplyIntroStepProps) {
  return (
    <section className="mt-14 rounded-[36px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] p-8 text-center md:mt-16 md:p-14">
      <div className="mb-2">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-[30px]">
          우울증 파악을 위한 PHQ-9 (우울증 테스트)
        </h2>
      </div>
      <p className="mb-12 text-[15px] leading-7 text-[var(--color-text-sub)] md:text-[17px] md:leading-8">
        테스트를 시작합니다. 테스트는 1분 정도 소요됩니다.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="rounded-full bg-[var(--color-primary)] px-14 py-4 text-[17px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-light)]"
      >
        시작하기
      </button>
    </section>
  );
}
