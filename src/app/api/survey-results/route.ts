import { google } from "googleapis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PHONE_PATTERN = /^010\d{7,8}$/;
const ANSWER_COUNT = 9;
const HEADER_ROW = 3;
const FIRST_DATA_ROW = HEADER_ROW + 1;
const SHEET_HEADERS = [
  "접수일",
  "개인정보수집동의",
  "닉네임",
  "연락처",
  "지역",
  "상담방법",
  "상담주제",
  "상담주제기타",
  "추가상담주제",
  "추가상담주제기타",
  "힘든정도",
  "기대하는도움",
  "문항1",
  "문항2",
  "문항3",
  "문항4",
  "문항5",
  "문항6",
  "문항7",
  "문항8",
  "문항9",
  "총점",
  "위험단계",
] as const;

type SurveySubmission = {
  nickname: string;
  contact: string;
  residence: string;
  consultationMethod: string;
  consultationTopic: string;
  consultationTopicDetail: string;
  supportTopics: string[];
  supportTopicsDetail: string;
  hardshipLevel: string;
  expectedSupport: string[];
  privacyConsent: boolean;
  answers: number[];
  totalScore: number;
  resultTitle: string;
  resultDescription: string;
};

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

function sheetRange(sheetName: string, range: string) {
  const escapedSheetName = sheetName.replace(/'/g, "''");
  return `'${escapedSheetName}'!${range}`;
}

function normalizePrivateKey(privateKey?: string) {
  if (!privateKey) {
    return null;
  }

  const trimmedKey = privateKey.trim();
  const withoutWrappingQuotes =
    (trimmedKey.startsWith('"') && trimmedKey.endsWith('"')) ||
    (trimmedKey.startsWith("'") && trimmedKey.endsWith("'"))
      ? trimmedKey.slice(1, -1)
      : trimmedKey;

  return withoutWrappingQuotes.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
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

function getGoogleApiErrorDetails(error: unknown) {
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

async function getSpreadsheetSheetTitles(
  sheets: ReturnType<typeof google.sheets>,
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

function getGoogleSheetsConfig() {
  const serviceAccountJsonBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  const decodedServiceAccountJson = serviceAccountJsonBase64
    ? Buffer.from(serviceAccountJsonBase64, "base64").toString("utf8")
    : undefined;
  const serviceAccountJson =
    parseServiceAccountJson(decodedServiceAccountJson) ??
    parseServiceAccountJson(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const serviceAccountEmail =
    serviceAccountJson?.client_email ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(
    serviceAccountJson?.private_key ?? process.env.GOOGLE_PRIVATE_KEY,
  );
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME ?? "Sheet1";

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    return null;
  }

  return {
    serviceAccountEmail,
    privateKey,
    spreadsheetId,
    sheetName,
  };
}

function validateSubmission(payload: unknown): SurveySubmission | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const submission = payload as Partial<SurveySubmission>;
  const nickname = submission.nickname?.trim();
  const contact = submission.contact?.trim();
  const residence = submission.residence?.trim();
  const consultationMethod = submission.consultationMethod?.trim();
  const consultationTopic = submission.consultationTopic?.trim();
  const consultationTopicDetail = submission.consultationTopicDetail?.trim() ?? "";
  const supportTopics = submission.supportTopics;
  const supportTopicsDetail = submission.supportTopicsDetail?.trim() ?? "";
  const hardshipLevel = submission.hardshipLevel?.trim();
  const expectedSupport = submission.expectedSupport;
  const answers = submission.answers;
  const totalScore = submission.totalScore;
  const resultTitle = submission.resultTitle?.trim();
  const resultDescription = submission.resultDescription?.trim();

  if (
    !nickname ||
    !contact ||
    !residence ||
    !consultationMethod ||
    !consultationTopic ||
    !hardshipLevel ||
    !resultTitle ||
    !resultDescription
  ) {
    return null;
  }

  if (consultationTopic === "기타" && !consultationTopicDetail) {
    return null;
  }

  if (!Array.isArray(supportTopics) || supportTopics.length > 2) {
    return null;
  }

  const normalizedSupportTopics = supportTopics
    .filter((topic): topic is string => typeof topic === "string")
    .map((topic) => topic.trim())
    .filter(Boolean);

  if (
    normalizedSupportTopics.length !== supportTopics.length ||
    new Set(normalizedSupportTopics).size !== normalizedSupportTopics.length
  ) {
    return null;
  }

  if (
    normalizedSupportTopics.includes("기타") &&
    !supportTopicsDetail
  ) {
    return null;
  }

  if (!Array.isArray(expectedSupport) || expectedSupport.length > 2) {
    return null;
  }

  const normalizedExpectedSupport = expectedSupport
    .filter((option): option is string => typeof option === "string")
    .map((option) => option.trim())
    .filter(Boolean);

  if (
    normalizedExpectedSupport.length !== expectedSupport.length ||
    new Set(normalizedExpectedSupport).size !== normalizedExpectedSupport.length
  ) {
    return null;
  }

  if (!PHONE_PATTERN.test(contact)) {
    return null;
  }

  if (!Array.isArray(answers) || answers.length !== ANSWER_COUNT) {
    return null;
  }

  const hasInvalidAnswer = answers.some(
    (answer) => !Number.isInteger(answer) || answer < 0 || answer > 3,
  );

  if (hasInvalidAnswer || !Number.isInteger(totalScore)) {
    return null;
  }

  const computedTotalScore = answers.reduce((sum, answer) => sum + answer, 0);

  if (computedTotalScore !== totalScore) {
    return null;
  }

  return {
    nickname,
    contact,
    residence,
    consultationMethod,
    consultationTopic,
    consultationTopicDetail,
    supportTopics: normalizedSupportTopics,
    supportTopicsDetail,
    hardshipLevel,
    expectedSupport: normalizedExpectedSupport,
    privacyConsent: Boolean(submission.privacyConsent),
    answers,
    totalScore,
    resultTitle,
    resultDescription,
  };
}

async function ensureHeaderRow(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetName: string,
) {
  const headerRange = sheetRange(sheetName, `A${HEADER_ROW}:W${HEADER_ROW}`);
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });

  const existingHeaders = data.values?.[0] ?? [];

  if (
    existingHeaders.length === SHEET_HEADERS.length &&
    existingHeaders.every((header, index) => header === SHEET_HEADERS[index])
  ) {
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: sheetRange(sheetName, `A${HEADER_ROW}`),
    valueInputOption: "RAW",
    requestBody: {
      values: [Array.from(SHEET_HEADERS)],
    },
  });
}

export async function POST(request: Request) {
  const config = getGoogleSheetsConfig();

  if (!config) {
    return NextResponse.json(
      {
        message:
          "Google Sheets 설정이 비어 있습니다. 환경변수를 먼저 설정해주세요.",
      },
      { status: 500 },
    );
  }

  const payload = validateSubmission(await request.json().catch(() => null));

  if (!payload) {
    return NextResponse.json(
      {
        message: "전송된 응답 형식이 올바르지 않습니다.",
      },
      { status: 400 },
    );
  }

  try {
    const auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    let sheetTitles: string[];

    try {
      sheetTitles = await getSpreadsheetSheetTitles(sheets, config.spreadsheetId);
    } catch (error) {
      const { status, message } = getGoogleApiErrorDetails(error);

      console.error("Failed to load Google Sheets metadata", {
        status,
        message,
        spreadsheetId: config.spreadsheetId,
        sheetName: config.sheetName,
      });

      return NextResponse.json(
        {
          message:
            status === 404
              ? "스프레드시트를 찾을 수 없습니다. 스프레드시트 ID와 서비스 계정 공유 상태를 확인해주세요."
              : status === 403
                ? "스프레드시트 접근 권한이 없습니다. 서비스 계정을 편집자로 공유했는지 확인해주세요."
                : "Google Sheets 메타데이터 조회에 실패했습니다. 환경변수와 권한을 확인해주세요.",
        },
        { status: 500 },
      );
    }

    if (!sheetTitles.includes(config.sheetName)) {
      console.error("Google Sheets tab was not found", {
        spreadsheetId: config.spreadsheetId,
        requestedSheetName: config.sheetName,
        availableSheetNames: sheetTitles,
      });

      return NextResponse.json(
        {
          message: `시트 탭 '${config.sheetName}'을 찾을 수 없습니다. 실제 탭 이름을 GOOGLE_SHEETS_SHEET_NAME에 정확히 입력해주세요.`,
        },
        { status: 500 },
      );
    }

    await ensureHeaderRow(sheets, config.spreadsheetId, config.sheetName);
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: sheetRange(config.sheetName, `A${FIRST_DATA_ROW}:W`),
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            new Date().toISOString(),
            payload.privacyConsent ? "동의" : "미동의",
            payload.nickname,
            payload.contact,
            payload.residence,
            payload.consultationMethod,
            payload.consultationTopic,
            payload.consultationTopicDetail,
            payload.supportTopics.join(", "),
            payload.supportTopicsDetail,
            payload.hardshipLevel,
            payload.expectedSupport.join(", "),
            ...payload.answers,
            payload.totalScore,
            payload.resultTitle,
          ],
        ],
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, message } = getGoogleApiErrorDetails(error);

    console.error("Failed to append survey result to Google Sheets", {
      status,
      message,
      spreadsheetId: config.spreadsheetId,
      sheetName: config.sheetName,
    });

    return NextResponse.json(
      {
        message:
          status === 404
            ? "Google Sheets 저장 대상이 없습니다. 스프레드시트 ID와 시트 탭 이름을 다시 확인해주세요."
            : status === 403
              ? "Google Sheets 저장 권한이 없습니다. 서비스 계정을 시트 편집자로 공유했는지 확인해주세요."
              : "Google Sheets 저장 중 오류가 발생했습니다. 시트 공유와 환경변수를 확인해주세요.",
      },
      { status: 500 },
    );
  }
}
