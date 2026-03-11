"use client";

import { INFO_FIELDS } from "./constants";
import type {
  RespondentInfo,
  RespondentInfoErrors,
  RespondentTextFieldKey,
} from "./types";

type ApplyInfoStepProps = {
  fieldErrors: RespondentInfoErrors;
  info: RespondentInfo;
  onPrivacyConsentChange: (checked: boolean) => void;
  onUpdateField: (key: RespondentTextFieldKey, value: string) => void;
  submitError: string;
};

export function ApplyInfoStep({
  fieldErrors,
  info,
  onPrivacyConsentChange,
  onUpdateField,
  submitError,
}: ApplyInfoStepProps) {
  return (
    <section className="rounded-[36px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] p-8 text-center md:p-14">
      <div className="mb-2">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-[30px]">
          응답자 정보
        </h2>
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
                  aria-describedby={
                    fieldError ? `info-${field.key}-error` : undefined
                  }
                  onChange={(event) =>
                    onUpdateField(field.key, event.target.value)
                  }
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
            <p className="mt-2">
              1. 개인정보의 수집•이용 목적: 상담 안내 연락 및 혜택 제공
            </p>
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
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-[18px] border border-transparent bg-[var(--color-bg-white)] px-4 py-3 transition-colors hover:border-[var(--color-border-soft)]">
            <input
              type="checkbox"
              name="privacyConsent"
              checked={info.privacyConsent}
              onChange={(event) => onPrivacyConsentChange(event.target.checked)}
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
  );
}
