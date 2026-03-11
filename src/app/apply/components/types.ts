export type AnswerOption = {
  label: string;
  score: number;
};

export type ResultBand = {
  min: number;
  max: number;
  title: string;
  description: string;
};

export type RespondentInfo = {
  nickname: string;
  contact: string;
  residence: string;
  privacyConsent: boolean;
};

export type RespondentTextFieldKey = Exclude<
  keyof RespondentInfo,
  "privacyConsent"
>;
export type RespondentInfoFieldKey = keyof RespondentInfo;
export type RespondentInfoErrors = Partial<
  Record<RespondentInfoFieldKey, string>
>;

export type InfoField = {
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

export type FormStep =
  | "intro"
  | "eligibility"
  | "question"
  | "info"
  | "result"
  | "ineligible";
