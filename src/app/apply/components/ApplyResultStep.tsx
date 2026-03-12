"use client";

import type { ResultBand } from "./types";

type ApplyResultStepProps = {
  onProceedToApply: () => void;
  resultBadgeClass: string;
  resultBand: ResultBand;
};

export function ApplyResultStep({
  onProceedToApply,
  resultBadgeClass,
  resultBand,
}: ApplyResultStepProps) {
  const isSafe = resultBand.min === 0 && resultBand.max === 4;

  const content = {
    safe: {
      title: "이번 프로젝트의 대상자가 아닙니다",
      description:
        "현재 멘탈이 양호한 상태입니다. 앞으로도 꾸준한 관리를 통해 지금과 같은 멘탈 건강을 계속 유지해나가시면 좋겠습니다.",
    },
    unsafe: {
      title: "이번 프로젝트 대상자입니다!",
      description:
        "상담 신청을 원하시면 아래 버튼을 눌러 응답자 정보를 남겨주세요. 신청 후 담당자가 연락을 드릴 예정입니다.",
    },
  }[isSafe ? "safe" : "unsafe"];

  return (
    <section className="mt-14 rounded-[36px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] p-8 text-center md:mt-16 md:p-14">
      <div className="mx-auto max-w-3xl text-center">
        <p
          className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${resultBadgeClass}`}
        >
          판정 결과
        </p>
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-3xl">
          {resultBand.title}
        </h2>
        <p className="text-[15px] leading-7 whitespace-pre-line break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          {resultBand.description}
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl rounded-[28px] bg-[var(--color-bg-warm)] px-6 py-9 text-center">
        <p className="text-base font-semibold leading-7 text-[var(--color-text-dark)] md:text-lg md:leading-8">
          {content.title}
        </p>
        <p className="mt-3 text-sm leading-6 whitespace-pre-line break-keep text-[var(--color-text-body)] md:text-base md:leading-7">
          {content.description}
        </p>
        {!isSafe ? (
          <button
            type="button"
            onClick={onProceedToApply}
            className="mt-6 rounded-full bg-[var(--color-primary)] px-8 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-light)]"
          >
            상담 신청하기
          </button>
        ) : null}
      </div>
    </section>
  );
}
