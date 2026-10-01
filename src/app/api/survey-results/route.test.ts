/** @jest-environment node */
import { POST } from "./route";
import { getSheetsClient, getGoogleSheetsConfig, getSpreadsheetSheetTitles } from "../../../lib/google";
import { sendAligoSms } from "../../../lib/aligo";

jest.mock("../../../lib/google", () => ({
  ensureSheetColumnCapacity: jest.fn().mockResolvedValue(undefined),
  getGoogleSheetsConfig: jest.fn(),
  getSheetsClient: jest.fn(),
  getSpreadsheetSheetTitles: jest.fn(),
  sheetRange: jest.fn(),
}));
jest.mock("../../../lib/aligo", () => {
  process.env.ALIGO_SMS_ENABLED = "Y";
  return {
    getAligoConfig: jest.fn(() => null),
    sendAligoSms: jest.fn(),
  };
});

const append = jest.fn().mockResolvedValue({});
const update = jest.fn().mockResolvedValue({});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date("2026-09-18T00:00:00Z"));
  jest.mocked(getGoogleSheetsConfig).mockReturnValue({ spreadsheetId: "test", sheetName: "test" } as ReturnType<typeof getGoogleSheetsConfig>);
  jest.mocked(getSheetsClient).mockReturnValue({ spreadsheets: { values: {
    get: jest.fn().mockResolvedValue({ data: { values: [] } }), append, update,
  } } } as unknown as ReturnType<typeof getSheetsClient>);
  jest.mocked(getSpreadsheetSheetTitles).mockResolvedValue(["test"]);
});
afterEach(() => jest.useRealTimers());

function request(answers: number[], totalScore = answers.reduce((a, b) => a + b, 0), overrides = {}) {
  return new Request("http://localhost/api/survey-results", {
    method: "POST",
    body: JSON.stringify({
      nickname: "test", contact: "01012345678", consultationMethod: "화상상담",
      privacyConsent: true,
      preferredSchedules: ["10:00", "11:00", "12:00"].map(time => ({date: "2026-09-21", time})),
      answers, totalScore, resultTitle: "검사 결과", resultDescription: "검사 설명",
      ...overrides,
    }),
  });
}

it.each([
  [2, 2, 2, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 3, 3, 3, 3, 3, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 1],
])("rejects ineligible direct requests without side effects %j", async (...answers) => {
  const response = await POST(request(answers));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ message: "이번 프로젝트의 참여 조건에 해당하지 않습니다." });
  expect(getSheetsClient).not.toHaveBeenCalled();
  expect(append).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
  expect(sendAligoSms).not.toHaveBeenCalled();
});

it("retains score consistency validation", async () => {
  const response = await POST(request([2, 2, 0, 0, 0, 0, 0, 0, 1], 20));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ message: "전송된 응답 형식이 올바르지 않습니다." });
  expect(getSheetsClient).not.toHaveBeenCalled();
});

it.each([1, 2, 3])("saves eligible requests with ninth answer %i", async (ninth) => {
  const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const response = await POST(request([2, 3 - ninth, 0, 0, 0, 0, 0, 0, ninth]));
    expect(response.status).toBe(200);
    expect(append).toHaveBeenCalledTimes(1);
  } finally {
    warning.mockRestore();
  }
});

it.each([
  {formVersion: 2},
  {formVersion: 2, affiliation: "잘못된 값"},
  {formVersion: 2, affiliation: "경기도에 거주하는 직장인입니다", privacyConsent: false},
])("rejects missing affiliation or consent in new applications", async overrides => {
  expect((await POST(request([2,2,0,0,0,0,0,0,1], 5, overrides))).status).toBe(400);
  expect(append).not.toHaveBeenCalled();
});
it("saves the reduced application without shifting existing columns", async () => {
  const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
  try {
    expect((await POST(request([2,2,0,0,0,0,0,0,1], 5, {formVersion:2,affiliation:"경기도에 거주하는 직장인입니다"}))).status).toBe(200);
    const row = append.mock.calls[0][0].requestBody.values[0];
    expect(row).toHaveLength(31);
    expect(row.slice(6,12)).toEqual(Array(6).fill(""));
    expect(row[30]).toBe("경기도에 거주하는 직장인입니다");
    expect(row.slice(12,21)).toEqual([2,2,0,0,0,0,0,0,1]);
    expect(row[21]).toBe(5);
    expect(row.slice(24,30)).toEqual([
      "2026-09-21", "10:00", "2026-09-21", "11:00", "2026-09-21", "12:00",
    ]);
  } finally { warning.mockRestore(); }
});

it("accepts older clients but no longer collects their retired fields", async () => {
  const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const response = await POST(request([2,2,0,0,0,0,0,0,1], 5, {
      consultationTopic: "직장",
      consultationTopicDetail: "",
      supportTopics: ["기타"],
      supportTopicsDetail: "추가 상담주제",
      hardshipLevel: "보통",
      expectedSupport: ["감정을 정리하고 싶어요"],
    }));
    expect(response.status).toBe(200);
    expect(append.mock.calls[0][0].requestBody.values[0].slice(6,12)).toEqual(Array(6).fill(""));
  } finally { warning.mockRestore(); }
});

it.each([
  { consultationMethod: "" },
  { preferredSchedules: [] },
  { preferredSchedules: Array(3).fill({ date: "2026-09-21", time: "10:00" }) },
])("still requires a consultation method and three distinct schedules: %j", async overrides => {
  expect((await POST(request([2,2,0,0,0,0,0,0,1], 5, overrides))).status).toBe(400);
  expect(getSheetsClient).not.toHaveBeenCalled();
  expect(append).not.toHaveBeenCalled();
});
