/** @jest-environment node */
import { POST } from "./route";
import { getGoogleSheetsConfig, getSheetsClient } from "../../../lib/google";
import { findPreSurveyRecord } from "../../../lib/post-survey";
jest.mock("../../../lib/google", () => ({
  getGoogleSheetsConfig: jest.fn(),
  getSheetsClient: jest.fn(),
}));
jest.mock("../../../lib/post-survey", () => ({
  findPreSurveyRecord: jest.fn(),
  createMatchToken: jest.fn(() => "encrypted-token"),
}));
const request = (overrides = {}) =>
  new Request("http://localhost/api/post-survey-match", {
    method: "POST",
    body: JSON.stringify({
      nickname: "test",
      contact: "01012345678",
      timing: "4",
      ...overrides,
    }),
  });
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(getGoogleSheetsConfig)
    .mockReturnValue({ privateKey: "key" } as ReturnType<
      typeof getGoogleSheetsConfig
    >);
  jest
    .mocked(getSheetsClient)
    .mockReturnValue({} as ReturnType<typeof getSheetsClient>);
});
it("requires timing and valid input before querying", async () => {
  expect((await POST(request({ timing: "" }))).status).toBe(400);
  expect(findPreSurveyRecord).not.toHaveBeenCalled();
});
it("blocks unknown contacts", async () => {
  jest.mocked(findPreSurveyRecord).mockResolvedValue(null);
  expect((await POST(request())).status).toBe(404);
});
it("returns only an opaque token, without the baseline answers", async () => {
  jest
    .mocked(findPreSurveyRecord)
    .mockResolvedValue({
      id: "id",
      receivedAt: "date",
      answers: Array(9).fill(2),
      totalScore: 18,
    });
  const response = await POST(request());
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({ matchToken: "encrypted-token" });
});
