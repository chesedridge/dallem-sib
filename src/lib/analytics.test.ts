/** @jest-environment node */
import { backfillEngagementToSheets, syncGaAnalyticsToSheets } from "./analytics";
import {
  getAnalyticsDataClient,
  getGoogleSheetsConfig,
  getSheetsClient,
  getSpreadsheetSheetTitleById,
} from "./google";

jest.mock("./google", () => ({
  ensureSheetExists: jest.fn(),
  getAnalyticsDataClient: jest.fn(),
  getGoogleSheetsConfig: jest.fn(),
  getSheetsClient: jest.fn(),
  getSpreadsheetSheetTitleById: jest.fn(),
  sheetRange: (sheetName: string, range: string) => `'${sheetName}'!${range}`,
}));

type ReportRows = Array<{ date: string; metrics: number[] }>;

const TAB = "랜딩페이지 데이터 현황";
const runReport = jest.fn();
const valuesGet = jest.fn();
const valuesUpdate = jest.fn().mockResolvedValue({});
const valuesBatchUpdate = jest.fn().mockResolvedValue({});

function mockReports(reports: Record<string, ReportRows>) {
  runReport.mockImplementation(async ({ requestBody }) => {
    const eventName =
      requestBody.dimensionFilter.andGroup?.expressions[1].filter.stringFilter.value;
    const rows = reports[eventName ?? "page"] ?? [];

    return {
      data: {
        rows: rows.map(({ date, metrics }) => ({
          dimensionValues: [{ value: date }],
          metricValues: metrics.map((value) => ({ value: String(value) })),
        })),
      },
    };
  });
}

function mockSheet(dataRows: Array<Array<string | number>>, headerRows: string[][] = []) {
  valuesGet.mockImplementation(async ({ range }) => ({
    data: { values: range.endsWith("F1:G2") ? headerRows : dataRows },
  }));
}

function writtenData() {
  return valuesBatchUpdate.mock.calls.at(-1)?.[0].requestBody.data;
}

beforeEach(() => {
  jest.clearAllMocks();
  // KST 2026-10-21 12:00 → 동기화 대상은 10/20·10/21
  jest.useFakeTimers().setSystemTime(new Date("2026-10-21T03:00:00Z"));
  process.env.GA_PROPERTY_ID = "527817023";
  process.env.GOOGLE_SHEETS_ANALYTICS_SHEET_GID = "1695159350";
  jest.mocked(getGoogleSheetsConfig).mockReturnValue({
    spreadsheetId: "sheet",
  } as ReturnType<typeof getGoogleSheetsConfig>);
  jest.mocked(getAnalyticsDataClient).mockReturnValue({
    properties: { runReport },
  } as unknown as ReturnType<typeof getAnalyticsDataClient>);
  jest.mocked(getSheetsClient).mockReturnValue({
    spreadsheets: {
      values: { get: valuesGet, update: valuesUpdate, batchUpdate: valuesBatchUpdate },
    },
  } as unknown as ReturnType<typeof getSheetsClient>);
  jest.mocked(getSpreadsheetSheetTitleById).mockResolvedValue(TAB);
});
afterEach(() => jest.useRealTimers());

describe("syncGaAnalyticsToSheets", () => {
  it("writes A~D and F~G, skipping the manual E column", async () => {
    mockSheet([["2026. 10. 20", 1, 1, 0]]);
    mockReports({
      // screenPageViews, totalUsers, userEngagementDuration, engagedSessions
      page: [
        { date: "20261020", metrics: [100, 90, 450, 90] },
        { date: "20261021", metrics: [50, 40, 0, 0] },
      ],
      // eventCount, eventValue
      main_page_button_click: [{ date: "20261020", metrics: [3, 0] }],
      main_page_scroll_depth: [{ date: "20261020", metrics: [4, 150] }],
    });

    const result = await syncGaAnalyticsToSheets();

    expect(result).toMatchObject({ updatedRowCount: 1, appendedRowCount: 1 });
    expect(writtenData()).toEqual([
      { range: `'${TAB}'!A3:D3`, values: [["2026. 10. 20", 100, 90, 3]] },
      { range: `'${TAB}'!F3:G3`, values: [[5, 37.5]] },
      { range: `'${TAB}'!A4:D4`, values: [["2026. 10. 21", 50, 40, 0]] },
      // 참여 세션·스크롤 이벤트가 없으면 0이 아니라 빈칸
      { range: `'${TAB}'!F4:G4`, values: [["", ""]] },
    ]);
  });

  it("fills the F~G headers only while they are empty", async () => {
    mockReports({});
    mockSheet([]);
    await syncGaAnalyticsToSheets();

    expect(valuesUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        range: `'${TAB}'!F1:G2`,
        requestBody: {
          values: [
            [expect.stringContaining("체류시간"), expect.stringContaining("스크롤 깊이")],
            ["평균 체류시간(초)", "평균 스크롤 깊이(%)"],
          ],
        },
      }),
    );

    valuesUpdate.mockClear();
    mockSheet([], [["직접 바꾼 헤더"]]);
    await syncGaAnalyticsToSheets();

    expect(valuesUpdate).not.toHaveBeenCalled();
  });
});

describe("backfillEngagementToSheets", () => {
  it("only writes the F column for existing rows from the start date", async () => {
    mockSheet([
      ["2026. 5. 29", 8, 3, 6],
      ["2026. 5. 30", 3, 3, 1],
      ["2026. 5. 31", 2, 2, 0],
    ]);
    mockReports({
      page: [
        { date: "20260530", metrics: [3, 3, 25, 2] },
        { date: "20260529", metrics: [8, 3, 90, 3] },
      ],
    });

    const result = await backfillEngagementToSheets("2026-05-30");

    expect(runReport).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          dateRanges: [{ startDate: "2026-05-30", endDate: "2026-10-21" }],
        }),
      }),
    );
    expect(result).toEqual({
      startDate: "2026-05-30",
      endDate: "2026-10-21",
      updatedRowCount: 2,
    });
    expect(writtenData()).toEqual([
      { range: `'${TAB}'!F4`, values: [[12.5]] },
      { range: `'${TAB}'!F5`, values: [[""]] },
    ]);
  });
});
