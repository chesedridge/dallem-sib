import {
  ensureSheetExists,
  getAnalyticsDataClient,
  getGoogleSheetsConfig,
  getSheetsClient,
  getSpreadsheetSheetTitleById,
  sheetRange,
} from "@/lib/google";

const MAIN_PAGE_BUTTON_CLICK_EVENT_NAME = "main_page_button_click";

const ANALYTICS_DATA_START_ROW = 3;
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

function getDateFromRow(row: {
  dimensionValues?: Array<{ value?: string | null }>;
}) {
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

function createMetricsByDate(
  rows: Array<{
    dimensionValues?: Array<{ value?: string | null }>;
    metricValues?: Array<{ value?: string | null }>;
  }>,
) {
  const metricsByDate = new Map<string, DailyMetricValues>();

  rows.forEach((row) => {
    const date = getDateFromRow(row);

    if (!date) {
      return;
    }

    metricsByDate.set(date, metricsFromRow(row));
  });

  return metricsByDate;
}

function createButtonClicksByDate(
  rows: Array<{
    dimensionValues?: Array<{ value?: string | null }>;
    metricValues?: Array<{ value?: string | null }>;
  }>,
) {
  const buttonClicksByDate = new Map<string, number>();

  rows.forEach((row) => {
    const date = getDateFromRow(row);

    if (!date) {
      return;
    }

    buttonClicksByDate.set(date, eventCountFromRow(row));
  });

  return buttonClicksByDate;
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

  const metricsByDate = createMetricsByDate(pageReport.data.rows ?? []);
  const buttonClicksByDate = createButtonClicksByDate(
    buttonClickReport.data.rows ?? [],
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
  const { data: existingData } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: sheetRange(sheetName, `A${ANALYTICS_DATA_START_ROW}:D`),
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const existingRows = (existingData.values ?? []) as Array<
    Array<string | number>
  >;
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

  if (rowsToUpdate.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: config.spreadsheetId,
      requestBody: {
        data: rowsToUpdate.map(({ row, rowNumber }) => ({
          range: sheetRange(sheetName, `A${rowNumber}:D${rowNumber}`),
          values: [sheetValuesFromDailyRow(row)],
        })),
        valueInputOption: "RAW",
      },
    });
  }

  if (rowsToAppend.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: sheetRange(
        sheetName,
        `A${ANALYTICS_DATA_START_ROW + existingRows.length}`,
      ),
      valueInputOption: "RAW",
      requestBody: {
        values: rowsToAppend.map(sheetValuesFromDailyRow),
      },
    });
  }

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
    range: sheetRange(sheetName, `A${ANALYTICS_DATA_START_ROW}:D`),
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = (data.values ?? []) as Array<Array<string | number>>;
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
