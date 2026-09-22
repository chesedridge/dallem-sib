/** @jest-environment node */
import { POST } from "./route";
import {
  getGoogleSheetsConfig,
  getSheetsClient,
  getSpreadsheetSheetTitles,
} from "../../../lib/google";
import { createMatchToken } from "../../../lib/post-survey";
jest.mock("../../../lib/google", () => ({
  getGoogleSheetsConfig: jest.fn(),
  getSheetsClient: jest.fn(),
  getSpreadsheetSheetTitles: jest.fn(),
  sheetRange: jest.fn(),
  getGoogleApiErrorDetails: jest.fn(),
}));
const append = jest.fn().mockResolvedValue({});
const update = jest.fn().mockResolvedValue({});
const config = {
  spreadsheetId: "test",
  sheetName: "pre",
  privateKey: "test-key",
};
const record = {
  id: "record-id",
  receivedAt: "2026-09-01",
  answers: Array(9).fill(2),
  totalScore: 18,
};
const answersFor = (total: number) =>
  Array.from({ length: 9 }, (_, i) => Math.max(0, Math.min(3, total - i * 3)));
function request(score: number, timing: "4" | "6" = "4", overrides = {}) {
  return new Request("http://localhost/api/post-survey-results", {
    method: "POST",
    body: JSON.stringify({
      nickname: "test",
      contact: "01012345678",
      timing,
      matchToken: createMatchToken(record, "01012345678", timing, "test-key"),
      answers: answersFor(score),
      totalScore: score,
      ...overrides,
    }),
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(getGoogleSheetsConfig)
    .mockReturnValue(config as ReturnType<typeof getGoogleSheetsConfig>);
  jest
    .mocked(getSheetsClient)
    .mockReturnValue({
      spreadsheets: {
        values: {
          get: jest.fn().mockResolvedValue({ data: { values: [] } }),
          append,
          update,
        },
      },
    } as unknown as ReturnType<typeof getSheetsClient>);
  jest.mocked(getSpreadsheetSheetTitles).mockResolvedValue(["post-raw"]);
});
it.each([
  [4, false],
  [5, true],
  [15, true],
  [20, true],
])(
  "persists linked baseline and support policy for score %i",
  async (score, extra) => {
    const response = await POST(request(score as number));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      preAnswers: record.answers,
      preTotalScore: 18,
      extraSessions: extra,
    });
    const values = append.mock.calls[0][0].requestBody.values[0];
    expect(values).toHaveLength(17);
    expect(values[14]).toBe("4회기 후");
    expect(values).not.toContain("record-id");
    expect(values).not.toContain("2026-09-01");
  },
);
it("excludes six-session results from additional support", async () => {
  const response = await POST(request(18, "6"));
  expect(await response.json()).toMatchObject({ extraSessions: false });
  expect(append.mock.calls[0][0].requestBody.values[0][14]).toBe("6회기 후");
  expect(update.mock.calls[0][0].requestBody.values[0][14]).toBe("진행시기");
});
it.each([
  { matchToken: "invalid" },
  { contact: "01099999999" },
  { timing: "6" },
])("rejects changed linkage without writing", async (overrides) => {
  expect((await POST(request(18, "4", overrides))).status).toBe(409);
  expect(append).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
});
it("rejects inconsistent totals without writing", async () => {
  expect((await POST(request(18, "4", { totalScore: 19 }))).status).toBe(400);
  expect(append).not.toHaveBeenCalled();
});

it.each([
  [13, "-5"],
  [18, "0"],
  [21, "+3"],
])("stores signed raw comparison for post score %i", async (score, change) => {
  expect((await POST(request(score as number))).status).toBe(200);
  const values = append.mock.calls[0][0].requestBody.values[0];
  expect(values.slice(15)).toEqual([change, "10~19점 : 중간정도의 우울"]);
  expect(append.mock.calls[0][0].valueInputOption).toBe("RAW");
  expect(update.mock.calls[0][0].requestBody.values[0].slice(15)).toEqual([
    "변화량",
    "사전검사위험단계",
  ]);
});

it("does not relabel existing legacy values as new comparison fields", async () => {
  await POST(request(18));
  const currentHeaders = update.mock.calls[0][0].requestBody.values[0];
  const oldHeaders = [...currentHeaders.slice(0, 15), "사전기록ID", "사전검사일", "사전총점", "추가2회기대상", ...currentHeaders.slice(15)];
  jest.mocked(getSheetsClient).mockReturnValue({spreadsheets: {
    values: {get: jest.fn().mockResolvedValue({data:{values:[oldHeaders]}}),append,update},
  }} as unknown as ReturnType<typeof getSheetsClient>);
  update.mockClear();
  append.mockClear();
  const response = await POST(request(18));
  expect(response.status).toBe(409);
  expect((await response.json()).message).toContain("이전 형식");
  expect(update).not.toHaveBeenCalled();
  expect(append).not.toHaveBeenCalled();
});
