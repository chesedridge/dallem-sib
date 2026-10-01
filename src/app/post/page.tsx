"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  isPostTiming,
  isValidAnswers,
  POST_SURVEY_ALREADY_COMPLETED,
  POST_SURVEY_ALREADY_COMPLETED_TITLE,
} from "@/lib/survey-policy";
import { SurveyStepActions } from "@/components/SurveyStepActions";
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
    timing: "",
  });
  const [answers, setAnswers] = useState<number[]>(
    Array.from({ length: QUESTIONS.length }, () => -1),
  );
  const [matchToken, setMatchToken] = useState("");
  const [preAnswers, setPreAnswers] = useState<number[]>([]);
  const [modal, setModal] = useState<{ title: string; body: string } | null>(
    null,
  );
  const modalRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (modal && !modalRef.current?.open) modalRef.current?.showModal();
  }, [modal]);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PostRespondentInfoErrors>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const resultBand = useMemo(() => {
    if (totalScore === null) {
      return null;
    }

    return findResultBand(totalScore);
  }, [totalScore]);
  const answeredCount = answers.filter((score) => score >= 0).length;
  const isQuestionStepComplete = answeredCount === QUESTIONS.length;
  const shouldShowForm = formStep === "info" || formStep === "question";
  const isLastQuestion = questionIndex === QUESTIONS.length - 1;
  const isCurrentQuestionAnswered = answers[questionIndex] >= 0;
  const primaryButtonLabel =
    formStep === "info"
      ? isSubmitting
        ? "기록 확인 중"
        : "검사 시작하기"
      : isSubmitting
        ? "불러오는중"
        : isLastQuestion
          ? "결과보기"
          : "다음";
  const isPrimaryButtonDisabled =
    isSubmitting ||
    (formStep === "question" &&
      (!isCurrentQuestionAnswered || (isLastQuestion && !isQuestionStepComplete)));
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
          timing: info.timing,
          matchToken,
          nickname: info.nickname.trim(),
          contact: info.contact.trim(),
          answers,
          totalScore: score,
        }),
      });
      const responseBody = (await response.json().catch(() => null)) as {
        code?: string;
        message?: string;
        preAnswers?: number[];
      } | null;

      if (
        response.status === 409 &&
        responseBody?.code === POST_SURVEY_ALREADY_COMPLETED
      ) {
        setFormStep("info");
        setAnswers(Array.from({ length: QUESTIONS.length }, () => -1));
        setQuestionIndex(0);
        setMatchToken("");
        setPreAnswers([]);
        setTotalScore(null);
        setInfo((previous) => ({ ...previous, timing: "" }));
        setFieldErrors({});
        setSubmitError("");
        setModal({
          title: POST_SURVEY_ALREADY_COMPLETED_TITLE,
          body:
            responseBody.message ??
            "같은 회기의 검사는 한 번만 진행할 수 있어요.",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!response.ok) {
        setSubmitError(
          responseBody?.message ??
            "응답 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
        return;
      }

      if (!isValidAnswers(responseBody?.preAnswers)) {
        setSubmitError(
          "비교 결과를 불러오지 못했습니다. 담당자에게 문의해주세요.",
        );
        return;
      }
      setPreAnswers(responseBody.preAnswers);
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

    if (isSubmitting) return;
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

      if (!isPostTiming(info.timing))
        nextFieldErrors.timing = "검사 진행 시기를 선택해주세요.";
      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        setModal({
          title: "입력하지 않았거나 확인이 필요한 항목이 있어요",
          body: "닉네임, 연락처, 사후검사 결과 진행 시기를 모두 확인해 주세요.",
        });
        return;
      }

      setFieldErrors({});
      setIsSubmitting(true);
      setSubmitError("");
      try {
        const response = await fetch("/api/post-survey-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname: info.nickname.trim(),
            contact: info.contact.trim(),
            timing: info.timing,
          }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || typeof result?.matchToken !== "string") {
          setModal({
            title:
              response.status === 409 &&
              result?.code === POST_SURVEY_ALREADY_COMPLETED
                ? POST_SURVEY_ALREADY_COMPLETED_TITLE
                : response.status === 404
                  ? "일치하는 정보가 없어요"
                  : "검사 기록을 확인하지 못했어요",
            body: result?.message ?? "잠시 후 다시 시도해주세요.",
          });
          return;
        }
        setMatchToken(result.matchToken);
        setQuestionIndex(0);
        setFormStep("question");
      } catch {
        setModal({
          title: "검사 기록을 확인하지 못했어요",
          body: "네트워크 연결을 확인한 뒤 다시 시도해주세요.",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!isCurrentQuestionAnswered) return;
    if (!isLastQuestion) {
      setQuestionIndex((index) => index + 1);
      return;
    }
    if (!isQuestionStepComplete || isSubmitting) {
      return;
    }

    await submitPostSurvey();
  };

  return (
    <div className={`min-h-screen bg-bg-warm-light pb-28 md:pb-20 ${formStep === "question" ? "pt-6 md:pt-10" : "pt-14 md:pt-20"}`}>
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
          className={`${formStep === "question" ? "mt-6" : "mt-10"} -mx-5 border-t border-solid border-[var(--color-border-soft)] sm:-mx-7 md:hidden`}
        />

        <form
          id="post-phq-test-form"
          onSubmit={submit}
          className={`space-y-8 ${formStep === "question" ? "mt-6 md:mt-8" : "mt-8 md:mt-16"} ${
            shouldShowForm ? "" : "hidden"
          }`}
        >
          {formStep === "info" ? (
            <fieldset disabled={isSubmitting}>
              <PostInfoStep
                fieldErrors={fieldErrors}
                info={info}
                onUpdateField={updateInfoField}
              />
            </fieldset>
          ) : formStep === "question" ? (
            <fieldset disabled={isSubmitting}>
              <ApplyQuestionStep
                answers={answers}
                onAnswerChange={updateAnswer}
                questionIndex={questionIndex}
              />
            </fieldset>
          ) : null}

          {submitError ? (
            <div
              role="alert"
              className="mx-auto max-w-[36rem] rounded-[20px] border border-[var(--color-primary)] bg-primary-soft px-4 py-3 text-left text-sm font-medium text-[var(--color-primary-strong)]"
            >
              <p>{submitError}</p>
              <button
                type="button"
                className="mt-3 min-h-11 underline underline-offset-4"
                onClick={() => {
                  setFormStep("info");
                  setMatchToken("");
                  setSubmitError("");
                }}
              >
                검사 시작 화면에서 다시 확인하기
              </button>
            </div>
          ) : null}
        </form>

        {formStep === "result" && resultBand && totalScore !== null ? (
          <PostResultStep
            resultBadgeClass={resultBadgeClass}
            resultBand={resultBand}
            totalScore={totalScore}
            preAnswers={preAnswers}
            answers={answers}
            timing={isPostTiming(info.timing) ? info.timing : "4"}
          />
        ) : null}
      </main>

      <dialog
        ref={modalRef}
        className="survey-modal"
        aria-labelledby="post-modal-title"
        aria-describedby="post-modal-description"
        onClose={() => setModal(null)}
      >
        <h2 id="post-modal-title" className="text-xl font-bold">
          {modal?.title}
        </h2>
        <p
          id="post-modal-description"
          className="mt-4 text-sm leading-6 text-text-body"
        >
          {modal?.body}
        </p>
        <p className="mt-4 text-sm text-text-body">
          문의{" "}
          <a href="mailto:help@dallem.com" className="font-bold">
            help@dallem.com
          </a>
        </p>
        <button
          type="button"
          className="survey-primary mt-6"
          onClick={() => modalRef.current?.close()}
        >
          확인
        </button>
      </dialog>
      {shouldShowForm ? (
        <SurveyStepActions
          formId="post-phq-test-form"
          primaryLabel={primaryButtonLabel}
          isPrimaryDisabled={isPrimaryButtonDisabled}
          onPrevious={
            formStep === "question"
              ? () => setQuestionIndex((index) => Math.max(0, index - 1))
              : undefined
          }
          isPreviousDisabled={questionIndex === 0 || isSubmitting}
        />
      ) : null}
    </div>
  );
}
