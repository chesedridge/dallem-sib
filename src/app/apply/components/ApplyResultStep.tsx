"use client";

import type { ResultBand } from "./types";

type ApplyResultStepProps = {
  resultBadgeClass: string;
  resultBand: ResultBand;
};

export function ApplyResultStep({
  resultBadgeClass,
  resultBand,
}: ApplyResultStepProps) {
  const isSafe = resultBand.min === 0 && resultBand.max === 4;

  const content = {
    safe: {
      title: "이번 프로젝트의 대상자가 아닙니다",
      description:
        "현재의 멘탈이 양호한 상태입니다. 앞으로도 꾸준한 관리를 통해 지금과 같은 멘탈 건강을 계속 유지해 나가시면 좋겠습니다.",
    },
    unsafe: {
      title: "어떠한 어떠한 어떠한 입니다",
      description:
        "저희 담당자가 기입하신 연락처로 프로그램 내용과 자세한 사항을 안내 드릴 예정이오니 조금만 기다려주세요.",
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
        <p className="text-[15px] leading-7 text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          {resultBand.description}
        </p>
        <p className="mt-5 text-xs text-[var(--color-text-sub)] md:text-sm">
          출처: 박승진 외(2010), 한글판 우울증선별도구(Patient Health
          Questionnaire-9, PHQ-9)의 신뢰도와 타당도.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl rounded-[28px] bg-[var(--color-bg-warm)] px-6 py-9 text-center">
        <p className="text-base font-semibold leading-7 text-[var(--color-text-dark)] md:text-lg md:leading-8">
          {content.title}
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-body)] md:text-base md:leading-7">
          {content.description}
        </p>
      </div>
    </section>
  );
}
