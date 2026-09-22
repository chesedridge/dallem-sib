/** @jest-environment node */
import {
  hasCompletedPostSurvey,
  createMatchToken,
  readMatchToken,
  selectPreSurveyRecord,
} from "./post-survey";
import { offersExtraSessions } from "./survey-policy";
import { findResultBand } from "../app/apply/components/constants";

const contact = "01012345678";
const now = Date.parse("2026-09-22T00:00:00Z");
function row(
  date: string,
  phone = contact,
  answers = [2, 2, 2, 2, 2, 2, 2, 2, 2],
): unknown[] {
  return [
    date,
    "동의",
    "테스트",
    phone,
    ...Array(8).fill(""),
    ...answers,
    answers.reduce((a, b) => a + b, 0),
  ];
}
it("matches the latest valid pre-survey before the post-survey, regardless of row order", () => {
  const rows = [
    row("2026-09-21"),
    row("2026-09-20"),
    row("2026-09-23"),
    row("2026-09-21", "01099999999"),
  ];
  expect(selectPreSurveyRecord(rows, contact, now)?.receivedAt).toBe(
    "2026-09-21",
  );
});
it("supports formatted and legacy numeric contacts while rejecting incomplete responses", () => {
  expect(
    selectPreSurveyRecord([row("2026-09-20", "010-1234-5678")], contact, now),
  ).not.toBeNull();
  expect(
    selectPreSurveyRecord([row("2026-09-20", "1012345678")], contact, now),
  ).not.toBeNull();
  const invalid = row("2026-09-21");
  invalid[12] = "";
  expect(selectPreSurveyRecord([invalid], contact, now)).toBeNull();
  expect(selectPreSurveyRecord([row("invalid")], contact, now)).toBeNull();
});
it("binds an encrypted baseline snapshot to phone, timing and expiry", () => {
  const record = selectPreSurveyRecord([row("2026-09-20")], contact, now)!;
  const token = createMatchToken(record, contact, "4", "test-key", now);
  expect(readMatchToken(token, contact, "4", "test-key", now)).toEqual(record);
  expect(token).not.toContain(contact);
  expect(readMatchToken(token, "01099999999", "4", "test-key", now)).toBeNull();
  expect(readMatchToken(token, contact, "6", "test-key", now)).toBeNull();
  expect(readMatchToken(token, contact, "4", "wrong-key", now)).toBeNull();
  expect(
    readMatchToken(token, contact, "4", "test-key", now + 7200000),
  ).toBeNull();
  const tampered = Buffer.from(token, "base64url");
  tampered[0] ^= 1;
  expect(
    readMatchToken(
      tampered.toString("base64url"),
      contact,
      "4",
      "test-key",
      now,
    ),
  ).toBeNull();
});
it.each([
  [0, false],
  [4, false],
  [5, true],
  [9, true],
  [10, true],
  [19, true],
  [20, true],
  [27, true],
])(
  "offers additional sessions at score %i only after four sessions",
  (score, expected) => {
    expect(offersExtraSessions(score as number, "4")).toBe(expected);
    expect(offersExtraSessions(score as number, "6")).toBe(false);
  },
);
it.each([
  [4, 0],
  [5, 5],
  [9, 5],
  [10, 10],
  [14, 10],
  [15, 10],
  [19, 10],
  [20, 20],
])("preserves the original band at score %i", (score, min) => {
  expect(findResultBand(score).min).toBe(min);
});

describe("completed post-survey lookup", () => {
  function client(rows: unknown[][]) {
    const get = jest.fn().mockResolvedValue({ data: { values: rows } });
    return {
      spreadsheets: { values: { get } },
    } as unknown as import("./google").SheetsClient;
  }
  const row = (phone: unknown, timing?: unknown) => [
    phone,
    ...Array(11).fill(""),
    timing,
  ];
  it.each(["01012345678", "010-1234-5678", "010 1234 5678", 1012345678])(
    "normalizes saved phone %s",
    async (phone) => {
      expect(
        await hasCompletedPostSurvey(
          client([row(phone, "4회기 후")]),
          "test",
          "01012345678",
          "4",
        ),
      ).toBe(true);
    },
  );
  it.each([undefined, "", " ", "4", 4, "4회기 후"])(
    "treats legacy/four timing %s as four sessions only",
    async (timing) => {
      const sheets = client([row("01012345678", timing)]);
      expect(
        await hasCompletedPostSurvey(sheets, "test", "01012345678", "4"),
      ).toBe(true);
      expect(
        await hasCompletedPostSurvey(sheets, "test", "01012345678", "6"),
      ).toBe(false);
    },
  );
  it("restores the leading zero for legacy ten-digit phone numbers", async () => {
    expect(
      await hasCompletedPostSurvey(
        client([row(101234567, "4회기 후")]),
        "test",
        "0101234567",
        "4",
      ),
    ).toBe(true);
  });
  it("does not match another contact or an empty sheet", async () => {
    expect(
      await hasCompletedPostSurvey(
        client([row("01099999999", "4회기 후")]),
        "test",
        "01012345678",
        "4",
      ),
    ).toBe(false);
    expect(
      await hasCompletedPostSurvey(client([]), "test", "01012345678", "4"),
    ).toBe(false);
  });
});
