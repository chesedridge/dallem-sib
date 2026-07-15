"use client";

type PostRespondentInfo = {
  nickname: string;
  contact: string;
};

type PostRespondentInfoErrors = Partial<Record<keyof PostRespondentInfo, string>>;

type PostInfoStepProps = {
  fieldErrors: PostRespondentInfoErrors;
  info: PostRespondentInfo;
  onUpdateField: (key: keyof PostRespondentInfo, value: string) => void;
};

const POST_INFO_FIELDS = [
  {
    key: "nickname",
    label: "닉네임 (또는 이름)",
    placeholder: "닉네임을 입력해주세요",
    autoComplete: "nickname",
    inputMode: "text",
  },
  {
    key: "contact",
    label: "연락처",
    placeholder: "예: 01012345678",
    autoComplete: "tel",
    inputMode: "numeric",
    maxLength: 11,
    pattern: "^010\\d{7,8}$",
  },
] as const;

export function PostInfoStep({
  fieldErrors,
  info,
  onUpdateField,
}: PostInfoStepProps) {
  return (
    <section className="bg-bg-white text-center md:rounded-[36px] md:border md:border-[var(--color-border-soft)] md:p-14">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h2 className="text-balance text-2xl font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-3xl">
          우울(PHQ-9) 자가검진
        </h2>
        <p className="mt-4 text-pretty text-[15px] leading-7 break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          검사 시작 전 닉네임과 연락처를 입력해주세요.
          <br />검사 진행은 약 1분 정도 소요됩니다.
        </p>
      </div>

      <div className="space-y-7">
        {POST_INFO_FIELDS.map((field) => {
          const fieldError = fieldErrors[field.key];

          return (
            <div
              key={field.key}
              className="mx-auto max-w-[36rem] space-y-3 text-left"
            >
              <label
                htmlFor={`post-${field.key}`}
                className="block text-[15px] font-semibold text-[var(--color-text-body)] md:text-[17px]"
              >
                {field.label}
              </label>
              <input
                id={`post-${field.key}`}
                name={field.key}
                type="text"
                value={info[field.key]}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                maxLength={"maxLength" in field ? field.maxLength : undefined}
                pattern={"pattern" in field ? field.pattern : undefined}
                aria-invalid={fieldError ? "true" : "false"}
                aria-describedby={
                  fieldError ? `post-${field.key}-error` : undefined
                }
                onChange={(event) =>
                  onUpdateField(field.key, event.target.value)
                }
                className={`h-14 w-full rounded-[18px] border px-5 text-[15px] text-[var(--color-text-body)] outline-none transition-[background-color,border-color] duration-150 placeholder:text-[var(--color-text-sub)] focus:border-[var(--color-border-strong)] focus:bg-bg-white ${
                  fieldError
                    ? "border-[var(--color-primary)] bg-primary-soft"
                    : "border-transparent bg-bg-gray"
                }`}
              />
              {fieldError ? (
                <p
                  id={`post-${field.key}-error`}
                  className="text-sm font-medium text-[var(--color-primary-strong)]"
                >
                  {fieldError}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export type { PostRespondentInfo, PostRespondentInfoErrors };
