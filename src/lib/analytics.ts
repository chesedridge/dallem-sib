import {
  ensureSheetExists,
  getAnalyticsDataClient,
  getGoogleSheetsConfig,
  getSheetsClient,
  getSpreadsheetSheetTitleById,
  sheetRange,
} from "@/lib/google";

const MAIN_PAGE_BUTTON_CLICK_EVENT_NAME = "main_page_button_click";
// 메인 페이지를 떠날 때 최대 스크롤 %를 value로 보낸다(MainPageAnalyticsEvents).
const MAIN_PAGE_SCROLL_DEPTH_EVENT_NAME = "main_page_scroll_depth";

const ANALYTICS_DATA_START_ROW = 3;
// E열은 사람이 직접 입력하는 열이라 비워 두고, 체류시간·스크롤 깊이는 F·G열에 쓴다.
const ENGAGEMENT_COLUMN = "F";
const SCROLL_DEPTH_COLUMN = "G";
const ENGAGEMENT_HEADER_VALUES = [
  [
    "SIB 안내페이지 체류시간\n(참여 세션당 평균 참여 시간)",
    "SIB 안내페이지 스크롤 깊이\n(이탈 시점 최대 스크롤 위치 평균)",
  ],
  ["평균 체류시간(초)", "평균 스크롤 깊이(%)"],
];
const GOOGLE_SHEETS_DATE_EPOCH_MS = Date.UTC(1899, 11, 30);
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type AnalyticsSummary = {
  buttonClicks: number;
  date: string;
  pagePath: string;
  screenPageViews: number;
  syncedAt: string;
  totalUsers: number;
};

type AnalyticsConfig = {
  pagePath: string;
  propertyId: string;
  propertyName: string;
  sheetGid: number | null;
  sheetName: string;
  spreadsheetId: string;
};

type DailyMetricValues = {
  screenPageViews: number;
  totalUsers: number;
};

type DailyRow = DailyMetricValues & {
  buttonClicks: number;
  date: string;
};

type ReportRow = {
  dimensionValues?: Array<{ value?: string | null }>;
  metricValues?: Array<{ value?: string | null }>;
};

type AnalyticsDataClient = NonNullable<ReturnType<typeof getAnalyticsDataClient>>;
type SheetsClient = NonNullable<ReturnType<typeof getSheetsClient>>;
type DateRange = { startDate: string; endDate: string };

let cachedSummary:
  | {
      expiresAt: number;
      value: AnalyticsSummary | null;
    }
  | null = null;

function normalizePropertyId(propertyId: string) {
  return propertyId.replace(/^properties\//, "").trim();
}

function getOptionalEnv(value?: string) {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();
  const hasWrappingQuotes =
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"));
  const normalizedValue = hasWrappingQuotes
    ? trimmedValue.slice(1, -1)
    : trimmedValue;

  return normalizedValue || undefined;
}

function parseSheetGid(value?: string) {
  const normalizedValue = getOptionalEnv(value);

  if (!normalizedValue) {
    return null;
  }

  const parsed = Number(normalizedValue);

  return Number.isInteger(parsed) ? parsed : null;
}

function getAnalyticsConfig(): AnalyticsConfig | null {
  const sheetsConfig = getGoogleSheetsConfig();
  const propertyId = getOptionalEnv(process.env.GA_PROPERTY_ID);

  if (!sheetsConfig || !propertyId) {
    return null;
  }

  const normalizedPropertyId = normalizePropertyId(propertyId);

  return {
    pagePath: getOptionalEnv(process.env.GA_PAGE_PATH) ?? "/",
    propertyId: normalizedPropertyId,
    propertyName: `properties/${normalizedPropertyId}`,
    sheetGid: parseSheetGid(process.env.GOOGLE_SHEETS_ANALYTICS_SHEET_GID),
    sheetName:
      getOptionalEnv(process.env.GOOGLE_SHEETS_ANALYTICS_SHEET_NAME) ??
      getOptionalEnv(process.env.GOOGLE_SHEETS_ANALYTICS_DAILY_SHEET_NAME) ??
      "GA Daily Summary",
    spreadsheetId: sheetsConfig.spreadsheetId,
  };
}

function parseMetricValue(value?: string | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function metricAt(row: ReportRow, index: number) {
  return parseMetricValue(row.metricValues?.[index]?.value);
}

function averageOrNull(total: number, count: number) {
  if (count <= 0) {
    return null;
  }

  return Math.round((total / count) * 10) / 10;
}

// 페이지 리포트 지표 순서: screenPageViews, totalUsers, userEngagementDuration, engagedSessions
function metricsFromRow(row: ReportRow) {
  return {
    screenPageViews: metricAt(row, 0),
    totalUsers: metricAt(row, 1),
  } satisfies DailyMetricValues;
}

// 참여 세션(10초 이상 머묾·전환 등)당 평균 참여 시간(초).
// 방문 대부분이 바로 이탈해 활성 사용자당 평균은 0.1~0.7초에 머물러 변화가 보이지 않는다.
function engagementSecondsFromRow(row: ReportRow) {
  return averageOrNull(metricAt(row, 2), metricAt(row, 3));
}

// 이벤트 리포트 지표 순서: eventCount, eventValue
function eventCountFromRow(row: ReportRow) {
  return metricAt(row, 0);
}

// 스크롤 이벤트의 value(최대 스크롤 %) 합 ÷ 이벤트 수.
function scrollPercentFromRow(row: ReportRow) {
  return averageOrNull(metricAt(row, 1), metricAt(row, 0));
}

function optionalCell(value?: number | null) {
  return value ?? "";
}

function formatGaDate(value?: string | null) {
  if (!value || value.length !== 8) {
    return value ?? "";
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}`;
}

function formatDateParts(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function getKstDateString(dayOffset: number) {
  const nowInKst = new Date(
    Date.now() + KST_OFFSET_MS + dayOffset * MILLISECONDS_PER_DAY,
  );

  return formatDateParts(
    nowInKst.getUTCFullYear(),
    nowInKst.getUTCMonth() + 1,
    nowInKst.getUTCDate(),
  );
}

function getKstSyncDates() {
  return [getKstDateString(-1), getKstDateString(0)].filter(
    (date): date is string => Boolean(date),
  );
}

function normalizeDateCell(value: string | number) {
  if (typeof value === "number") {
    const date = new Date(
      GOOGLE_SHEETS_DATE_EPOCH_MS + Math.round(value) * MILLISECONDS_PER_DAY,
    );

    return formatDateParts(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    );
  }

  const dateText = value.trim();
  const compactDateMatch = dateText.match(/^(\d{4})(\d{2})(\d{2})$/);
  const delimitedDateMatch = dateText.match(
    /^(\d{4})[./-]\s*(\d{1,2})[./-]\s*(\d{1,2})\.?$/,
  );
  const dateMatch = compactDateMatch ?? delimitedDateMatch;

  if (!dateMatch) {
    return dateText || null;
  }

  return formatDateParts(
    Number(dateMatch[1]),
    Number(dateMatch[2]),
    Number(dateMatch[3]),
  );
}

function formatSheetDate(value: string) {
  const normalizedDate = normalizeDateCell(value);

  if (!normalizedDate) {
    return value;
  }

  const [year, month, day] = normalizedDate.split("-").map(Number);

  return `${year}. ${month}. ${day}`;
}

function parseNumberCell(value?: string) {
  const parsed = Number(String(value ?? 0).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function dailyRowFromSheetRow(row: Array<string | number>) {
  const date = normalizeDateCell(row[0] ?? "");

  if (!date) {
    return null;
  }

  return {
    buttonClicks: parseNumberCell(String(row[3] ?? "")),
    date,
    screenPageViews: parseNumberCell(String(row[1] ?? "")),
    totalUsers: parseNumberCell(String(row[2] ?? "")),
  } satisfies DailyRow;
}

function sheetValuesFromDailyRow(row: DailyRow) {
  return [
    formatSheetDate(row.date),
    row.screenPageViews,
    row.totalUsers,
    row.buttonClicks,
  ];
}

function getDateFromRow(row: ReportRow) {
  const dateValue = formatGaDate(row.dimensionValues?.[0]?.value);

  return normalizeDateCell(dateValue) ?? "";
}

function createExistingRowsByDate(rows: Array<Array<string | number>>) {
  const rowsByDate = new Map<string, { row: DailyRow; rowNumber: number }>();

  rows.forEach((sheetRow, index) => {
    const row = dailyRowFromSheetRow(sheetRow);

    if (!row) {
      return;
    }

    rowsByDate.set(row.date, {
      row,
      rowNumber: ANALYTICS_DATA_START_ROW + index,
    });
  });

  return rowsByDate;
}

function createValuesByDate<T>(
  rows: ReportRow[],
  valueFromRow: (row: ReportRow) => T,
) {
  const valuesByDate = new Map<string, T>();

  rows.forEach((row) => {
    const date = getDateFromRow(row);

    if (!date) {
      return;
    }

    valuesByDate.set(date, valueFromRow(row));
  });

  return valuesByDate;
}

function analyticsSummaryFromDailyRow(
  row: DailyRow | null,
  pagePath: string,
  syncedAt: string,
): AnalyticsSummary | null {
  if (!row) {
    return null;
  }

  return {
    buttonClicks: row.buttonClicks,
    date: formatSheetDate(row.date),
    pagePath,
    screenPageViews: row.screenPageViews,
    syncedAt,
    totalUsers: row.totalUsers,
  };
}

async function resolveAnalyticsSheetName(config: AnalyticsConfig) {
  const sheets = getSheetsClient();

  if (!sheets) {
    return config.sheetName;
  }

  if (!config.sheetGid) {
    await ensureSheetExists(sheets, config.spreadsheetId, config.sheetName);
    return config.sheetName;
  }

  const sheetName = await getSpreadsheetSheetTitleById(
    sheets,
    config.spreadsheetId,
    config.sheetGid,
  );

  if (!sheetName) {
    throw new Error(`Analytics sheet gid ${config.sheetGid} was not found.`);
  }

  return sheetName;
}

function createPagePathFilter(pagePath: string) {
  return {
    filter: {
      fieldName: "pagePath",
      stringFilter: {
        matchType: "EXACT",
        value: pagePath,
      },
    },
  };
}

function createEventFilter(pagePath: string, eventName: string) {
  return {
    andGroup: {
      expressions: [
        createPagePathFilter(pagePath),
        {
          filter: {
            fieldName: "eventName",
            stringFilter: {
              matchType: "EXACT",
              value: eventName,
            },
          },
        },
      ],
    },
  };
}

const DATE_ORDER_BYS = [
  {
    dimension: {
      dimensionName: "date",
    },
  },
];

function runPageReport(
  analyticsData: AnalyticsDataClient,
  config: AnalyticsConfig,
  dateRanges: DateRange[],
) {
  return analyticsData.properties.runReport({
    property: config.propertyName,
    requestBody: {
      dateRanges,
      dimensions: [{ name: "date" }],
      dimensionFilter: createPagePathFilter(config.pagePath),
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "userEngagementDuration" },
        { name: "engagedSessions" },
      ],
      orderBys: DATE_ORDER_BYS,
    },
  });
}

function runEventReport(
  analyticsData: AnalyticsDataClient,
  config: AnalyticsConfig,
  dateRanges: DateRange[],
  eventName: string,
) {
  return analyticsData.properties.runReport({
    property: config.propertyName,
    requestBody: {
      dateRanges,
      dimensions: [{ name: "date" }],
      dimensionFilter: createEventFilter(config.pagePath, eventName),
      metrics: [{ name: "eventCount" }, { name: "eventValue" }],
      orderBys: DATE_ORDER_BYS,
    },
  });
}

async function getExistingDataRows(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetName: string,
) {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetRange(sheetName, `A${ANALYTICS_DATA_START_ROW}:D`),
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  return (data.values ?? []) as Array<Array<string | number>>;
}

// 사람이 헤더를 고쳐 쓴 경우를 존중하도록 비어 있을 때만 채운다.
async function ensureEngagementHeaders(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetName: string,
) {
  const range = sheetRange(
    sheetName,
    `${ENGAGEMENT_COLUMN}1:${SCROLL_DEPTH_COLUMN}2`,
  );
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const hasHeader = (data.values ?? []).some((row) =>
    row.some((cell) => String(cell ?? "").trim() !== ""),
  );

  if (hasHeader) {
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: ENGAGEMENT_HEADER_VALUES,
    },
  });
}

export async function syncGaAnalyticsToSheets() {
  const config = getAnalyticsConfig();
  const analyticsData = getAnalyticsDataClient();
  const sheets = getSheetsClient();

  if (!config || !analyticsData || !sheets) {
    return null;
  }

  const syncDates = getKstSyncDates();

  if (syncDates.length === 0) {
    return {
      appendedRowCount: 0,
      dailyRowCount: 0,
      summary: null,
      updatedRowCount: 0,
    };
  }

  const dateRanges = [
    {
      startDate: syncDates[0],
      endDate: syncDates.at(-1) ?? syncDates[0],
    },
  ];

  const [pageReport, buttonClickReport, scrollDepthReport] = await Promise.all([
    runPageReport(analyticsData, config, dateRanges),
    runEventReport(
      analyticsData,
      config,
      dateRanges,
      MAIN_PAGE_BUTTON_CLICK_EVENT_NAME,
    ),
    runEventReport(
      analyticsData,
      config,
      dateRanges,
      MAIN_PAGE_SCROLL_DEPTH_EVENT_NAME,
    ),
  ]);

  const pageRows = pageReport.data.rows ?? [];
  const metricsByDate = createValuesByDate(pageRows, metricsFromRow);
  const engagementSecondsByDate = createValuesByDate(
    pageRows,
    engagementSecondsFromRow,
  );
  const buttonClicksByDate = createValuesByDate(
    buttonClickReport.data.rows ?? [],
    eventCountFromRow,
  );
  const scrollPercentByDate = createValuesByDate(
    scrollDepthReport.data.rows ?? [],
    scrollPercentFromRow,
  );
  const dailyRows: DailyRow[] = syncDates.map((date) => {
    const rowMetrics = metricsByDate.get(date) ?? {
      screenPageViews: 0,
      totalUsers: 0,
    };

    return {
      ...rowMetrics,
      buttonClicks: buttonClicksByDate.get(date) ?? 0,
      date,
    };
  });
  const sheetName = await resolveAnalyticsSheetName(config);
  const existingRows = await getExistingDataRows(
    sheets,
    config.spreadsheetId,
    sheetName,
  );
  const existingRowsByDate = createExistingRowsByDate(existingRows);
  const rowsToUpdate: Array<{ row: DailyRow; rowNumber: number }> = [];
  const rowsToAppend: DailyRow[] = [];

  dailyRows.forEach((row) => {
    const existingRow = existingRowsByDate.get(row.date);

    if (existingRow) {
      rowsToUpdate.push({
        row,
        rowNumber: existingRow.rowNumber,
      });
      return;
    }

    rowsToAppend.push(row);
  });

  const rowsToWrite = [
    ...rowsToUpdate,
    ...rowsToAppend.map((row, index) => ({
      row,
      rowNumber: ANALYTICS_DATA_START_ROW + existingRows.length + index,
    })),
  ];

  await ensureEngagementHeaders(sheets, config.spreadsheetId, sheetName);
  // E열(수동 입력)은 건너뛰고 A~D, F~G만 쓴다.
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: config.spreadsheetId,
    requestBody: {
      data: rowsToWrite.flatMap(({ row, rowNumber }) => [
        {
          range: sheetRange(sheetName, `A${rowNumber}:D${rowNumber}`),
          values: [sheetValuesFromDailyRow(row)],
        },
        {
          range: sheetRange(
            sheetName,
            `${ENGAGEMENT_COLUMN}${rowNumber}:${SCROLL_DEPTH_COLUMN}${rowNumber}`,
          ),
          values: [
            [
              optionalCell(engagementSecondsByDate.get(row.date)),
              optionalCell(scrollPercentByDate.get(row.date)),
            ],
          ],
        },
      ]),
      valueInputOption: "RAW",
    },
  });

  const syncedAt = new Date().toISOString();
  const summary = analyticsSummaryFromDailyRow(
    dailyRows.at(-1) ?? null,
    config.pagePath,
    syncedAt,
  );

  cachedSummary = {
    expiresAt: Date.now() + 5 * 60 * 1000,
    value: summary,
  };

  return {
    appendedRowCount: rowsToAppend.length,
    dailyRowCount: dailyRows.length,
    summary,
    updatedRowCount: rowsToUpdate.length,
  };
}

// 체류시간(F열)만 과거 날짜까지 채운다. 이미 기록된 A~D는 건드리지 않고,
// 시트에 행이 없는 날짜는 추가하지 않는다. 스크롤 깊이는 수집 이전 데이터가 없어 제외한다.
export async function backfillEngagementToSheets(startDate: string) {
  const config = getAnalyticsConfig();
  const analyticsData = getAnalyticsDataClient();
  const sheets = getSheetsClient();

  if (!config || !analyticsData || !sheets) {
    return null;
  }

  const endDate = getKstDateString(0);

  if (!endDate || startDate > endDate) {
    return { startDate, endDate, updatedRowCount: 0 };
  }

  const pageReport = await runPageReport(analyticsData, config, [
    { startDate, endDate },
  ]);
  const engagementSecondsByDate = createValuesByDate(
    pageReport.data.rows ?? [],
    engagementSecondsFromRow,
  );
  const sheetName = await resolveAnalyticsSheetName(config);
  const existingRows = await getExistingDataRows(
    sheets,
    config.spreadsheetId,
    sheetName,
  );
  const data = [...createExistingRowsByDate(existingRows)]
    .filter(([date]) => date >= startDate && date <= endDate)
    .map(([date, { rowNumber }]) => ({
      range: sheetRange(sheetName, `${ENGAGEMENT_COLUMN}${rowNumber}`),
      values: [[optionalCell(engagementSecondsByDate.get(date))]],
    }));

  await ensureEngagementHeaders(sheets, config.spreadsheetId, sheetName);

  if (data.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: config.spreadsheetId,
      requestBody: {
        data,
        valueInputOption: "RAW",
      },
    });
  }

  return { startDate, endDate, updatedRowCount: data.length };
}

export async function getLatestAnalyticsSummary() {
  if (cachedSummary && cachedSummary.expiresAt > Date.now()) {
    return cachedSummary.value;
  }

  const config = getAnalyticsConfig();
  const sheets = getSheetsClient();

  if (!config || !sheets) {
    return null;
  }

  const sheetName = await resolveAnalyticsSheetName(config);
  const rows = await getExistingDataRows(
    sheets,
    config.spreadsheetId,
    sheetName,
  );
  const rowsByDate = createExistingRowsByDate(rows);
  const dailyRow =
    [...getKstSyncDates()]
      .reverse()
      .map((date) => rowsByDate.get(date)?.row)
      .find((row): row is DailyRow => Boolean(row)) ??
    (rows.at(-1) ? dailyRowFromSheetRow(rows.at(-1) ?? []) : null);

  if (!dailyRow) {
    cachedSummary = {
      expiresAt: Date.now() + 60 * 1000,
      value: null,
    };
    return null;
  }

  const summary: AnalyticsSummary = {
    date: formatSheetDate(dailyRow.date),
    screenPageViews: dailyRow.screenPageViews,
    buttonClicks: dailyRow.buttonClicks,
    pagePath: config.pagePath,
    syncedAt: "",
    totalUsers: dailyRow.totalUsers,
  };

  cachedSummary = {
    expiresAt: Date.now() + 5 * 60 * 1000,
    value: summary,
  };

  return summary;
}
