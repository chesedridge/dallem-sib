"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type AnswerOption = {
  label: string;
  score: number;
};

type ResultBand = {
  min: number;
  max: number;
  title: string;
  description: string;
};

type RespondentInfo = {
  nickname: string;
  contact: string;
  residence: string;
  privacyConsent: boolean;
};

type RespondentTextFieldKey = Exclude<keyof RespondentInfo, "privacyConsent">;
type RespondentInfoFieldKey = keyof RespondentInfo;
type RespondentInfoErrors = Partial<Record<RespondentInfoFieldKey, string>>;

type InfoField = {
  key: RespondentTextFieldKey;
  label: string;
  type: "text" | "tel" | "select";
  options?: string[];
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "numeric";
  maxLength?: number;
  pattern?: string;
};

type FormStep = "intro" | "question" | "info" | "result";

const INFO_FIELDS: InfoField[] = [
  {
    key: "nickname",
    label: "닉네임",
    type: "text",
    placeholder: "닉네임을 입력해주세요",
    autoComplete: "nickname",
    inputMode: "text",
  },
  {
    key: "contact",
    label: "연락처",
    type: "text",
    placeholder: "예: 01012345678",
    autoComplete: "tel",
    inputMode: "numeric",
    maxLength: 11,
    pattern: "^010\\d{7,8}$",
  },
  {
    key: "residence",
    label: "거주지",
    type: "select",
    options: [
      "가평군",
      "고양시",
      "과천시",
      "광명시",
      "광주시",
      "구리시",
      "군포시",
      "김포시",
      "남양주시",
      "동두천시",
      "부천시",
      "성남시",
      "수원시",
      "시흥시",
      "안산시",
      "안성시",
      "안양시",
      "양주시",
      "양평군",
      "여주시",
      "연천군",
      "오산시",
      "용인시",
      "의왕시",
      "의정부시",
      "이천시",
      "파주시",
      "평택시",
      "포천시",
      "하남시",
      "화성시",
    ],
  },
];

const DEFAULT_DEBUG_RESIDENCE =
  INFO_FIELDS.find((field) => field.key === "residence")?.options?.[0] ?? "";
const PHONE_PATTERN = /^010\d{7,8}$/;

const QUESTIONS = [
  "기분이 가라앉거나 우울하거나 희망이 없다고 느꼈다.",
  "평소 하던 일에 대한 흥미가 없어지거나 즐거움을 느끼지 못했다.",
  "잠들기가 어렵거나 자주 깼다. / 혹은 너무 많이 잤다.",
  "평소보다 식욕이 줄었다. / 혹은 평소보다 많이 먹었다.",
  "다른 사람들이 눈치 챌 정도로 평소보다 말과 행동이 느려졌다. / 혹은 너무 안절부절 못해서 가만히 앉아있을 수 없다.",
  "피곤하고 기운이 없었다.",
  "내가 잘못했거나, 실패했다는 생각이 들었다. / 혹은 자신과 가족을 실망시켰다고 생각했다.",
  "신문을 읽거나 TV를 보는 것과 같은 일상적인 일에도 집중할 수가 없었다.",
  "차라리 죽는 것이 더 낫겠다고 생각했다. / 혹은 자해할 생각을 했다.",
] as const;

const DEFAULT_DEBUG_ANSWERS = Array.from({ length: QUESTIONS.length }, () => 1);

const ANSWER_OPTIONS: AnswerOption[] = [
  { label: "없음", score: 0 },
  { label: "2~6일", score: 1 },
  { label: "7~12일", score: 2 },
  { label: "거의 매일", score: 3 },
];

const RESULT_BANDS: ResultBand[] = [
  {
    min: 0,
    max: 4,
    title: "0~4점 : 정상",
    description: "유의한 수준의 우울감이 시사되지 않습니다.",
  },
  {
    min: 5,
    max: 9,
    title: "5~9점 : 가벼운 우울",
    description:
      "다소 경미한 수준의 우울감이 있으나 일상생활에 지장을 줄 정도는 아닙니다. 다만, 이러한 기분상태가 지속되면 개인의 신체적, 심리적 대처 자원을 저하시킬 수 있습니다.",
  },
  {
    min: 10,
    max: 19,
    title: "10~19점 : 중간정도의 우울",
    description:
      "중간 정도 수준의 우울감이 시사됩니다. 이러한 수준의 우울감은 흔히 신체적, 심리적 대처 자원을 저하시키며 개인의 일상생활을 어렵게 만들기도 합니다.",
  },
  {
    min: 20,
    max: 27,
    title: "20~27점 : 심한 우울",
    description:
      "심한 수준의 우울감이 시사됩니다. 정신건강의학과의 치료적 개입과 평가가 요구됩니다.",
  },
];

function findResultBand(totalScore: number) {
  return (
    RESULT_BANDS.find((band) => totalScore >= band.min && totalScore <= band.max) ??
    RESULT_BANDS[0]
  );
}

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
  const showQuestionProgress = formStep === "question" && !isQuestionStepComplete;
  const questionProgressLabel = `${QUESTIONS.length}개중 ${answeredCount}개 완료`;
  const primaryButtonLabel =
    formStep === "question" ? "다음으로" : isSubmitting ? "저장 중..." : "결과보기";
  const isPrimaryButtonDisabled =
    isSubmitting || showQuestionProgress;
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

      const nextVisible = questionSection.getBoundingClientRect().top <= threshold;
      setShowProgressPanel((prev) => (prev === nextVisible ? prev : nextVisible));
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
    const nextValue = key === "contact" ? value.replace(/\D/g, "").slice(0, 11) : value;
    setInfo((prev) => ({ ...prev, [key]: nextValue }));
    clearFieldError(key);
    setSubmitError("");
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

    if (nextStep === "info") {
      setAnswers((prev) => prev.map((score, index) => (score >= 0 ? score : DEFAULT_DEBUG_ANSWERS[index])));
      setTotalScore(null);
      setFormStep("info");
      return;
    }

    const nextAnswers = answers.map((score, index) =>
      score >= 0 ? score : DEFAULT_DEBUG_ANSWERS[index],
    );
    const nextInfo: RespondentInfo = {
      nickname: info.nickname.trim() || "디버그 사용자",
      contact: PHONE_PATTERN.test(info.contact.trim()) ? info.contact.trim() : "01012345678",
      residence: info.residence || DEFAULT_DEBUG_RESIDENCE,
      privacyConsent: info.privacyConsent,
    };

    setAnswers(nextAnswers);
    setInfo(nextInfo);
    setTotalScore(nextAnswers.reduce((acc, current) => acc + current, 0));
    setFormStep("result");
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
      nextFieldErrors.contact = "010으로 시작하는 10~11자리 숫자를 입력해주세요.";
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

      const responseBody = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

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
      setSubmitError("응답 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-warm-light)] py-14 pb-28 md:py-20 md:pb-20">
      {isDebugMode ? (
        <div className="fixed right-4 top-4 z-50 w-[11rem] rounded-2xl border border-[var(--color-border-soft)] bg-[rgba(255,255,255,0.96)] p-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-sub)]">
            Debug Skip
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["intro", "question", "info", "result"] as FormStep[]).map((step) => (
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
              <p className="text-xs font-semibold text-[var(--color-text-sub)]">문항 진행</p>
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
                      done ? "bg-[var(--color-primary)]" : "bg-[var(--color-bg-gray)]"
                    }`}
                  />
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl px-5 sm:px-7 lg:px-10">
        <header className="py-10 text-center md:py-14">
          <p className="mb-2 text-[18px] font-extrabold tracking-[-0.03em] text-[var(--color-primary-strong)] md:text-[22px]">
            경기도 거주자, 직장인을 위한
          </p>
          <h1 className="mb-5 text-[26px] font-extrabold leading-[1.2] tracking-[-0.04em] text-[var(--color-text-dark)] md:text-[38px]">
            우울증 개선 및 자살예방 SIB사업
          </h1>
          <p className="mx-auto max-w-[42rem] text-[15px] leading-7 text-[var(--color-text-body)] md:text-[17px] md:leading-8">
            본 프로그램은 익명으로 참여하실 수 있으며, 전회차 무료로 진행됩니다.
          </p>
        </header>

        {formStep === "intro" ? (
          <section className="mt-14 rounded-[36px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] p-8 text-center md:mt-16 md:p-14">
            <p className="text-[18px] font-bold leading-8 tracking-[-0.02em] text-[var(--color-text-dark)] md:text-[22px] md:leading-9">
              우울증 파악을 위한 PHQ-9 (우울증 테스트)을 시작합니다.
            </p>
            <p className="mt-3 text-[15px] leading-7 text-[var(--color-text-sub)] md:text-[17px]">
              테스트는 1분 정도 소요됩니다.
            </p>
            <button
              type="button"
              onClick={() => setFormStep("question")}
              className="mt-10 rounded-full bg-[var(--color-primary)] px-14 py-4 text-[17px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-light)]"
            >
              시작하기
            </button>
          </section>
        ) : null}

        <form
          id="phq-test-form"
          onSubmit={submit}
          className={`mt-14 space-y-14 md:mt-16 md:space-y-16 ${
            formStep === "intro" || formStep === "result" ? "hidden" : ""
          }`}
        >
          {formStep === "question" ? (
            <section ref={questionSectionRef} className="rounded-[36px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] p-8 text-center md:p-14">
              <div className="mb-12">
                <div className="mb-3 flex items-center justify-center gap-3">
                  <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-[30px]">문항응답</h2>
                  <span className="text-sm font-medium text-[var(--color-text-sub)] md:text-base">
                    / 총 9문항
                  </span>
                </div>
                <p className="text-[15px] leading-7 text-[var(--color-text-sub)] md:text-[17px] md:leading-8">
                  지난 2주간, 얼마나 자주 다음과 같은 문제들로 곤란을 겪으셨습니까?
                </p>
              </div>

              <ol className="space-y-7 md:space-y-8">
                {QUESTIONS.map((question, index) => (
                  <li
                    key={question}
                    className="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-bg-gray)] p-6 md:p-9"
                  >
                    <div className="mb-7 flex flex-col items-center gap-3 md:gap-4">
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white md:size-10 md:text-base">
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
                                ? "border-[var(--color-border-strong)] bg-[var(--color-primary-soft)] text-[var(--color-text-dark)]"
                                : "border-transparent bg-[var(--color-bg-white)] text-[var(--color-text-body)] hover:border-[var(--color-border-soft)] hover:bg-[var(--color-bg-warm-light)]"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${index + 1}`}
                              value={option.score}
                              checked={selected}
                              onChange={() =>
                                setAnswers((prev) => {
                                  const next = [...prev];
                                  next[index] = option.score;
                                  return next;
                                })
                              }
                              className="sr-only"
                            />
                            <span className="font-semibold tracking-[-0.01em]">{option.label}</span>
                            <span
                              className={`inline-flex min-w-10 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                selected
                                  ? "bg-[var(--color-primary)] text-white"
                                  : "bg-[var(--color-bg-gray)] text-[var(--color-text-sub)]"
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
          ) : (
            <section className="rounded-[36px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] p-8 text-center md:p-14">
              <div className="mb-8">
                <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-[30px]">응답자 정보</h2>
              </div>
              <p className="mb-12 text-[15px] leading-7 text-[var(--color-text-sub)] md:text-[17px] md:leading-8">
                대상자분에게 상담 예약을 위해 담당자가 직접 연락 드릴 예정입니다.
              </p>
              <div className="space-y-9">
                {INFO_FIELDS.map((field) => {
                  const fieldError = fieldErrors[field.key];
                  const inputClassName = fieldError
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                    : "border-transparent bg-[var(--color-bg-gray)]";

                  return (
                    <div key={field.key} className="mx-auto max-w-[36rem] space-y-3.5 text-left">
                      <label
                        htmlFor={`info-${field.key}`}
                        className="block text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]"
                      >
                        {field.label}
                      </label>

                      {field.type === "select" ? (
                        <div className="relative">
                          <select
                            id={`info-${field.key}`}
                            name={field.key}
                            value={info[field.key]}
                            aria-invalid={fieldError ? "true" : "false"}
                            aria-describedby={fieldError ? `info-${field.key}-error` : undefined}
                            onChange={(event) => updateInfoField(field.key, event.target.value)}
                            className={`h-14 w-full appearance-none rounded-[18px] border px-5 pr-12 text-[15px] text-[var(--color-text-body)] outline-none transition-colors focus:border-[var(--color-border-strong)] focus:bg-[var(--color-bg-white)] ${inputClassName}`}
                          >
                            <option value="">거주지를 선택해주세요</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-sub)]">
                            ▾
                          </span>
                        </div>
                      ) : (
                        <input
                          id={`info-${field.key}`}
                          name={field.key}
                          type={field.type}
                          value={info[field.key]}
                          placeholder={field.placeholder}
                          autoComplete={field.autoComplete}
                          inputMode={field.inputMode}
                          maxLength={field.maxLength}
                          pattern={field.pattern}
                          aria-invalid={fieldError ? "true" : "false"}
                          aria-describedby={fieldError ? `info-${field.key}-error` : undefined}
                          onChange={(event) => updateInfoField(field.key, event.target.value)}
                          className={`h-14 w-full rounded-[18px] border px-5 text-[15px] text-[var(--color-text-body)] outline-none transition-colors placeholder:text-[var(--color-text-sub)] focus:border-[var(--color-border-strong)] focus:bg-[var(--color-bg-white)] ${inputClassName}`}
                        />
                      )}

                      {fieldError ? (
                        <p
                          id={`info-${field.key}-error`}
                          className="text-sm font-medium text-[var(--color-primary-strong)]"
                        >
                          {fieldError}
                        </p>
                      ) : null}
                    </div>
                  );
                })}

                <div className="mx-auto max-w-[36rem] rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-bg-gray)] p-5 text-left">
                  <p className="text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]">
                    개인정보 수집 및 이용 동의
                  </p>
                  <div className="mt-3 rounded-[18px] bg-[var(--color-bg-white)] px-4 py-4 text-sm leading-6 text-[var(--color-text-sub)]">
                    <p className="font-semibold text-[var(--color-text-body)]">
                      개인정보 수집 및 이용 동의서
                    </p>
                    <p className="mt-2">1. 개인정보의 수집•이용 목적: 상담 안내 연락 및 혜택 제공</p>
                    <p>2. 수집하는 개인정보의 항목: 닉네임, 휴대폰 번호</p>
                    <p>
                      3. 개인정보의 이용 기간: 프로젝트 운영 기간
                      <br />
                      (2026년 4월~2027년 4월)
                    </p>
                    <p className="mt-3 font-semibold text-[var(--color-text-body)]">
                      개인정보 제3자 제공 동의
                    </p>
                    <p className="mt-2">1. 개인정보를 제공받는 자: 헤세드릿지</p>
                  </div>
                  <label
                    className="mt-4 flex cursor-pointer items-center gap-3 rounded-[18px] border border-transparent bg-[var(--color-bg-white)] px-4 py-3 transition-colors hover:border-[var(--color-border-soft)]"
                  >
                    <input
                      type="checkbox"
                      name="privacyConsent"
                      checked={info.privacyConsent}
                      onChange={(event) => {
                        setInfo((prev) => ({
                          ...prev,
                          privacyConsent: event.target.checked,
                        }));
                        clearFieldError("privacyConsent");
                        setSubmitError("");
                      }}
                      className="peer sr-only"
                    />
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-[8px] border border-[var(--color-border-strong)] bg-[var(--color-bg-white)] text-transparent transition-all peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary-soft)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--color-bg-white)]">
                      <svg
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        className="size-3.5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 5.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-[var(--color-text-body)] transition-colors peer-checked:text-[var(--color-text-dark)]">
                      개인정보 수집 및 이용에 동의합니다. (선택)
                    </span>
                  </label>
                </div>
              </div>

              {submitError ? (
                <div className="mx-auto max-w-[36rem] rounded-[20px] border border-[var(--color-primary)] bg-[var(--color-primary-soft)] px-4 py-3 text-left text-sm font-medium text-[var(--color-primary-strong)]">
                  {submitError}
                </div>
              ) : null}
            </section>
          )}

          <div className="hidden w-full justify-center pt-2 md:flex md:pt-4">
            <button
              type="submit"
              disabled={isPrimaryButtonDisabled}
              className={
                showQuestionProgress
                  ? "w-full max-w-[60rem] cursor-not-allowed rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] px-5 py-4 text-[var(--color-text-body)]"
                  : isSubmitting
                    ? "rounded-full bg-[var(--color-primary)] px-12 py-4 text-[17px] font-semibold text-white opacity-70"
                  : "rounded-full bg-[var(--color-primary)] px-12 py-4 text-[17px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-light)]"
              }
            >
              {showQuestionProgress ? (
                <span className="flex w-full flex-col gap-2">
                  <span className="text-sm font-semibold leading-none">{questionProgressLabel}</span>
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

        {formStep === "result" && resultBand ? (
          <section className="mt-14 rounded-[36px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] p-8 text-center md:mt-16 md:p-14">
            <div className="mx-auto max-w-3xl text-center">
                <p
                  className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${resultBadgeClass}`}
                >
                  판정 결과
                </p>
                <h2 className="mb-4 text-[28px] font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-[38px]">
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
            <div className="mx-auto mt-8 max-w-3xl rounded-[28px] bg-[var(--color-bg-warm-light)] px-6 py-7 text-left">
              <p className="text-[15px] font-semibold leading-7 text-[var(--color-text-dark)] md:text-[17px] md:leading-8">
                아쉽지만 다행스럽게(?)도 이번 프로젝트의 대상자는 아닙니다.
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-body)] md:text-[15px] md:leading-7">
                현재의 멘탈이 양호한 상태이니 앞으로도 꾸준한 관리를 통해 지금과 같은
                멘탈 건강을 계속 유지해 나가시면 좋겠습니다.
              </p>
            </div>
          </section>
        ) : null}
      </main>

      {formStep !== "intro" && formStep !== "result" ? (
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
              <span className="text-sm font-semibold leading-none">{questionProgressLabel}</span>
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
