import {
  ensureSheetExists,
  getAnalyticsDataClient,
  getGoogleSheetsConfig,
  getSheetsClient,
  replaceSheetValues,
  sheetRange,
} from "@/lib/google";

const ANALYTICS_DAILY_HEADERS = [
  "날짜",
  "페이지경로",
  "조회수",
  "유니크사용자",
  "세션수",
  "참여세션수",
  "GA속성ID",
  "동기화시각",
] as const;

const ANALYTICS_SUMMARY_HEADERS = [
  "동기화시각",
  "시작일",
  "종료일",
  "페이지경로",
  "조회수",
  "유니크사용자",
  "세션수",
  "참여세션수",
  "GA속성ID",
] as const;

export type AnalyticsSummary = {
  activeUsers: number;
  engagedSessions: number;
  endDate: string;
  pagePath: string;
  propertyId: string;
  screenPageViews: number;
  sessions: number;
  startDate: string;
  syncedAt: string;
};

type AnalyticsConfig = {
  dailySheetName: string;
  endDate: string;
  pagePath: string;
  propertyId: string;
  propertyName: string;
  spreadsheetId: string;
  startDate: string;
  summarySheetName: string;
};

type MetricValues = {
  activeUsers: number;
  engagedSessions: number;
  screenPageViews: number;
  sessions: number;
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

function getAnalyticsConfig(): AnalyticsConfig | null {
  const sheetsConfig = getGoogleSheetsConfig();
  const propertyId = process.env.GA_PROPERTY_ID?.trim();

  if (!sheetsConfig || !propertyId) {
    return null;
  }

  const normalizedPropertyId = normalizePropertyId(propertyId);

  return {
    dailySheetName:
      process.env.GOOGLE_SHEETS_ANALYTICS_DAILY_SHEET_NAME ??
      "GA Daily Summary",
    endDate: process.env.GA_REPORT_END_DATE ?? "today",
    pagePath: process.env.GA_PAGE_PATH ?? "/",
    propertyId: normalizedPropertyId,
    propertyName: `properties/${normalizedPropertyId}`,
    spreadsheetId: sheetsConfig.spreadsheetId,
    startDate: process.env.GA_REPORT_START_DATE ?? "30daysAgo",
    summarySheetName:
      process.env.GOOGLE_SHEETS_ANALYTICS_SUMMARY_SHEET_NAME ??
      "GA Latest Summary",
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
    sessions: parseMetricValue(metricValues[2]?.value),
    engagedSessions: parseMetricValue(metricValues[3]?.value),
  } satisfies MetricValues;
}

function formatGaDate(value?: string | null) {
  if (!value || value.length !== 8) {
    return value ?? "";
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}`;
}

function parseNumberCell(value?: string) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function syncGaAnalyticsToSheets() {
  const config = getAnalyticsConfig();
  const analyticsData = getAnalyticsDataClient();
  const sheets = getSheetsClient();

  if (!config || !analyticsData || !sheets) {
    return null;
  }

  const dimensionFilter = {
    filter: {
      fieldName: "pagePath",
      stringFilter: {
        matchType: "EXACT",
        value: config.pagePath,
      },
    },
  };
  const metrics = [
    { name: "screenPageViews" },
    { name: "activeUsers" },
    { name: "sessions" },
    { name: "engagedSessions" },
  ];
  const dateRanges = [
    {
      startDate: config.startDate,
      endDate: config.endDate,
    },
  ];

  const [summaryReport, dailyReport] = await Promise.all([
    analyticsData.properties.runReport({
      property: config.propertyName,
      requestBody: {
        dateRanges,
        dimensionFilter,
        metrics,
      },
    }),
    analyticsData.properties.runReport({
      property: config.propertyName,
      requestBody: {
        dateRanges,
        dimensions: [{ name: "date" }],
        dimensionFilter,
        metrics,
        orderBys: [
          {
            dimension: {
              dimensionName: "date",
            },
          },
        ],
      },
    }),
  ]);

  const syncedAt = new Date().toISOString();
  const summaryMetrics = metricsFromRow(summaryReport.data.rows?.[0]);
  const summary: AnalyticsSummary = {
    ...summaryMetrics,
    endDate: config.endDate,
    pagePath: config.pagePath,
    propertyId: config.propertyId,
    startDate: config.startDate,
    syncedAt,
  };
  const dailyRows = (dailyReport.data.rows ?? []).map((row) => {
    const rowMetrics = metricsFromRow(row);
    const date = formatGaDate(row.dimensionValues?.[0]?.value);

    return [
      date,
      config.pagePath,
      rowMetrics.screenPageViews,
      rowMetrics.activeUsers,
      rowMetrics.sessions,
      rowMetrics.engagedSessions,
      config.propertyId,
      syncedAt,
    ];
  });

  await ensureSheetExists(sheets, config.spreadsheetId, config.summarySheetName);
  await ensureSheetExists(sheets, config.spreadsheetId, config.dailySheetName);
  await replaceSheetValues(sheets, config.spreadsheetId, config.summarySheetName, [
    Array.from(ANALYTICS_SUMMARY_HEADERS),
    [
      summary.syncedAt,
      summary.startDate,
      summary.endDate,
      summary.pagePath,
      summary.screenPageViews,
      summary.activeUsers,
      summary.sessions,
      summary.engagedSessions,
      summary.propertyId,
    ],
  ]);
  await replaceSheetValues(sheets, config.spreadsheetId, config.dailySheetName, [
    Array.from(ANALYTICS_DAILY_HEADERS),
    ...dailyRows,
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

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: sheetRange(config.summarySheetName, "A2:I2"),
  });
  const row = data.values?.[0];

  if (!row) {
    cachedSummary = {
      expiresAt: Date.now() + 60 * 1000,
      value: null,
    };
    return null;
  }

  const summary: AnalyticsSummary = {
    syncedAt: String(row[0] ?? ""),
    startDate: String(row[1] ?? ""),
    endDate: String(row[2] ?? ""),
    pagePath: String(row[3] ?? "/"),
    screenPageViews: parseNumberCell(row[4]),
    activeUsers: parseNumberCell(row[5]),
    sessions: parseNumberCell(row[6]),
    engagedSessions: parseNumberCell(row[7]),
    propertyId: String(row[8] ?? ""),
  };

  cachedSummary = {
    expiresAt: Date.now() + 5 * 60 * 1000,
    value: summary,
  };

  return summary;
}
