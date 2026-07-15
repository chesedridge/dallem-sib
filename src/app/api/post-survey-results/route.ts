import { NextResponse } from "next/server";

import {
  getGoogleApiErrorDetails,
  getGoogleSheetsConfig,
  getSheetsClient,
  getSpreadsheetSheetTitles,
  sheetRange,
  type SheetsClient,
} from "@/lib/google";

export const runtime = "nodejs";

const POST_SHEET_NAME = "post-raw";
const PHONE_PATTERN = /^010\d{7,8}$/;
const ANSWER_COUNT = 9;
const HEADER_ROW = 1;
const FIRST_DATA_ROW = HEADER_ROW + 1;
const SHEET_LAST_COLUMN = "N";
const SHEET_HEADERS = [
  "검사일",
  "닉네임",
  "연락처",
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

type PostSurveySubmission = {
  nickname: string;
  contact: string;
  answers: number[];
  totalScore: number;
};

function getResultTitle(totalScore: number) {
  if (totalScore <= 4) {
    return "0~4점 : 정상";
  }

  if (totalScore <= 9) {
    return "5~9점 : 가벼운 우울";
  }

  if (totalScore <= 19) {
    return "10~19점 : 중간정도의 우울";
  }

  return "20~27점 : 심한 우울";
}

function validateSubmission(payload: unknown): PostSurveySubmission | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const submission = payload as Partial<PostSurveySubmission>;
  const nickname = submission.nickname?.trim();
  const contact = submission.contact?.trim();
  const answers = submission.answers;
  const totalScore = submission.totalScore;

  if (!nickname || nickname.length > 100 || !contact) {
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
    answers,
    totalScore,
  };
}

async function ensureHeaderRow(
  sheets: SheetsClient,
  spreadsheetId: string,
) {
  const headerRange = sheetRange(
    POST_SHEET_NAME,
    `A${HEADER_ROW}:${SHEET_LAST_COLUMN}${HEADER_ROW}`,
  );
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
    range: sheetRange(POST_SHEET_NAME, `A${HEADER_ROW}`),
    valueInputOption: "RAW",
    requestBody: {
      values: [Array.from(SHEET_HEADERS)],
    },
  });
}

export async function POST(request: Request) {
  const config = getGoogleSheetsConfig(POST_SHEET_NAME);

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
      { message: "전송된 응답 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const sheets = getSheetsClient();

    if (!sheets) {
      return NextResponse.json(
        {
          message:
            "Google Sheets 설정이 비어 있습니다. 환경변수를 먼저 설정해주세요.",
        },
        { status: 500 },
      );
    }

    const sheetTitles = await getSpreadsheetSheetTitles(
      sheets,
      config.spreadsheetId,
    );

    if (!sheetTitles.includes(POST_SHEET_NAME)) {
      console.error("Google Sheets tab was not found", {
        spreadsheetId: config.spreadsheetId,
        requestedSheetName: POST_SHEET_NAME,
        availableSheetNames: sheetTitles,
      });

      return NextResponse.json(
        { message: `시트 탭 '${POST_SHEET_NAME}'을 찾을 수 없습니다.` },
        { status: 500 },
      );
    }

    await ensureHeaderRow(sheets, config.spreadsheetId);
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: sheetRange(
        POST_SHEET_NAME,
        `A${FIRST_DATA_ROW}:${SHEET_LAST_COLUMN}`,
      ),
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            new Date().toISOString(),
            payload.nickname,
            payload.contact,
            ...payload.answers,
            payload.totalScore,
            getResultTitle(payload.totalScore),
          ],
        ],
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, message } = getGoogleApiErrorDetails(error);

    console.error("Failed to append post-survey result to Google Sheets", {
      status,
      message,
      spreadsheetId: config.spreadsheetId,
      sheetName: POST_SHEET_NAME,
    });

    return NextResponse.json(
      {
        message:
          status === 404
            ? "Google Sheets 저장 대상을 찾을 수 없습니다."
            : status === 403
              ? "Google Sheets 저장 권한이 없습니다. 서비스 계정 공유 상태를 확인해주세요."
              : "Google Sheets 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}
