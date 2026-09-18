export const SURVEY_INELIGIBLE_MESSAGE =
  "이번 프로젝트의 참여 조건에 해당하지 않습니다.";

export function isSurveyEligible(answers: readonly number[]): boolean {
  if (answers[8] === 0) {
    return false;
  }

  if (
    answers.length !== 9 ||
    Array.from(answers).some(
      (answer) => !Number.isInteger(answer) || answer < 0 || answer > 3,
    )
  ) {
    return false;
  }

  return answers.reduce((sum, answer) => sum + answer, 0) >= 5;
}
