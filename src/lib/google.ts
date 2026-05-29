import { google } from "googleapis";

export type SheetsClient = ReturnType<typeof google.sheets>;

type GoogleServiceAccountJson = {
  client_email?: string;
  private_key?: string;
};

type GoogleApiError = {
  code?: number | string;
  status?: number;
  message?: string;
  response?: {
    status?: number;
    data?: {
      error?: {
        code?: number;
        message?: string;
        status?: string;
      };
    };
  };
  errors?: Array<{
    message?: string;
    reason?: string;
  }>;
};

export type GoogleSheetsConfig = {
  serviceAccountEmail: string;
  privateKey: string;
  spreadsheetId: string;
  sheetName: string;
};

function stripWrappingQuotes(value?: string) {
  if (!value) {
    return value;
  }

  const trimmedValue = value.trim();
  const hasWrappingQuotes =
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"));

  return hasWrappingQuotes ? trimmedValue.slice(1, -1) : trimmedValue;
}

export function sheetRange(sheetName: string, range: string) {
  const escapedSheetName = sheetName.replace(/'/g, "''");
  return `'${escapedSheetName}'!${range}`;
}

function normalizePrivateKey(privateKey?: string) {
  const strippedPrivateKey = stripWrappingQuotes(privateKey);

  if (!strippedPrivateKey) {
    return null;
  }

  return strippedPrivateKey.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

function parseServiceAccountJson(rawValue?: string): GoogleServiceAccountJson | null {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as GoogleServiceAccountJson;
  } catch {
    return null;
  }
}

function getGoogleServiceAccountConfig() {
  const serviceAccountJsonBase64 = stripWrappingQuotes(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64,
  );
  const decodedServiceAccountJson = serviceAccountJsonBase64
    ? Buffer.from(serviceAccountJsonBase64, "base64").toString("utf8")
    : undefined;
  const serviceAccountJson =
    parseServiceAccountJson(decodedServiceAccountJson) ??
    parseServiceAccountJson(
      stripWrappingQuotes(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    );
  const serviceAccountEmail =
    serviceAccountJson?.client_email ??
    stripWrappingQuotes(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  const privateKey = normalizePrivateKey(
    serviceAccountJson?.private_key ?? process.env.GOOGLE_PRIVATE_KEY,
  );

  if (!serviceAccountEmail || !privateKey) {
    return null;
  }

  return {
    serviceAccountEmail,
    privateKey,
  };
}

export function getGoogleSheetsConfig(
  sheetName = stripWrappingQuotes(process.env.GOOGLE_SHEETS_SHEET_NAME) ?? "Sheet1",
): GoogleSheetsConfig | null {
  const serviceAccountConfig = getGoogleServiceAccountConfig();
  const spreadsheetId = stripWrappingQuotes(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);

  if (!serviceAccountConfig || !spreadsheetId) {
    return null;
  }

  return {
    ...serviceAccountConfig,
    spreadsheetId,
    sheetName,
  };
}

export function getGoogleAuth(scopes: string[]) {
  const serviceAccountConfig = getGoogleServiceAccountConfig();

  if (!serviceAccountConfig) {
    return null;
  }

  return new google.auth.JWT({
    email: serviceAccountConfig.serviceAccountEmail,
    key: serviceAccountConfig.privateKey,
    scopes,
  });
}

export function getSheetsClient() {
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);

  if (!auth) {
    return null;
  }

  return google.sheets({ version: "v4", auth });
}

export function getAnalyticsDataClient() {
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/analytics.readonly"]);

  if (!auth) {
    return null;
  }

  return google.analyticsdata({ version: "v1beta", auth });
}

export function getGoogleApiErrorDetails(error: unknown) {
  const googleApiError = error as GoogleApiError;
  const status =
    googleApiError.response?.status ??
    googleApiError.status ??
    (typeof googleApiError.code === "number" ? googleApiError.code : undefined);
  const message =
    googleApiError.response?.data?.error?.message ??
    googleApiError.errors?.[0]?.message ??
    googleApiError.message ??
    "Unknown error";

  return { status, message };
}

export async function getSpreadsheetSheetTitles(
  sheets: SheetsClient,
  spreadsheetId: string,
) {
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  return data.sheets
    ?.map((sheet) => sheet.properties?.title)
    .filter((title): title is string => Boolean(title)) ?? [];
}

export async function getSpreadsheetSheetTitleById(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetId: number,
) {
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });

  return data.sheets?.find((sheet) => sheet.properties?.sheetId === sheetId)
    ?.properties?.title ?? null;
}

export async function ensureSheetExists(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetName: string,
) {
  const sheetTitles = await getSpreadsheetSheetTitles(sheets, spreadsheetId);

  if (sheetTitles.includes(sheetName)) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  });
}

export async function replaceSheetValues(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetName: string,
  values: Array<Array<string | number>>,
) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: sheetRange(sheetName, "A:Z"),
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: sheetRange(sheetName, "A1"),
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });
}

export async function replaceSheetRangeValues(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetName: string,
  clearRange: string,
  values: Array<Array<string | number>>,
) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: sheetRange(sheetName, clearRange),
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: sheetRange(sheetName, "A1"),
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });
}
