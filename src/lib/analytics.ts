import {
  ensureSheetExists,
  getAnalyticsDataClient,
  getGoogleSheetsConfig,
  getSheetsClient,
  getSpreadsheetSheetTitleById,
  replaceSheetRangeValues,
  sheetRange,
} from "@/lib/google";

const MAIN_PAGE_BUTTON_CLICK_EVENT_NAME = "main_page_button_click";

const ANALYTICS_HEADERS = [
  "날짜",
  "일간 '/' 라우트 뷰 수",
  "유니크 유저 수",
  "/페이지 내 버튼 클릭수",
] as const;

export type AnalyticsSummary = {
  activeUsers: number;
  buttonClicks: number;
  date: string;
  pagePath: string;
  screenPageViews: number;
  syncedAt: string;
};

type AnalyticsConfig = {
  endDate: string;
  pagePath: string;
  propertyId: string;
  propertyName: string;
  sheetGid: number | null;
  sheetName: string;
  spreadsheetId: string;
  startDate: string;
};

type DailyMetricValues = {
  activeUsers: number;
  screenPageViews: number;
};

type DailyRow = DailyMetricValues & {
  buttonClicks: number;
  date: string;
};

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
    endDate: getOptionalEnv(process.env.GA_REPORT_END_DATE) ?? "today",
    pagePath: getOptionalEnv(process.env.GA_PAGE_PATH) ?? "/",
    propertyId: normalizedPropertyId,
    propertyName: `properties/${normalizedPropertyId}`,
    sheetGid: parseSheetGid(process.env.GOOGLE_SHEETS_ANALYTICS_SHEET_GID),
    sheetName:
      getOptionalEnv(process.env.GOOGLE_SHEETS_ANALYTICS_SHEET_NAME) ??
      getOptionalEnv(process.env.GOOGLE_SHEETS_ANALYTICS_DAILY_SHEET_NAME) ??
      "GA Daily Summary",
    spreadsheetId: sheetsConfig.spreadsheetId,
    startDate: getOptionalEnv(process.env.GA_REPORT_START_DATE) ?? "30daysAgo",
  };
}

function parseMetricValue(value?: string | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function metricsFromRow(row?: { metricValues?: Array<{ value?: string | null }> }) {
  const metricValues = row?.metricValues ?? [];

  return {
    screenPageViews: parseMetricValue(metricValues[0]?.value),
    activeUsers: parseMetricValue(metricValues[1]?.value),
  } satisfies DailyMetricValues;
}

function eventCountFromRow(row?: { metricValues?: Array<{ value?: string | null }> }) {
  return parseMetricValue(row?.metricValues?.[0]?.value);
}

function formatGaDate(value?: string | null) {
  if (!value || value.length !== 8) {
    return value ?? "";
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}`;
}

function parseNumberCell(value?: string) {
  const parsed = Number(String(value ?? 0).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function dailyRowFromSheetRow(row: Array<string | number>) {
  const date = String(row[0] ?? "").trim();

  if (!date) {
    return null;
  }

  return {
    activeUsers: parseNumberCell(String(row[2] ?? "")),
    buttonClicks: parseNumberCell(String(row[3] ?? "")),
    date,
    screenPageViews: parseNumberCell(String(row[1] ?? "")),
  } satisfies DailyRow;
}

function sheetValuesFromDailyRow(row: DailyRow) {
  return [row.date, row.screenPageViews, row.activeUsers, row.buttonClicks];
}

function mergeDailyRows(existingRows: DailyRow[], syncedRows: DailyRow[]) {
  const rowsByDate = new Map<string, DailyRow>();

  for (const row of existingRows) {
    rowsByDate.set(row.date, row);
  }

  for (const row of syncedRows) {
    rowsByDate.set(row.date, row);
  }

  return Array.from(rowsByDate.values());
}

function getDateFromRow(row: {
  dimensionValues?: Array<{ value?: string | null }>;
}) {
  return formatGaDate(row.dimensionValues?.[0]?.value);
}

function getLatestDailyRow(rows: DailyRow[]) {
  return rows.at(-1) ?? null;
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

function createButtonClickFilter(pagePath: string) {
  return {
    andGroup: {
      expressions: [
        createPagePathFilter(pagePath),
        {
          filter: {
            fieldName: "eventName",
            stringFilter: {
              matchType: "EXACT",
              value: MAIN_PAGE_BUTTON_CLICK_EVENT_NAME,
            },
          },
        },
      ],
    },
  };
}

export async function syncGaAnalyticsToSheets() {
  const config = getAnalyticsConfig();
  const analyticsData = getAnalyticsDataClient();
  const sheets = getSheetsClient();

  if (!config || !analyticsData || !sheets) {
    return null;
  }

  const dateRanges = [
    {
      startDate: config.startDate,
      endDate: config.endDate,
    },
  ];
  const orderBys = [
    {
      dimension: {
        dimensionName: "date",
      },
    },
  ];

  const [pageReport, buttonClickReport] = await Promise.all([
    analyticsData.properties.runReport({
      property: config.propertyName,
      requestBody: {
        dateRanges,
        dimensions: [{ name: "date" }],
        dimensionFilter: createPagePathFilter(config.pagePath),
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        orderBys,
      },
    }),
    analyticsData.properties.runReport({
      property: config.propertyName,
      requestBody: {
        dateRanges,
        dimensions: [{ name: "date" }],
        dimensionFilter: createButtonClickFilter(config.pagePath),
        metrics: [{ name: "eventCount" }],
        orderBys,
      },
    }),
  ]);

  const buttonClicksByDate = new Map(
    (buttonClickReport.data.rows ?? []).map((row) => [
      getDateFromRow(row),
      eventCountFromRow(row),
    ]),
  );
  const dailyRows: DailyRow[] = (pageReport.data.rows ?? []).map((row) => {
    const date = getDateFromRow(row);
    const rowMetrics = metricsFromRow(row);

    return {
      ...rowMetrics,
      buttonClicks: buttonClicksByDate.get(date) ?? 0,
      date,
    };
  });
  const sheetName = await resolveAnalyticsSheetName(config);
  const { data: existingData } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: sheetRange(sheetName, "A2:D"),
  });
  const existingRows =
    existingData.values
      ?.map((row) => dailyRowFromSheetRow(row))
      .filter((row): row is DailyRow => Boolean(row)) ?? [];
  const mergedRows = mergeDailyRows(existingRows, dailyRows);
  const syncedAt = new Date().toISOString();
  const latestDailyRow = getLatestDailyRow(mergedRows);
  const summary: AnalyticsSummary | null = latestDailyRow
    ? {
        activeUsers: latestDailyRow.activeUsers,
        buttonClicks: latestDailyRow.buttonClicks,
        date: latestDailyRow.date,
        pagePath: config.pagePath,
        screenPageViews: latestDailyRow.screenPageViews,
        syncedAt,
      }
    : null;

  await replaceSheetRangeValues(sheets, config.spreadsheetId, sheetName, "A:D", [
    Array.from(ANALYTICS_HEADERS),
    ...mergedRows.map(sheetValuesFromDailyRow),
  ]);

  cachedSummary = {
    expiresAt: Date.now() + 5 * 60 * 1000,
    value: summary,
  };

  return {
    dailyRowCount: dailyRows.length,
    summary,
  };
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
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: sheetRange(sheetName, "A2:D"),
  });
  const rows = data.values ?? [];
  const row = rows.at(-1);

  if (!row) {
    cachedSummary = {
      expiresAt: Date.now() + 60 * 1000,
      value: null,
    };
    return null;
  }

  const summary: AnalyticsSummary = {
    date: String(row[0] ?? ""),
    screenPageViews: parseNumberCell(row[1]),
    activeUsers: parseNumberCell(row[2]),
    buttonClicks: parseNumberCell(row[3]),
    pagePath: config.pagePath,
    syncedAt: "",
  };

  cachedSummary = {
    expiresAt: Date.now() + 5 * 60 * 1000,
    value: summary,
  };

  return summary;
}
