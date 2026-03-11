"use client";

import { useEffect, useId, useRef, useState } from "react";

import {
  CONSULTATION_METHOD_OPTIONS,
  CONSULTATION_TOPIC_OPTIONS,
  EXPECTED_SUPPORT_OPTIONS,
  HARDSHIP_LEVEL_OPTIONS,
  INFO_FIELDS,
  SUPPORT_TOPIC_OPTIONS,
} from "./constants";
import type {
  RespondentInfo,
  RespondentInfoErrors,
  RespondentTextFieldKey,
} from "./types";

type ApplyInfoStepProps = {
  fieldErrors: RespondentInfoErrors;
  info: RespondentInfo;
  onToggleExpectedSupport: (option: string) => void;
  onPrivacyConsentChange: (checked: boolean) => void;
  onToggleSupportTopic: (topic: string) => void;
  onUpdateField: (key: RespondentTextFieldKey, value: string) => void;
  submitError: string;
};

type DropdownOptionLabelFormatter = (option: string) => string;

type SingleSelectDropdownProps = {
  error?: string;
  helperText?: string;
  label: string;
  onSelect: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  value: string;
  formatOptionLabel?: DropdownOptionLabelFormatter;
};

type MultiSelectDropdownProps = {
  error?: string;
  helperText?: string;
  label: string;
  maxSelections: number;
  onToggle: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  selectedValues: string[];
  formatOptionLabel?: DropdownOptionLabelFormatter;
};

function useDropdownState() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return { open, rootRef, setOpen };
}

function SingleSelectDropdown({
  error,
  helperText,
  label,
  onSelect,
  options,
  placeholder,
  value,
  formatOptionLabel = (option) => option,
}: SingleSelectDropdownProps) {
  const { open, rootRef, setOpen } = useDropdownState();
  const panelId = useId();
  const selectedLabel = value ? formatOptionLabel(value) : "";

  return (
    <div className="mx-auto max-w-[36rem] space-y-3.5 text-left">
      <div>
        <p className="text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]">
          {label}
        </p>
        {helperText ? (
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-sub)]">
            {helperText}
          </p>
        ) : null}
      </div>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-[18px] border px-5 py-4 text-left text-[15px] outline-none transition-colors focus:border-[var(--color-border-strong)] focus:bg-[var(--color-bg-white)] ${
            error
              ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
              : open
                ? "border-[var(--color-border-strong)] bg-[var(--color-bg-white)]"
                : "border-transparent bg-[var(--color-bg-gray)]"
          }`}
        >
          <span
            className={
              value
                ? "font-medium text-[var(--color-text-body)]"
                : "text-[var(--color-text-sub)]"
            }
          >
            {value ? selectedLabel : placeholder}
          </span>
          <span
            className={`shrink-0 text-[var(--color-text-sub)] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>

        {open ? (
          <div
            id={panelId}
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
          >
            <div className="max-h-80 overflow-y-auto p-2">
              {options.map((option) => {
                const selected = value === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onSelect(option);
                      setOpen(false);
                    }}
                    className={`flex w-full items-start gap-3 rounded-[18px] px-4 py-3 text-left transition-colors ${
                      selected
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                        : "text-[var(--color-text-body)] hover:bg-[var(--color-bg-gray)]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 rounded-full border ${
                        selected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] shadow-[inset_0_0_0_4px_var(--color-primary-soft)]"
                          : "border-[var(--color-border-strong)] bg-[var(--color-bg-white)]"
                      }`}
                    />
                    <span className="leading-6">{formatOptionLabel(option)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm font-medium text-[var(--color-primary-strong)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function MultiSelectDropdown({
  error,
  helperText,
  label,
  maxSelections,
  onToggle,
  options,
  placeholder,
  selectedValues,
  formatOptionLabel = (option) => option,
}: MultiSelectDropdownProps) {
  const { open, rootRef, setOpen } = useDropdownState();
  const panelId = useId();

  return (
    <div className="mx-auto max-w-[36rem] space-y-3.5 text-left">
      <div>
        <p className="text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]">
          {label}
        </p>
        {helperText ? (
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-sub)]">
            {helperText}
          </p>
        ) : null}
      </div>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-[18px] border px-5 py-4 text-left outline-none transition-colors focus:border-[var(--color-border-strong)] focus:bg-[var(--color-bg-white)] ${
            error
              ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
              : open
                ? "border-[var(--color-border-strong)] bg-[var(--color-bg-white)]"
                : "border-transparent bg-[var(--color-bg-gray)]"
          }`}
        >
          {selectedValues.length > 0 ? (
            <span className="flex flex-wrap gap-2">
              {selectedValues.map((value) => (
                <span
                  key={value}
                  className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-[13px] font-medium text-[var(--color-primary-strong)]"
                >
                  {formatOptionLabel(value)}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-[15px] text-[var(--color-text-sub)]">
              {placeholder}
            </span>
          )}
          <span className="flex shrink-0 items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-text-sub)]">
              {selectedValues.length}/{maxSelections}
            </span>
            <span
              className={`text-[var(--color-text-sub)] transition-transform ${
                open ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </span>
        </button>

        {open ? (
          <div
            id={panelId}
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
          >
            <div className="border-b border-[var(--color-border-soft)] px-4 py-3 text-xs font-semibold text-[var(--color-text-sub)]">
              최대 {maxSelections}개까지 선택할 수 있습니다.
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {options.map((option) => {
                const selected = selectedValues.includes(option);
                const disabled = !selected && selectedValues.length >= maxSelections;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggle(option)}
                    className={`flex w-full items-start gap-3 rounded-[18px] px-4 py-3 text-left transition-colors ${
                      selected
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                        : disabled
                          ? "cursor-not-allowed opacity-50"
                          : "text-[var(--color-text-body)] hover:bg-[var(--color-bg-gray)]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border ${
                        selected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-[var(--color-border-strong)] bg-[var(--color-bg-white)] text-transparent"
                      }`}
                    >
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
                    <span className="leading-6">{formatOptionLabel(option)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm font-medium text-[var(--color-primary-strong)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ApplyInfoStep({
  fieldErrors,
  info,
  onToggleExpectedSupport,
  onPrivacyConsentChange,
  onToggleSupportTopic,
  onUpdateField,
  submitError,
}: ApplyInfoStepProps) {
  const formatTopicLabel = (option: string) =>
    option === "기타" ? "기타(직접 입력)" : option;

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
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : hasError
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                        : "border-[var(--color-border-soft)] bg-[var(--color-bg-gray)] hover:border-[var(--color-border-strong)]"
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
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] shadow-[inset_0_0_0_4px_var(--color-primary-soft)]"
                        : "border-[var(--color-border-strong)] bg-[var(--color-bg-white)]"
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

        <SingleSelectDropdown
          label="상담주제"
          helperText="상담에서 가장 다루고 싶은 주제를 선택해주세요. 가장 힘든 것이 ‘업무 스트레스’라면 ‘업무 과부하·번아웃’을 선택해주세요."
          options={CONSULTATION_TOPIC_OPTIONS}
          value={info.consultationTopic}
          placeholder="상담주제를 선택해주세요"
          onSelect={(value) => onUpdateField("consultationTopic", value)}
          formatOptionLabel={formatTopicLabel}
          error={fieldErrors.consultationTopic}
        />
        {info.consultationTopic === "기타" ? (
          <div className="mx-auto max-w-[36rem] space-y-3 text-left">
            <label
              htmlFor="info-consultationTopicDetail"
              className="block text-sm font-medium text-[var(--color-text-body)]"
            >
              기타 상담주제
            </label>
            <input
              id="info-consultationTopicDetail"
              name="consultationTopicDetail"
              type="text"
              value={info.consultationTopicDetail}
              placeholder="원하는 상담주제를 직접 입력해주세요"
              aria-invalid={
                fieldErrors.consultationTopicDetail ? "true" : "false"
              }
              aria-describedby={
                fieldErrors.consultationTopicDetail
                  ? "info-consultationTopicDetail-error"
                  : undefined
              }
              onChange={(event) =>
                onUpdateField("consultationTopicDetail", event.target.value)
              }
              className={`h-14 w-full rounded-[18px] border px-5 text-[15px] text-[var(--color-text-body)] outline-none transition-colors placeholder:text-[var(--color-text-sub)] focus:border-[var(--color-border-strong)] focus:bg-[var(--color-bg-white)] ${
                fieldErrors.consultationTopicDetail
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                  : "border-transparent bg-[var(--color-bg-gray)]"
              }`}
            />
            {fieldErrors.consultationTopicDetail ? (
              <p
                id="info-consultationTopicDetail-error"
                className="text-sm font-medium text-[var(--color-primary-strong)]"
              >
                {fieldErrors.consultationTopicDetail}
              </p>
            ) : null}
          </div>
        ) : null}

        <MultiSelectDropdown
          label="추가 상담주제 (선택)"
          helperText="현재 가장 도움이 필요하다고 느끼는 주제를 선택해주세요. 필요 시 상담 과정에서 다른 주제도 함께 다룰 수 있습니다."
          options={SUPPORT_TOPIC_OPTIONS}
          selectedValues={info.supportTopics}
          placeholder="추가 상담주제를 선택해주세요"
          maxSelections={2}
          onToggle={onToggleSupportTopic}
          formatOptionLabel={formatTopicLabel}
          error={fieldErrors.supportTopics}
        />
        {info.supportTopics.includes("기타") ? (
          <div className="mx-auto max-w-[36rem] space-y-3 text-left">
            <label
              htmlFor="info-supportTopicsDetail"
              className="block text-sm font-medium text-[var(--color-text-body)]"
            >
              추가 상담주제 기타
            </label>
            <input
              id="info-supportTopicsDetail"
              name="supportTopicsDetail"
              type="text"
              value={info.supportTopicsDetail}
              placeholder="도움이 필요한 주제를 직접 입력해주세요"
              aria-invalid={fieldErrors.supportTopicsDetail ? "true" : "false"}
              aria-describedby={
                fieldErrors.supportTopicsDetail
                  ? "info-supportTopicsDetail-error"
                  : undefined
              }
              onChange={(event) =>
                onUpdateField("supportTopicsDetail", event.target.value)
              }
              className={`h-14 w-full rounded-[18px] border px-5 text-[15px] text-[var(--color-text-body)] outline-none transition-colors placeholder:text-[var(--color-text-sub)] focus:border-[var(--color-border-strong)] focus:bg-[var(--color-bg-white)] ${
                fieldErrors.supportTopicsDetail
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                  : "border-transparent bg-[var(--color-bg-gray)]"
              }`}
            />
            {fieldErrors.supportTopicsDetail ? (
              <p
                id="info-supportTopicsDetail-error"
                className="text-sm font-medium text-[var(--color-primary-strong)]"
              >
                {fieldErrors.supportTopicsDetail}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mx-auto max-w-[36rem] space-y-3.5 text-left">
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]">
              현재 가장 힘든 정도
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {HARDSHIP_LEVEL_OPTIONS.map((option) => {
              const checked = info.hardshipLevel === option;
              const hasError = Boolean(fieldErrors.hardshipLevel);

              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-3 rounded-[20px] border px-4 py-4 transition-colors ${
                    checked
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : hasError
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                        : "border-[var(--color-border-soft)] bg-[var(--color-bg-gray)] hover:border-[var(--color-border-strong)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="hardshipLevel"
                    value={option}
                    checked={checked}
                    onChange={(event) =>
                      onUpdateField("hardshipLevel", event.target.value)
                    }
                    className="peer sr-only"
                  />
                  <span
                    className={`flex size-5 shrink-0 rounded-full border transition-colors ${
                      checked
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] shadow-[inset_0_0_0_4px_var(--color-primary-soft)]"
                        : "border-[var(--color-border-strong)] bg-[var(--color-bg-white)]"
                    }`}
                  />
                  <span className="text-[15px] font-medium text-[var(--color-text-body)]">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
          {fieldErrors.hardshipLevel ? (
            <p className="text-sm font-medium text-[var(--color-primary-strong)]">
              {fieldErrors.hardshipLevel}
            </p>
          ) : null}
        </div>

        <div className="mx-auto max-w-[36rem] space-y-3.5 text-left">
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]">
              상담에서 기대하는 도움
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-sub)]">
              최대 2개까지 선택할 수 있습니다.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {EXPECTED_SUPPORT_OPTIONS.map((option) => {
              const checked = info.expectedSupport.includes(option);
              const selectionLimitReached =
                !checked && info.expectedSupport.length >= 2;
              const hasError = Boolean(fieldErrors.expectedSupport);

              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-start gap-3 rounded-[20px] border px-4 py-4 transition-colors ${
                    checked
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : hasError
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                        : "border-[var(--color-border-soft)] bg-[var(--color-bg-gray)] hover:border-[var(--color-border-strong)]"
                  } ${selectionLimitReached ? "cursor-not-allowed opacity-55" : ""}`}
                >
                  <input
                    type="checkbox"
                    name="expectedSupport"
                    value={option}
                    checked={checked}
                    disabled={selectionLimitReached}
                    onChange={() => onToggleExpectedSupport(option)}
                    className="peer sr-only"
                  />
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
                      checked
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border-strong)] bg-[var(--color-bg-white)] text-transparent"
                    }`}
                  >
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
                  <span className="text-[15px] font-medium leading-6 text-[var(--color-text-body)]">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
          {fieldErrors.expectedSupport ? (
            <p className="text-sm font-medium text-[var(--color-primary-strong)]">
              {fieldErrors.expectedSupport}
            </p>
          ) : null}
        </div>

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
