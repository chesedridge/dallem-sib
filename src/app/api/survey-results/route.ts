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
  privacyConsent: boolean;
  answers: number[];
  totalScore: number;
  resultTitle: string;
  resultDescription: string;
};

function sheetRange(sheetName: string, range: string) {
  const escapedSheetName = sheetName.replace(/'/g, "''");
  return `'${escapedSheetName}'!${range}`;
}

function getGoogleSheetsConfig() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
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
  const answers = submission.answers;
  const totalScore = submission.totalScore;
  const resultTitle = submission.resultTitle?.trim();
  const resultDescription = submission.resultDescription?.trim();

  if (!nickname || !contact || !residence || !resultTitle || !resultDescription) {
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
  const headerRange = sheetRange(sheetName, `A${HEADER_ROW}:P${HEADER_ROW}`);
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });

  if ((data.values?.[0] ?? []).length > 0) {
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

    await ensureHeaderRow(sheets, config.spreadsheetId, config.sheetName);
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: sheetRange(config.sheetName, `A${FIRST_DATA_ROW}:P`),
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
            ...payload.answers,
            payload.totalScore,
            payload.resultTitle,
          ],
        ],
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to append survey result to Google Sheets", error);

    return NextResponse.json(
      {
        message:
          "Google Sheets 저장 중 오류가 발생했습니다. 시트 공유와 환경변수를 확인해주세요.",
      },
      { status: 500 },
    );
  }
}
