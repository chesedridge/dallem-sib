"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ApplyQuestionStep } from "@/app/apply/components/ApplyQuestionStep";
import {
  PHONE_PATTERN,
  QUESTIONS,
  findResultBand,
} from "@/app/apply/components/constants";
import {
  PostInfoStep,
  type PostRespondentInfo,
  type PostRespondentInfoErrors,
} from "./components/PostInfoStep";
import { PostResultStep } from "./components/PostResultStep";

type PostFormStep = "info" | "question" | "result";

export default function PostPage() {
  const [formStep, setFormStep] = useState<PostFormStep>("info");
  const [info, setInfo] = useState<PostRespondentInfo>({
    nickname: "",
    contact: "",
  });
  const [answers, setAnswers] = useState<number[]>(
    Array.from({ length: QUESTIONS.length }, () => -1),
  );
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PostRespondentInfoErrors>({});
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const questionSectionRef = useRef<HTMLElement | null>(null);

  const resultBand = useMemo(() => {
    if (totalScore === null) {
      return null;
    }

    return findResultBand(totalScore);
  }, [totalScore]);
  const answeredCount = answers.filter((score) => score >= 0).length;
  const isQuestionStepComplete = answeredCount === QUESTIONS.length;
  const shouldShowForm = formStep === "info" || formStep === "question";
  const showQuestionProgress =
    formStep === "question" && !isQuestionStepComplete;
  const questionProgressLabel = `${QUESTIONS.length}개중 ${answeredCount}개 완료`;
  const primaryButtonLabel =
    formStep === "info"
      ? "검사 시작하기"
      : isSubmitting
        ? "저장 중..."
        : "결과보기";
  const isPrimaryButtonDisabled = isSubmitting || showQuestionProgress;
  const resultBadgeClass =
    totalScore !== null && totalScore >= 20
      ? "bg-primary text-white"
      : totalScore !== null && totalScore >= 10
        ? "bg-primary-soft text-[var(--color-primary-strong)]"
        : "bg-bg-gray text-[var(--color-text-body)]";

  useEffect(() => {
    if (formStep === "info") {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [formStep]);

  useEffect(() => {
    if (formStep !== "question") {
      setShowProgressPanel(false);
      return;
    }

    let frame = 0;
    const threshold = 96;

    const updateProgressVisibility = () => {
      const questionSection = questionSectionRef.current;

      if (!questionSection) {
        return;
      }

      const nextVisible =
        questionSection.getBoundingClientRect().top <= threshold;
      setShowProgressPanel((previousVisible) =>
        previousVisible === nextVisible ? previousVisible : nextVisible,
      );
    };

    const handleScrollOrResize = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateProgressVisibility);
    };

    handleScrollOrResize();
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [formStep]);

  const updateInfoField = (key: keyof PostRespondentInfo, value: string) => {
    const nextValue =
      key === "contact" ? value.replace(/\D/g, "").slice(0, 11) : value;

    setInfo((previousInfo) => ({ ...previousInfo, [key]: nextValue }));
    setFieldErrors((previousErrors) => {
      if (!previousErrors[key]) {
        return previousErrors;
      }

      const nextErrors = { ...previousErrors };
      delete nextErrors[key];
      return nextErrors;
    });
    setSubmitError("");
  };

  const updateAnswer = (index: number, score: number) => {
    setAnswers((previousAnswers) => {
      const nextAnswers = [...previousAnswers];
      nextAnswers[index] = score;
      return nextAnswers;
    });
    setSubmitError("");
  };

  const submitPostSurvey = async () => {
    const score = answers.reduce((sum, answer) => sum + answer, 0);

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch("/api/post-survey-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: info.nickname.trim(),
          contact: info.contact.trim(),
          answers,
          totalScore: score,
        }),
      });
      const responseBody = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        setSubmitError(
          responseBody?.message ??
            "응답 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
        return;
      }

      setTotalScore(score);
      setFormStep("result");
    } catch {
      setSubmitError(
        "응답 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formStep === "info") {
      const nextFieldErrors: PostRespondentInfoErrors = {};

      if (!info.nickname.trim()) {
        nextFieldErrors.nickname = "닉네임을 입력해주세요.";
      }

      if (!info.contact.trim()) {
        nextFieldErrors.contact = "연락처를 입력해주세요.";
      } else if (!PHONE_PATTERN.test(info.contact.trim())) {
        nextFieldErrors.contact =
          "010으로 시작하는 10~11자리 숫자를 입력해주세요.";
      }

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        return;
      }

      setFieldErrors({});
      setFormStep("question");
      return;
    }

    if (!isQuestionStepComplete || isSubmitting) {
      return;
    }

    await submitPostSurvey();
  };

  return (
    <div className="min-h-screen bg-bg-warm-light py-14 pb-28 md:py-20 md:pb-20">
      {formStep === "question" && showProgressPanel ? (
        <div className="pointer-events-none fixed left-1/2 top-3 z-40 hidden w-[calc(100vw-4rem)] max-w-[60rem] -translate-x-1/2 md:block">
          <section className="pointer-events-auto w-full rounded-3xl border border-[var(--color-border-soft)] bg-[rgba(255,253,252,0.94)] px-5 py-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[var(--color-text-sub)]">
                문항 진행
              </p>
              <p className="text-sm font-semibold tabular-nums text-[var(--color-text-body)]">
                {questionProgressLabel}
              </p>
            </div>
            <div className="grid grid-cols-9 gap-1.5">
              {QUESTIONS.map((question, index) => (
                <span
                  key={question}
                  className={`h-1.5 rounded-full transition-colors duration-150 ${
                    answers[index] >= 0 ? "bg-primary" : "bg-bg-gray"
                  }`}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl px-5 sm:px-7 lg:px-10">
        <header className="pt-3 text-center md:pt-5">
          <p className="mb-2 text-[18px] font-extrabold tracking-[-0.03em] text-[var(--color-primary-strong)] md:text-[22px]">
            사후검사
          </p>
          <h1 className="text-balance text-[26px] font-extrabold leading-[1.2] tracking-[-0.04em] text-[var(--color-text-dark)] md:text-[38px]">
            멘탈케어 프로젝트
          </h1>
        </header>

        <div
          aria-hidden="true"
          className="mt-10 -mx-5 border-t border-solid border-[var(--color-border-soft)] sm:-mx-7 md:hidden"
        />

        <form
          id="post-phq-test-form"
          onSubmit={submit}
          className={`mt-8 space-y-10 md:mt-16 md:space-y-12 ${
            shouldShowForm ? "" : "hidden"
          }`}
        >
          {formStep === "info" ? (
            <PostInfoStep
              fieldErrors={fieldErrors}
              info={info}
              onUpdateField={updateInfoField}
            />
          ) : formStep === "question" ? (
            <ApplyQuestionStep
              answers={answers}
              onAnswerChange={updateAnswer}
              sectionRef={questionSectionRef}
            />
          ) : null}

          {submitError ? (
            <div
              role="alert"
              className="mx-auto max-w-[36rem] rounded-[20px] border border-[var(--color-primary)] bg-primary-soft px-4 py-3 text-left text-sm font-medium text-[var(--color-primary-strong)]"
            >
              {submitError}
            </div>
          ) : null}

          <div className="hidden w-full justify-center pt-2 md:flex md:pt-4">
            <button
              type="submit"
              disabled={isPrimaryButtonDisabled}
              className={`rounded-full bg-primary px-12 py-4 text-[17px] font-semibold text-white transition-[background-color,scale] duration-150 ease-out active:scale-[0.96] ${
                isPrimaryButtonDisabled
                  ? "cursor-not-allowed opacity-70"
                  : "hover:bg-primary-light"
              }`}
            >
              {primaryButtonLabel}
            </button>
          </div>
        </form>

        {formStep === "result" && resultBand && totalScore !== null ? (
          <PostResultStep
            resultBadgeClass={resultBadgeClass}
            resultBand={resultBand}
            totalScore={totalScore}
          />
        ) : null}
      </main>

      {shouldShowForm ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border-soft)] bg-[rgba(255,253,252,0.96)] p-4 backdrop-blur-sm md:hidden">
          <button
            type="submit"
            form="post-phq-test-form"
            disabled={isPrimaryButtonDisabled}
            className={`w-full rounded-full bg-primary px-6 py-4 text-[16px] font-semibold text-white transition-[scale] duration-150 ease-out active:scale-[0.96] ${
              isPrimaryButtonDisabled ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {showQuestionProgress ? (
              <span className="flex w-full flex-col gap-2">
                <span className="text-sm font-semibold leading-none tabular-nums">
                  {questionProgressLabel}
                </span>
                <span className="grid grid-cols-9 gap-1.5">
                  {QUESTIONS.map((question, index) => (
                    <span
                      key={`mobile-${question}`}
                      className={`h-1.5 rounded-full ${
                        answers[index] >= 0 ? "bg-white" : "bg-primary-soft"
                      }`}
                    />
                  ))}
                </span>
              </span>
            ) : (
              primaryButtonLabel
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
