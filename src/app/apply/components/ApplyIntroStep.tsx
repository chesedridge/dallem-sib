"use client";

type ApplyIntroStepProps = {
  onStart: () => void;
};

export function ApplyIntroStep({ onStart }: ApplyIntroStepProps) {
  return (
    <section className="mt-14 rounded-[36px] border border-[var(--color-border-soft)] bg-bg-white p-8 text-center md:mt-16 md:p-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-3xl">
          우울(PHQ-9) 자가검진
        </h2>
        <p className="text-[15px] leading-7 whitespace-pre-line break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          검사 진행은 약 1분 정도 소요됩니다.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-8 rounded-full bg-primary px-14 py-4 text-[17px] font-semibold text-white transition-colors hover:bg-primary-light"
      >
        시작하기
      </button>
    </section>
  );
}
