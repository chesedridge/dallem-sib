"use client";

import type { RefObject } from "react";

import { ANSWER_OPTIONS, QUESTIONS } from "./constants";

type ApplyQuestionStepProps = {
  answers: number[];
  onAnswerChange: (index: number, score: number) => void;
  sectionRef: RefObject<HTMLElement | null>;
};

export function ApplyQuestionStep({
  answers,
  onAnswerChange,
  sectionRef,
}: ApplyQuestionStepProps) {
  return (
    <section
      ref={sectionRef}
      className="bg-bg-white text-center md:rounded-[36px] md:border md:border-[var(--color-border-soft)] md:p-14"
    >
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-3xl">
          문항응답
        </h2>
        <p className="text-[15px] leading-7 whitespace-pre-line break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          지난 2주간, 얼마나 자주 다음과 같은 문제들로 곤란을 겪으셨습니까?
        </p>
      </div>

      <ol className="space-y-7 md:space-y-8">
        {QUESTIONS.map((question, index) => (
          <li
            key={question}
            className="rounded-[30px] border border-[var(--color-border-soft)] bg-bg-gray p-6 md:p-9"
          >
            <div className="mb-7 flex flex-col items-center gap-3 md:gap-4">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white md:size-10 md:text-base">
                {index + 1}
              </span>
              <p className="max-w-[52rem] pt-0.5 text-[16px] font-semibold leading-7 tracking-[-0.02em] text-[var(--color-text-dark)] md:text-[19px] md:leading-8">
                {question}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ANSWER_OPTIONS.map((option) => {
                const selected = answers[index] === option.score;

                return (
                  <label
                    key={option.label}
                    className={`inline-flex min-h-12 cursor-pointer items-center justify-between rounded-[18px] border px-4 py-3.5 text-sm transition-colors md:min-h-14 md:px-5 md:text-[15px] ${
                      selected
                        ? "border-[var(--color-border-strong)] bg-primary-soft text-[var(--color-text-dark)]"
                        : "border-transparent bg-bg-white text-[var(--color-text-body)] hover:border-[var(--color-border-soft)] hover:bg-bg-warm-light"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${index + 1}`}
                      value={option.score}
                      checked={selected}
                      onChange={() => onAnswerChange(index, option.score)}
                      className="sr-only"
                    />
                    <span className="font-semibold tracking-[-0.01em]">
                      {option.label}
                    </span>
                    <span
                      className={`inline-flex min-w-10 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        selected
                          ? "bg-primary text-white"
                          : "bg-bg-gray text-[var(--color-text-sub)]"
                      }`}
                    >
                      {option.score}점
                    </span>
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
