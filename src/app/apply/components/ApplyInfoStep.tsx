"use client";

import { AFFILIATION_OPTIONS } from "@/lib/survey-policy";

import {
  CONSULTATION_METHOD_OPTIONS,
  INFO_FIELDS,
} from "./constants";
import type {
  RespondentInfo,
  RespondentInfoErrors,
  RespondentTextFieldKey,
} from "./types";
import {
  getKoreaDateString,
  PREFERRED_SCHEDULE_LIMIT,
  PREFERRED_SCHEDULE_MAX_DATE,
  type PreferredSchedule,
} from "@/lib/preferred-schedule";

type ApplyInfoStepProps = {
  fieldErrors: RespondentInfoErrors;
  info: RespondentInfo;
  onPrivacyConsentChange: (checked: boolean) => void;
  onUpdateField: (key: RespondentTextFieldKey, value: string) => void;
  onUpdatePreferredSchedule: (
    index: number,
    field: keyof PreferredSchedule,
    value: string,
  ) => void;
  submitError: string;
};

export function ApplyInfoStep({
  fieldErrors,
  info,
  onPrivacyConsentChange,
  onUpdateField,
  onUpdatePreferredSchedule,
  submitError,
}: ApplyInfoStepProps) {
  const today = getKoreaDateString();
  const preferredSchedules = Array.from(
    { length: PREFERRED_SCHEDULE_LIMIT },
    (_, index) => info.preferredSchedules[index] ?? { date: "", time: "" },
  );

  return (
    <section className="mx-auto max-w-[48rem] text-center md:rounded-[36px] md:border md:border-[var(--color-border-soft)] md:bg-white md:p-14 md:shadow-[0_12px_40px_rgba(128,86,79,0.06)]">
      <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-3xl">
          응답자 정보
        </h2>
        <p className="text-[15px] leading-7 break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          대상자분에게 상담 예약을 위해 담당자가 직접 연락 드릴 예정입니다.
        </p>
      </div>
      <div className="space-y-8 md:space-y-9">
        <fieldset className="mx-auto max-w-[36rem] space-y-3 text-left" aria-describedby={fieldErrors.affiliation ? "affiliation-error" : undefined}>
          <legend className="text-[15px] font-semibold md:text-[17px]">소속확인</legend>
          <p className="text-sm text-text-sub">직장인 소속을 선택해주세요.</p>
          {AFFILIATION_OPTIONS.map(option => (
            <label key={option} className="survey-choice">
              <input type="radio" name="affiliation" value={option} checked={info.affiliation === option} onChange={() => onUpdateField("affiliation", option)} />
              <span>{option}</span>
            </label>
          ))}
          {fieldErrors.affiliation && <p id="affiliation-error" role="alert" className="text-sm text-primary-strong">{fieldErrors.affiliation}</p>}
        </fieldset>
        {INFO_FIELDS.map((field) => {
          const fieldError = fieldErrors[field.key];
          const inputClassName = fieldError
            ? "border-[var(--color-primary)] bg-primary-soft"
            : "border-transparent bg-bg-gray";

          return (
            <div
              key={field.key}
              className="mx-auto max-w-[36rem] space-y-3.5 text-left"
            >
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
                    aria-describedby={
                      fieldError ? `info-${field.key}-error` : undefined
                    }
                    onChange={(event) =>
                      onUpdateField(field.key, event.target.value)
                    }
                    className={`h-14 w-full appearance-none rounded-[18px] border px-5 pr-12 text-[15px] text-[var(--color-text-body)] outline-none transition-colors focus:border-[var(--color-border-strong)] focus:bg-bg-white ${inputClassName}`}
                  >
                    <option value="">{field.placeholder ?? "선택해주세요"}</option>
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
                  max={field.max}
                  aria-invalid={fieldError ? "true" : "false"}
                  aria-describedby={
                    fieldError ? `info-${field.key}-error` : undefined
                  }
                  onChange={(event) =>
                    onUpdateField(field.key, event.target.value)
                  }
                  className={`h-14 w-full rounded-[18px] border px-5 text-[15px] text-[var(--color-text-body)] outline-none transition-colors placeholder:text-[var(--color-text-sub)] focus:border-[var(--color-border-strong)] focus:bg-bg-white ${inputClassName}`}
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

        <div className="mx-auto max-w-[36rem] space-y-3.5 text-left">
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]">
              상담방법
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-sub)]">
              전문가와 상담을 진행하고 싶은 방법을 선택해주세요.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {CONSULTATION_METHOD_OPTIONS.map((option) => {
              const checked = info.consultationMethod === option;
              const hasError = Boolean(fieldErrors.consultationMethod);

              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-3 rounded-[20px] border px-4 py-4 transition-colors ${
                    checked
                      ? "border-[var(--color-primary)] bg-primary-soft"
                      : hasError
                        ? "border-[var(--color-primary)] bg-primary-soft"
                        : "border-[var(--color-border-soft)] bg-bg-gray hover:border-[var(--color-border-strong)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="consultationMethod"
                    value={option}
                    checked={checked}
                    onChange={(event) =>
                      onUpdateField("consultationMethod", event.target.value)
                    }
                    className="peer sr-only"
                  />
                  <span
                    className={`flex size-5 shrink-0 rounded-full border transition-colors ${
                      checked
                        ? "border-[var(--color-primary)] bg-primary shadow-[inset_0_0_0_4px_var(--color-primary-soft)]"
                        : "border-[var(--color-border-strong)] bg-bg-white"
                    }`}
                  />
                  <span className="text-[15px] font-medium text-[var(--color-text-body)]">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
          {fieldErrors.consultationMethod ? (
            <p className="text-sm font-medium text-[var(--color-primary-strong)]">
              {fieldErrors.consultationMethod}
            </p>
          ) : null}
        </div>

        <div className="mx-auto max-w-[36rem] space-y-3.5 text-left">
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]">
              희망 일정
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-sub)]">
              날짜와 시간을 모두 선택해주세요. 희망 일정 3개는 모두 필수입니다.
            </p>
          </div>
          <div className="space-y-3">
            {preferredSchedules.map((schedule, index) => (
              <div
                key={index}
                className={`rounded-[20px] border p-4 ${
                  fieldErrors.preferredSchedules
                    ? "border-[var(--color-primary)] bg-primary-soft"
                    : "border-[var(--color-border-soft)] bg-bg-gray"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--color-text-body)]">
                    희망 일정 {index + 1}
                  </p>
                  <span className="rounded-full bg-bg-white px-2.5 py-1 text-xs font-medium text-[var(--color-text-sub)]">
                    필수
                  </span>
                </div>
                <div className="mt-3 grid gap-3 min-[360px]:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="block text-sm font-medium text-[var(--color-text-body)]">
                      날짜
                    </span>
                    <input
                      type="date"
                      name={`preferredScheduleDate-${index + 1}`}
                      value={schedule.date}
                      min={today}
                      max={PREFERRED_SCHEDULE_MAX_DATE}
                      aria-invalid={
                        fieldErrors.preferredSchedules ? "true" : "false"
                      }
                      aria-describedby={
                        fieldErrors.preferredSchedules
                          ? "preferredSchedules-error"
                          : undefined
                      }
                      onChange={(event) =>
                        onUpdatePreferredSchedule(index, "date", event.target.value)
                      }
                      className="h-14 w-full min-w-0 rounded-[18px] border border-transparent bg-bg-white px-2 text-[14px] md:px-4 md:text-[15px] text-[var(--color-text-body)] outline-none transition-colors focus:border-[var(--color-border-strong)]"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="block text-sm font-medium text-[var(--color-text-body)]">
                      시간
                    </span>
                    <input
                      type="time"
                      name={`preferredScheduleTime-${index + 1}`}
                      value={schedule.time}
                      aria-invalid={
                        fieldErrors.preferredSchedules ? "true" : "false"
                      }
                      aria-describedby={
                        fieldErrors.preferredSchedules
                          ? "preferredSchedules-error"
                          : undefined
                      }
                      onChange={(event) =>
                        onUpdatePreferredSchedule(index, "time", event.target.value)
                      }
                      className="h-14 w-full min-w-0 rounded-[18px] border border-transparent bg-bg-white px-2 text-[14px] md:px-4 md:text-[15px] text-[var(--color-text-body)] outline-none transition-colors focus:border-[var(--color-border-strong)]"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          {fieldErrors.preferredSchedules ? (
            <p
              id="preferredSchedules-error"
              className="text-sm font-medium text-[var(--color-primary-strong)]"
            >
              {fieldErrors.preferredSchedules}
            </p>
          ) : null}
        </div>

        <div className="mx-auto max-w-[36rem] rounded-[24px] border border-[var(--color-border-soft)] bg-bg-gray p-5 text-left">
          <p className="text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]">
            개인정보 수집 및 이용 동의
          </p>
          <div className="mt-3 rounded-[18px] bg-bg-white px-4 py-4 text-sm leading-6 text-[var(--color-text-sub)]">
            <p className="font-semibold text-[var(--color-text-body)]">
              개인정보 수집 및 이용 동의서
            </p>
            <p className="mt-2">
              1. 수집·이용 목적
            </p>
            <p>
              상담 안내 및 연락, 상담사 매칭·배정, 일정 조율 및 대리 예약,
              계정 생성, 상담 이행 관리 (리마인드·노쇼 처리), 연락처를 통한 사전·사후 검사 결과 연결 및 비교
            </p>
            <p className="mt-2">2. 수집 항목</p>
            <p>
              닉네임(또는 이름), 휴대폰 번호, 소속 구분, 상담방법, 희망 일정(날짜·시간),
              검사 응답 및 결과, 사후검사 시기
            </p>
            <p className="mt-2">3. 보유 및 이용 기간</p>
            <p>
              프로젝트 운영 기간 (2026년 4월 ~ 2027년 4월)
              <br />
              단, 관계 법령에 따라 보존이 필요한 경우 해당 기간
            </p>
            <p className="mt-3 font-semibold text-[var(--color-text-body)]">
              개인정보 제3자 제공 동의
            </p>
            <p className="mt-2">1. 제공받는 자 : 헤세드릿지(마음달램)</p>
            <p>2. 제공 목적 : 심리상담 서비스 제공 및 운영</p>
            <p>3. 제공 항목 : 위 수집 항목 전체</p>
            <p>4. 보유 및 이용 기간 : 서비스 이용 종료 시까지</p>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-[18px] border border-transparent bg-bg-white px-4 py-3 transition-colors hover:border-[var(--color-border-soft)]">
            <input
              type="checkbox"
              name="privacyConsent"
              checked={info.privacyConsent}
              aria-invalid={fieldErrors.privacyConsent ? "true" : "false"}
              aria-describedby={
                fieldErrors.privacyConsent ? "privacyConsent-error" : undefined
              }
              onChange={(event) => onPrivacyConsentChange(event.target.checked)}
              className="peer sr-only"
            />
            <span className="flex size-6 shrink-0 items-center justify-center rounded-[8px] border border-[var(--color-border-strong)] bg-bg-white text-transparent transition-all peer-checked:border-[var(--color-primary)] peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary-soft)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--color-bg-white)]">
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
              개인정보 수집 및 이용에 동의합니다. (필수)
            </span>
          </label>
          {fieldErrors.privacyConsent ? (
            <p
              id="privacyConsent-error"
              className="mt-3 text-sm font-medium text-[var(--color-primary-strong)]"
            >
              {fieldErrors.privacyConsent}
            </p>
          ) : null}
        </div>
      </div>

      {submitError ? (
        <div className="mx-auto max-w-[36rem] rounded-[20px] border border-[var(--color-primary)] bg-primary-soft px-4 py-3 text-left text-sm font-medium text-[var(--color-primary-strong)]">
          {submitError}
        </div>
      ) : null}
    </section>
  );
}
