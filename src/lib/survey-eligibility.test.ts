import { isSurveyEligible } from "./survey-eligibility";

describe("survey eligibility", () => {
  it.each([5, 6, 15, 20, 24])("rejects score %i when question 9 is none", (total) => {
    const answers = Array.from({ length: 8 }, (_, i) =>
      Math.max(0, Math.min(3, total - i * 3)),
    );
    expect(isSurveyEligible([...answers, 0])).toBe(false);
  });

  it("rejects the reported regression", () => {
    expect(isSurveyEligible([2, 2, 2, 0, 0, 0, 0, 0, 0])).toBe(false);
  });

  it("rejects totals below five even with a positive ninth answer", () => {
    expect(isSurveyEligible([3, 0, 0, 0, 0, 0, 0, 0, 1])).toBe(false);
  });

  it.each([1, 2, 3])("accepts score five with question 9 = %i", (ninth) => {
    expect(isSurveyEligible([2, 3 - ninth, 0, 0, 0, 0, 0, 0, ninth])).toBe(true);
    expect(isSurveyEligible([3, 3, 3, 3, 3, 3, 3, 3, ninth])).toBe(true);
  });

  it.each([
    [],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, -1],
    [-1, 3, 3, 3, 3, 3, 3, 3, 1],
    [3, 3, 3, 3, 3, 3, 3, 3, 4],
  ])("rejects incomplete or invalid answers %j", (...answers) => {
    expect(isSurveyEligible(answers)).toBe(false);
  });
});
