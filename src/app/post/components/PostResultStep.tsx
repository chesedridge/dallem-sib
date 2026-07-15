"use client";

import type { ResultBand } from "@/app/apply/components/types";

type PostResultStepProps = {
  resultBadgeClass: string;
  resultBand: ResultBand;
  totalScore: number;
};

export function PostResultStep({
  resultBadgeClass,
  resultBand,
  totalScore,
}: PostResultStepProps) {
  const resultDescription =
    resultBand.min === 20
      ? "현재 우울감 수준이 높게 나타나, 보다 세심한 이해와 지원이 필요한 상태로 보입니다."
      : resultBand.description;

  return (
    <section className="mt-8 bg-bg-white text-center md:mt-16 md:rounded-[36px] md:border md:border-[var(--color-border-soft)] md:p-14">
      <div className="mx-auto max-w-3xl text-center">
        <p
          className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${resultBadgeClass}`}
        >
          검사 완료
        </p>
        <h2 className="text-balance text-2xl font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-3xl">
          {resultBand.title}
        </h2>
        <p className="mt-4 text-pretty text-[15px] leading-7 whitespace-pre-line break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          {resultDescription}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-[28px] bg-bg-warm px-6 py-8 text-center">
        <p className="text-sm font-semibold text-[var(--color-text-sub)]">
          PHQ-9 총점
        </p>
        <p className="mt-1 text-4xl font-extrabold tabular-nums text-[var(--color-primary-strong)]">
          {totalScore}
          <span className="ml-1 text-lg">점</span>
        </p>
      </div>
    </section>
  );
}
