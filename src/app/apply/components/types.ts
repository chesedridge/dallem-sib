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
  consultationMethod: string;
  consultationTopic: string;
  consultationTopicDetail: string;
  supportTopics: string[];
  supportTopicsDetail: string;
  hardshipLevel: string;
  expectedSupport: string[];
  preferredSchedules: PreferredSchedule[];
  privacyConsent: boolean;
};

export type RespondentTextFieldKey = {
  [Key in keyof RespondentInfo]: RespondentInfo[Key] extends string ? Key : never;
}[keyof RespondentInfo];
export type RespondentInfoFieldKey = keyof RespondentInfo;
export type RespondentInfoErrors = Partial<
  Record<RespondentInfoFieldKey, string>
>;

export type InfoField = {
  key: RespondentTextFieldKey;
  label: string;
  type: "text" | "tel" | "date" | "select";
  options?: string[];
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "numeric";
  maxLength?: number;
  pattern?: string;
  max?: string;
};

export type FormStep =
  | "intro"
  | "eligibility"
  | "question"
  | "info"
  | "result"
  | "submitted"
  | "ineligible";
import type { PreferredSchedule } from "@/lib/preferred-schedule";
