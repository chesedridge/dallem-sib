/** @jest-environment node */
import { POST } from "./route";
import { getGoogleSheetsConfig, getSheetsClient } from "../../../lib/google";
import {
  findPreSurveyRecord,
  hasCompletedPostSurvey,
  createMatchToken,
} from "../../../lib/post-survey";
jest.mock("../../../lib/google", () => ({
  getGoogleSheetsConfig: jest.fn(),
  getSheetsClient: jest.fn(),
}));
jest.mock("../../../lib/post-survey", () => ({
  findPreSurveyRecord: jest.fn(),
  hasCompletedPostSurvey: jest.fn(),
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
  jest.mocked(hasCompletedPostSurvey).mockResolvedValue(false);
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
  jest.mocked(findPreSurveyRecord).mockResolvedValue({
    id: "id",
    receivedAt: "date",
    answers: Array(9).fill(2),
    totalScore: 18,
  });
  const response = await POST(request());
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({ matchToken: "encrypted-token" });
});

it.each(["4", "6"])(
  "blocks completed timing %s before issuing a token",
  async (timing) => {
    jest.mocked(hasCompletedPostSurvey).mockResolvedValue(true);
    const response = await POST(request({ timing, nickname: "changed name" }));
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      code: "POST_SURVEY_ALREADY_COMPLETED",
      message: expect.stringContaining(`${timing}회기 후`),
    });
    expect(findPreSurveyRecord).not.toHaveBeenCalled();
    expect(createMatchToken).not.toHaveBeenCalled();
  },
);
it("blocks starting on a duplicate lookup failure", async () => {
  jest
    .mocked(hasCompletedPostSurvey)
    .mockRejectedValue(new Error("unavailable"));
  expect((await POST(request())).status).toBe(503);
  expect(createMatchToken).not.toHaveBeenCalled();
});
