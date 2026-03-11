"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ApplyEligibilityStep } from "./components/ApplyEligibilityStep";
import { ApplyInfoStep } from "./components/ApplyInfoStep";
import { ApplyIneligibleStep } from "./components/ApplyIneligibleStep";
import { ApplyIntroStep } from "./components/ApplyIntroStep";
import { ApplyQuestionStep } from "./components/ApplyQuestionStep";
import { ApplyResultStep } from "./components/ApplyResultStep";
import {
  DEFAULT_DEBUG_ANSWERS,
  DEFAULT_DEBUG_INFO,
  PHONE_PATTERN,
  QUESTIONS,
  findResultBand,
} from "./components/constants";
import type {
  FormStep,
  RespondentInfo,
  RespondentInfoErrors,
  RespondentInfoFieldKey,
  RespondentTextFieldKey,
} from "./components/types";

const DEBUG_STEPS: FormStep[] = [
  "intro",
  "eligibility",
  "question",
  "info",
  "result",
  "ineligible",
];

export default function TestPage() {
  const isDebugMode = process.env.NODE_ENV !== "production";
  const [formStep, setFormStep] = useState<FormStep>("intro");
  const [info, setInfo] = useState<RespondentInfo>({
    nickname: "",
    contact: "",
    residence: "",
    privacyConsent: false,
  });
  const [answers, setAnswers] = useState<number[]>(
    Array.from({ length: QUESTIONS.length }, () => -1),
  );
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RespondentInfoErrors>({});
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
  const shouldShowForm = formStep === "question" || formStep === "info";
  const showQuestionProgress =
    formStep === "question" && !isQuestionStepComplete;
  const questionProgressLabel = `${QUESTIONS.length}개중 ${answeredCount}개 완료`;
  const primaryButtonLabel =
    formStep === "question"
      ? "다음으로"
      : isSubmitting
        ? "저장 중..."
        : "결과보기";
  const isPrimaryButtonDisabled = isSubmitting || showQuestionProgress;
  const resultBadgeClass =
    totalScore !== null && totalScore >= 20
      ? "bg-[var(--color-primary)] text-white"
      : totalScore !== null && totalScore >= 10
        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
        : "bg-[var(--color-bg-gray)] text-[var(--color-text-body)]";

  useEffect(() => {
    if (formStep !== "question") {
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
      setShowProgressPanel((prev) =>
        prev === nextVisible ? prev : nextVisible,
      );
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateProgressVisibility);
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [formStep]);

  const clearFieldError = (key: RespondentInfoFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }

      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateInfoField = (key: RespondentTextFieldKey, value: string) => {
    const nextValue =
      key === "contact" ? value.replace(/\D/g, "").slice(0, 11) : value;
    setInfo((prev) => ({ ...prev, [key]: nextValue }));
    clearFieldError(key);
    setSubmitError("");
  };

  const updatePrivacyConsent = (checked: boolean) => {
    setInfo((prev) => ({
      ...prev,
      privacyConsent: checked,
    }));
    clearFieldError("privacyConsent");
    setSubmitError("");
  };

  const updateAnswer = (index: number, score: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = score;
      return next;
    });
  };

  const buildDebugInfo = (): RespondentInfo => ({
    nickname: info.nickname.trim() || DEFAULT_DEBUG_INFO.nickname,
    contact: PHONE_PATTERN.test(info.contact.trim())
      ? info.contact.trim()
      : DEFAULT_DEBUG_INFO.contact,
    residence: info.residence || DEFAULT_DEBUG_INFO.residence,
    privacyConsent: info.privacyConsent || DEFAULT_DEBUG_INFO.privacyConsent,
  });

  const fillDebugForm = (nextStep: "info" | "result" = "info") => {
    const nextAnswers = answers.map((score, index) =>
      score >= 0 ? score : DEFAULT_DEBUG_ANSWERS[index],
    );
    const nextInfo = buildDebugInfo();

    setFieldErrors({});
    setSubmitError("");
    setIsSubmitting(false);
    setAnswers(nextAnswers);
    setInfo(nextInfo);

    if (nextStep === "result") {
      setTotalScore(nextAnswers.reduce((acc, current) => acc + current, 0));
      setFormStep("result");
      return;
    }

    setTotalScore(null);
    setFormStep("info");
  };

  const moveToDebugStep = (nextStep: FormStep) => {
    setFieldErrors({});
    setSubmitError("");
    setIsSubmitting(false);

    if (nextStep === "intro") {
      setTotalScore(null);
      setFormStep("intro");
      return;
    }

    if (nextStep === "question") {
      setTotalScore(null);
      setFormStep("question");
      return;
    }

    if (nextStep === "eligibility") {
      setTotalScore(null);
      setFormStep("eligibility");
      return;
    }

    if (nextStep === "ineligible") {
      setTotalScore(null);
      setFormStep("ineligible");
      return;
    }

    if (nextStep === "info") {
      fillDebugForm("info");
      return;
    }

    fillDebugForm("result");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formStep === "question") {
      if (!isQuestionStepComplete) {
        return;
      }

      setFieldErrors({});
      setFormStep("info");
      return;
    }

    const nextFieldErrors: RespondentInfoErrors = {};

    if (!info.nickname.trim()) {
      nextFieldErrors.nickname = "닉네임을 입력해주세요.";
    }

    if (!info.contact.trim()) {
      nextFieldErrors.contact = "연락처를 입력해주세요.";
    } else if (!PHONE_PATTERN.test(info.contact.trim())) {
      nextFieldErrors.contact =
        "010으로 시작하는 10~11자리 숫자를 입력해주세요.";
    }

    if (!info.residence) {
      nextFieldErrors.residence = "거주지를 선택해주세요.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    if (!isQuestionStepComplete) {
      setFormStep("question");
      return;
    }

    setFieldErrors({});
    const score = answers.reduce((acc, current) => acc + current, 0);
    const nextResultBand = findResultBand(score);

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch("/api/survey-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: info.nickname.trim(),
          contact: info.contact.trim(),
          residence: info.residence,
          privacyConsent: info.privacyConsent,
          answers,
          totalScore: score,
          resultTitle: nextResultBand.title,
          resultDescription: nextResultBand.description,
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

  return (
    <div className="min-h-screen bg-[var(--color-bg-warm-light)] py-14 pb-28 md:py-20 md:pb-20">
      {isDebugMode ? (
        <div className="fixed right-4 top-4 z-50 w-[12rem] rounded-2xl border border-[var(--color-border-soft)] bg-[rgba(255,255,255,0.96)] p-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-sub)]">
            Debug Tools
          </p>
          <button
            type="button"
            onClick={() => fillDebugForm("info")}
            className="mt-3 w-full rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-primary-soft)] px-3 py-2 text-xs font-semibold text-[var(--color-primary-strong)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-warm-light)]"
          >
            자동 채우기
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEBUG_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => moveToDebugStep(step)}
                className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] px-3 py-2 text-xs font-semibold text-[var(--color-text-body)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-warm-light)]"
              >
                {step}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {formStep === "question" && showProgressPanel ? (
        <div className="pointer-events-none fixed left-1/2 top-3 z-40 hidden w-[calc(100vw-4rem)] max-w-[60rem] -translate-x-1/2 md:block">
          <section className="pointer-events-auto w-full rounded-3xl border border-[var(--color-border-soft)] bg-[rgba(255,253,252,0.94)] px-5 py-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[var(--color-text-sub)]">
                문항 진행
              </p>
              <p className="text-sm font-semibold text-[var(--color-text-body)]">
                {questionProgressLabel}
              </p>
            </div>
            <div className="grid grid-cols-9 gap-1.5">
              {QUESTIONS.map((question, index) => {
                const done = answers[index] >= 0;
                return (
                  <span
                    key={question}
                    className={`h-1.5 rounded-full transition-colors ${
                      done
                        ? "bg-[var(--color-primary)]"
                        : "bg-[var(--color-bg-gray)]"
                    }`}
                  />
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl px-5 sm:px-7 lg:px-10">
        <header className="pt-3 text-center md:pt-5">
          <p className="mb-2 text-[18px] font-extrabold tracking-[-0.03em] text-[var(--color-primary-strong)] md:text-[22px]">
            경기도 거주자, 직장인을 위한
          </p>
          <h1 className="mb-3 text-[26px] font-extrabold leading-[1.2] tracking-[-0.04em] text-[var(--color-text-dark)] md:text-[38px]">
            우울증 개선 및 자살예방 SIB사업
          </h1>
          <p className="mx-auto max-w-[42rem] text-[15px] leading-7 text-[var(--color-text-body)] md:text-[17px] md:leading-8">
            본 프로그램은 익명으로 참여하실 수 있으며, 전회차 무료로 진행됩니다.
          </p>
        </header>

        {formStep === "intro" ? (
          <ApplyIntroStep onStart={() => setFormStep("eligibility")} />
        ) : null}

        {formStep === "eligibility" ? (
          <ApplyEligibilityStep
            onEligible={() => setFormStep("question")}
            onIneligible={() => setFormStep("ineligible")}
          />
        ) : null}

        <form
          id="phq-test-form"
          onSubmit={submit}
          className={`mt-14 space-y-14 md:mt-16 md:space-y-16 ${
            shouldShowForm ? "" : "hidden"
          }`}
        >
          {formStep === "question" ? (
            <ApplyQuestionStep
              answers={answers}
              onAnswerChange={updateAnswer}
              sectionRef={questionSectionRef}
            />
          ) : formStep === "info" ? (
            <ApplyInfoStep
              fieldErrors={fieldErrors}
              info={info}
              onPrivacyConsentChange={updatePrivacyConsent}
              onUpdateField={updateInfoField}
              submitError={submitError}
            />
          ) : null}

          <div className="hidden w-full justify-center pt-2 md:flex md:pt-4">
            {isPrimaryButtonDisabled && formStep === "question" && (
              <button
                type="button"
                disabled={isPrimaryButtonDisabled}
                className="hidden md:block rounded-full bg-[var(--color-primary)] px-12 py-4 text-[17px] font-semibold text-white opacity-70"
              >
                다음으로
              </button>
            )}
            <button
              type="submit"
              disabled={isPrimaryButtonDisabled}
              className={
                showQuestionProgress
                  ? "w-full max-w-[60rem] cursor-not-allowed rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] px-5 py-4 text-[var(--color-text-body)] md:hidden"
                  : isSubmitting
                    ? "rounded-full bg-[var(--color-primary)] px-12 py-4 text-[17px] font-semibold text-white opacity-70"
                    : "rounded-full bg-[var(--color-primary)] px-12 py-4 text-[17px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-light)]"
              }
            >
              {showQuestionProgress ? (
                <span className="flex w-full flex-col gap-2">
                  <span className="text-sm font-semibold leading-none">
                    {questionProgressLabel}
                  </span>
                  <span className="grid grid-cols-9 gap-1.5">
                    {QUESTIONS.map((question, index) => {
                      const done = answers[index] >= 0;
                      return (
                        <span
                          key={`desktop-${question}`}
                          className={`h-1.5 rounded-full ${done ? "bg-[var(--color-primary)]" : "bg-[var(--color-primary-soft)]"}`}
                        />
                      );
                    })}
                  </span>
                </span>
              ) : (
                primaryButtonLabel
              )}
            </button>
          </div>
        </form>

        {formStep === "ineligible" ? (
          <ApplyIneligibleStep onRetry={() => setFormStep("eligibility")} />
        ) : null}

        {formStep === "result" && resultBand ? (
          <ApplyResultStep
            resultBadgeClass={resultBadgeClass}
            resultBand={resultBand}
          />
        ) : null}
      </main>

      {shouldShowForm ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border-soft)] bg-[rgba(255,253,252,0.96)] p-4 backdrop-blur-sm md:hidden">
          <button
            type="submit"
            form="phq-test-form"
            disabled={isPrimaryButtonDisabled}
            className={
              showQuestionProgress
                ? "w-full max-w-[60rem] cursor-not-allowed rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] px-4 py-4 text-[var(--color-text-body)]"
                : isSubmitting
                  ? "w-full rounded-full bg-[var(--color-primary)] px-6 py-4 text-[16px] font-semibold text-white opacity-70"
                  : "w-full rounded-full bg-[var(--color-primary)] px-6 py-4 text-[16px] font-semibold text-white"
            }
          >
            {showQuestionProgress ? (
              <span className="flex w-full flex-col gap-2">
                <span className="text-sm font-semibold leading-none">
                  {questionProgressLabel}
                </span>
                <span className="grid grid-cols-9 gap-1.5">
                  {QUESTIONS.map((question, index) => {
                    const done = answers[index] >= 0;
                    return (
                      <span
                        key={`mobile-${question}`}
                        className={`h-1.5 rounded-full ${done ? "bg-[var(--color-primary)]" : "bg-[var(--color-primary-soft)]"}`}
                      />
                    );
                  })}
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
