export const AFFILIATION_OPTIONS = [
  "경기도에 거주하는 직장인입니다",
  "경기도 소재 회사에 재직 중인 직장인입니다",
] as const;

export type PostTiming = "4" | "6";
export function isPostTiming(value: unknown): value is PostTiming {
  return value === "4" || value === "6";
}
export function isValidAnswers(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === 9 &&
    Array.from(value).every((v) => Number.isInteger(v) && v >= 0 && v <= 3)
  );
}
export function offersExtraSessions(score: number, timing: PostTiming) {
  return timing === "4" && Number.isInteger(score) && score >= 5 && score <= 27;
}
