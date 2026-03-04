"use client";

import { FormEvent, useMemo, useState } from "react";

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
  gender: string;
  age: string;
  residence: string;
};

type InfoField = {
  key: keyof RespondentInfo;
  label: string;
  options: string[];
};

const INFO_FIELDS: InfoField[] = [
  {
    key: "gender",
    label: "성별",
    options: ["남", "여"],
  },
  {
    key: "age",
    label: "연령대",
    options: ["10대", "20대", "30대", "40대", "50대", "60대"],
  },
  {
    key: "residence",
    label: "거주지",
    options: [
      "광주광역시(동구)",
      "광주광역시(서구)",
      "광주광역시(남구)",
      "광주광역시(북구)",
      "광주광역시(광산구)",
      "광주광역시 이외 다른 지역",
    ],
  },
];

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
      "다소 경미한 수준의 우울감이 있으나 일상생활에 지장을 줄 정도는 아닙니다. 다만, 이러한 기분상태가 지속되면 개인의 신체적, 심리적 대처 자원을 저하시킬 수 있습니다. 그런 경우 가까운 정신건강복지센터나 정신건강의학과를 방문하거나 1577-0199(24시간 정신건강위기상담전화)를 이용하시기 바랍니다.",
  },
  {
    min: 10,
    max: 19,
    title: "10~19점 : 중간정도의 우울",
    description:
      "중간 정도 수준의 우울감이 시사됩니다. 이러한 수준의 우울감은 흔히 신체적, 심리적 대처 자원을 저하시키며 개인의 일상생활을 어렵게 만들기도 합니다. 가까운 정신신건강의학과를 방문하거나 1577-0199(24시간 정신건강위기상담전화)를 이용하시기 바랍니다.",
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
  const [info, setInfo] = useState<RespondentInfo>({
    gender: "",
    age: "",
    residence: "",
  });
  const [answers, setAnswers] = useState<number[]>(
    Array.from({ length: QUESTIONS.length }, () => -1),
  );
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const resultBand = useMemo(() => {
    if (totalScore === null) {
      return null;
    }

    return findResultBand(totalScore);
  }, [totalScore]);
  const answeredCount = answers.filter((score) => score >= 0).length;
  const progressPercent = Math.round((answeredCount / QUESTIONS.length) * 100);
  const scoreGaugePercent = totalScore === null ? 0 : Math.round((totalScore / 27) * 100);
  const resultBadgeClass =
    totalScore !== null && totalScore >= 20
      ? "border-red-200 bg-red-50 text-red-700"
      : totalScore !== null && totalScore >= 10
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!info.gender) {
      setErrorMessage("응답자 정보의 성별을 선택해주세요.");
      return;
    }

    if (!info.age) {
      setErrorMessage("응답자 정보의 연령대를 선택해주세요.");
      return;
    }

    if (!info.residence) {
      setErrorMessage("응답자 정보의 거주지를 선택해주세요.");
      return;
    }

    const unanswered = answers.findIndex((score) => score < 0);
    if (unanswered >= 0) {
      setErrorMessage(`${unanswered + 1}번 질문의 해당사항에 체크해주세요.`);
      return;
    }

    setErrorMessage("");
    const score = answers.reduce((acc, current) => acc + current, 0);
    setTotalScore(score);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff5e9_0%,#fffaf4_34%,#f8fafc_74%,#f7fafc_100%)] py-8 pb-32 md:py-16 md:pb-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute -right-20 top-44 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8">
        <header className="relative overflow-hidden rounded-[32px] border border-orange-200/80 bg-white/90 p-7 shadow-[0_26px_54px_-38px_rgba(15,23,42,0.58)] backdrop-blur md:p-12">
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-orange-200/80 to-amber-100/20"
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-orange-300/0 via-orange-300/80 to-orange-300/0"
          />

          <div className="relative grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-10">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold tracking-wide text-orange-700">
                자가검진 PHQ-9
              </p>
              <h1 className="mb-4 text-2xl font-bold leading-tight text-slate-900 md:text-4xl">
                우울(PHQ-9) 설문
              </h1>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                본 검진척도는 진단 도구가 아니며, 점수와 관계없이 일상생활에 불편함이 있다면
                정신건강전문가와 면담을 진행하시기 바랍니다.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.65)]">
                <p className="text-xs font-semibold text-slate-500">총 문항</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{QUESTIONS.length}문항</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.65)]">
                <p className="text-xs font-semibold text-slate-500">예상 소요 시간</p>
                <p className="mt-1 text-xl font-bold text-slate-900">약 1분</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.65)]">
                <p className="text-xs font-semibold text-slate-500">평가 기준</p>
                <p className="mt-1 text-xl font-bold text-slate-900">PHQ-9</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 md:sticky md:top-4 md:z-10 md:mt-8">
          <div className="rounded-2xl border border-orange-200/80 bg-white/92 px-5 py-5 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.52)] backdrop-blur md:px-7">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">진행률</p>
              <p className="text-sm font-semibold text-slate-600">
                {answeredCount}/{QUESTIONS.length} 문항 완료
              </p>
            </div>
            <div className="mt-4 h-2.5 rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-1.5">
              {QUESTIONS.map((question, index) => {
                const done = answers[index] >= 0;
                return (
                  <span
                    key={question}
                    className={`h-1.5 flex-1 rounded-full ${done ? "bg-orange-400" : "bg-slate-200"}`}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <form
          id="phq-test-form"
          onSubmit={submit}
          className="mt-10 space-y-10 md:mt-12 md:space-y-12"
        >
          <section className="rounded-[28px] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_44px_-36px_rgba(15,23,42,0.58)] md:p-10">
            <div className="mb-7 flex items-center gap-3">
              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                STEP 1
              </span>
              <h2 className="text-xl font-semibold text-slate-900">응답자 정보</h2>
            </div>
            <p className="mb-8 text-sm leading-6 text-slate-600">
              응답결과의 분류 목적으로만 활용되니 솔직하게 답변하여 주시기 바랍니다.
            </p>
            <div className="space-y-7">
              {INFO_FIELDS.map((field) => (
                <fieldset key={field.key} className="space-y-4">
                  <legend className="text-sm font-semibold text-slate-800">{field.label}</legend>
                  <div className="flex flex-wrap gap-3">
                    {field.options.map((option) => {
                      const selected = info[field.key] === option;

                      return (
                        <label
                          key={option}
                          className={`inline-flex max-w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition duration-200 ${
                            selected
                              ? "border-orange-400 bg-gradient-to-b from-orange-50 to-white text-orange-800 shadow-[0_14px_24px_-20px_rgba(249,115,22,0.9)]"
                              : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name={field.key}
                            value={option}
                            checked={selected}
                            onChange={(event) =>
                              setInfo((prev) => ({ ...prev, [field.key]: event.target.value }))
                            }
                            className="sr-only"
                          />
                          <span
                            className={`grid size-5 place-items-center rounded-full border text-[11px] font-bold ${
                              selected
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-slate-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span className="break-keep whitespace-normal leading-5">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white/95 p-7 shadow-[0_24px_44px_-36px_rgba(15,23,42,0.58)] md:p-10">
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-3">
                <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                  STEP 2
                </span>
                <h2 className="text-xl font-semibold text-slate-900">문항응답</h2>
                <span className="text-sm font-medium text-slate-500">/ 총 9문항</span>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                지난 2주간, 얼마나 자주 다음과 같은 문제들로 곤란을 겪으셨습니까?
              </p>
            </div>

            <ol className="space-y-6">
              {QUESTIONS.map((question, index) => (
                <li
                  key={question}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-5 shadow-[0_18px_30px_-30px_rgba(15,23,42,0.7)] md:p-6"
                >
                  <div className="mb-5 flex items-start gap-3">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-orange-500 to-amber-500 text-sm font-bold text-white shadow-[0_10px_14px_-12px_rgba(249,115,22,1)]">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-[15px] font-semibold leading-6 text-slate-900 md:text-base">
                      {question}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {ANSWER_OPTIONS.map((option) => {
                      const selected = answers[index] === option.score;

                      return (
                        <label
                          key={option.label}
                          className={`inline-flex min-h-11 cursor-pointer items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition duration-200 ${
                            selected
                              ? "border-orange-400 bg-orange-50 text-orange-800 shadow-[0_12px_22px_-20px_rgba(249,115,22,0.9)]"
                              : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/40"
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
                          <span className="font-semibold">{option.label}</span>
                          <span
                            className={`inline-flex min-w-10 items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
                              selected
                                ? "bg-orange-500 text-white"
                                : "bg-slate-100 text-slate-600"
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

          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="hidden justify-center pt-2 md:flex md:pt-3">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-11 py-3.5 text-base font-semibold text-white shadow-[0_22px_34px_-24px_rgba(249,115,22,1)] transition hover:brightness-105"
            >
              결과보기
            </button>
          </div>
        </form>

        {resultBand ? (
          <section className="mt-10 rounded-[28px] border border-orange-200/80 bg-white/95 p-7 shadow-[0_26px_44px_-34px_rgba(15,23,42,0.55)] md:mt-12 md:p-10">
            <p className="text-sm font-semibold text-orange-700">검사결과</p>
            <div className="mt-5 grid gap-8 md:grid-cols-[210px_1fr] md:items-center">
              <div
                className="relative mx-auto grid size-44 place-items-center rounded-full p-2"
                style={{
                  background: `conic-gradient(#f97316 ${scoreGaugePercent}%, #fed7aa ${scoreGaugePercent}% 100%)`,
                }}
              >
                <div className="grid size-full place-items-center rounded-full bg-white shadow-inner">
                  <span className="text-4xl font-extrabold text-orange-700">{totalScore}</span>
                  <span className="text-sm font-semibold text-slate-500">/ 27점</span>
                </div>
              </div>
              <div>
                <p
                  className={`mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${resultBadgeClass}`}
                >
                  판정 결과
                </p>
                <h2 className="mb-3 text-xl font-bold text-slate-900 md:text-2xl">
                  {resultBand.title}
                </h2>
                <p className="text-sm leading-7 text-slate-700 md:text-base">
                  {resultBand.description}
                </p>
                <p className="mt-5 text-xs text-slate-500 md:text-sm">
                  출처: 박승진 외(2010), 한글판 우울증선별도구(Patient Health
                  Questionnaire-9, PHQ-9)의 신뢰도와 타당도.
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-orange-200/70 bg-white/95 p-4 backdrop-blur md:hidden">
        <button
          type="submit"
          form="phq-test-form"
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_22px_34px_-24px_rgba(249,115,22,1)]"
        >
          결과보기
        </button>
      </div>
    </div>
  );
}
