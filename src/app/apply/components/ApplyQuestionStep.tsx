"use client";

import { useEffect, useRef } from "react";

import { ANSWER_OPTIONS, QUESTIONS } from "./constants";

type ApplyQuestionStepProps = {
  answers: number[];
  questionIndex: number;
  onAnswerChange: (index: number, score: number) => void;
};

export function ApplyQuestionStep({
  answers,
  questionIndex,
  onAnswerChange,
}: ApplyQuestionStepProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const question = QUESTIONS[questionIndex];

  useEffect(() => {
    headingRef.current?.focus();
  }, [questionIndex]);

  return (
    <section className="mx-auto max-w-[48rem] text-left md:rounded-[36px] md:border md:border-border-soft md:bg-white md:p-10 md:shadow-[0_12px_40px_rgba(128,86,79,0.04)]">
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-6 text-sm font-bold text-primary-strong outline-none"
          >
            문항응답
            <span className="sr-only"> · {questionIndex + 1}번 문항</span>
          </h2>
          <p className="text-sm font-semibold tabular-nums text-text-sub">
            <span className="text-primary-strong">{questionIndex + 1}</span>
            {" / "}{QUESTIONS.length}
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="문항 진행"
          aria-valuemin={1}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={questionIndex + 1}
          aria-valuetext={`${QUESTIONS.length}개 중 ${questionIndex + 1}번 문항`}
          className="grid h-5 grid-cols-9 items-center gap-1.5"
        >
          {QUESTIONS.map((item, index) => (
            <span
              key={item}
              className={`rounded-full ${
                index === questionIndex
                  ? "h-2.5 bg-primary-strong ring-1 ring-primary-strong/30 ring-offset-2 ring-offset-bg-warm-light"
                  : answers[index] >= 0
                    ? "h-1.5 bg-primary"
                    : "h-1.5 bg-bg-gray"
              }`}
            />
          ))}
        </div>
      </div>

      <p id="question-instruction" className="mb-5 text-sm leading-6 break-keep text-text-sub">
        지난 2주간, 얼마나 자주 다음과 같은 문제들로 곤란을 겪으셨습니까?
      </p>
      <fieldset key={questionIndex} aria-describedby="question-instruction">
        <legend className="mb-6 w-full min-h-[84px] text-[20px] font-bold leading-8 tracking-[-0.02em] break-keep text-text-dark md:text-2xl">
          {question}
        </legend>
        <div className="grid grid-cols-1 gap-3">
          {ANSWER_OPTIONS.map((option) => {
            const selected = answers[questionIndex] === option.score;

            return (
              <label
                key={option.label}
                className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-[15px] transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-strong ${
                  selected
                    ? "border-primary bg-primary-soft text-text-dark"
                    : "border-border-soft bg-bg-white text-text-body hover:border-border-strong"
                }`}
              >
                <span className="flex items-center gap-3 font-semibold">
                  <input
                    type="radio"
                    name={`question-${questionIndex + 1}`}
                    value={option.score}
                    checked={selected}
                    onChange={() => onAnswerChange(questionIndex, option.score)}
                    onClick={() => {
                      if (selected) onAnswerChange(questionIndex, option.score);
                    }}
                    className="size-[18px] shrink-0 accent-primary-strong"
                  />
                  {option.label}
                </span>
                <span
                  className={`inline-flex min-w-10 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    selected ? "bg-primary-strong text-white" : "bg-bg-gray text-text-sub"
                  }`}
                >
                  {option.score}점
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
