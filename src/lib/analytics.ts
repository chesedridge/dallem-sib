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

const GOOGLE_SHEETS_DATE_EPOCH_MS = Date.UTC(1899, 11, 30);
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
  screenPageViews: number;
  totalUsers: number;
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
    totalUsers: parseMetricValue(metricValues[1]?.value),
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
  return [row.date, row.screenPageViews, row.totalUsers, row.buttonClicks];
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
  const dateValue = formatGaDate(row.dimensionValues?.[0]?.value);

  return normalizeDateCell(dateValue) ?? "";
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
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
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
    range: sheetRange(sheetName, "A3:D"),
    valueRenderOption: "UNFORMATTED_VALUE",
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
        buttonClicks: latestDailyRow.buttonClicks,
        date: latestDailyRow.date,
        pagePath: config.pagePath,
        screenPageViews: latestDailyRow.screenPageViews,
        syncedAt,
        totalUsers: latestDailyRow.totalUsers,
      }
    : null;

  await replaceSheetRangeValues(sheets, config.spreadsheetId, sheetName, "A3:D", "A3", [
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
    range: sheetRange(sheetName, "A3:D"),
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = data.values ?? [];
  const row = rows.at(-1);
  const dailyRow = row ? dailyRowFromSheetRow(row) : null;

  if (!dailyRow) {
    cachedSummary = {
      expiresAt: Date.now() + 60 * 1000,
      value: null,
    };
    return null;
  }

  const summary: AnalyticsSummary = {
    date: dailyRow.date,
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
