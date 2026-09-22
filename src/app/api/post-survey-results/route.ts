import { findResultBand } from "@/app/apply/components/constants";
import {
  findPreSurveyRecord,
  readMatchToken,
  hasCompletedPostSurvey,
} from "@/lib/post-survey";
import {
  POST_SURVEY_ALREADY_COMPLETED,
  postSurveyAlreadyCompletedMessage,
  isPostTiming,
  offersExtraSessions,
  type PostTiming,
} from "@/lib/survey-policy";
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
const SHEET_LAST_COLUMN = "Q";
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
  "진행시기",
  "변화량",
  "사전검사위험단계",
] as const;

type PostSurveySubmission = {
  timing: PostTiming;
  matchToken?: string;
  legacy: boolean;
  nickname: string;
  contact: string;
  answers: number[];
  totalScore: number;
};

function validateSubmission(payload: unknown): PostSurveySubmission | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const submission = payload as Partial<PostSurveySubmission>;
  if (
    typeof submission.nickname !== "string" ||
    typeof submission.contact !== "string"
  )
    return null;
  // Existing open clients did not send timing; they retain the original 4-session flow.
  const legacy =
    submission.timing === undefined && submission.matchToken === undefined;
  const timing = legacy ? "4" : submission.timing;
  if (
    !isPostTiming(timing) ||
    (!legacy && typeof submission.matchToken !== "string")
  )
    return null;
  const nickname = submission.nickname.trim();
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
    timing,
    legacy,
    matchToken: submission.matchToken,
    nickname,
    contact,
    answers,
    totalScore,
  };
}

async function ensureHeaderRow(sheets: SheetsClient, spreadsheetId: string) {
  const headerRange = sheetRange(
    POST_SHEET_NAME,
    `A${HEADER_ROW}:U${HEADER_ROW}`,
  );
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });
  const existingHeaders = data.values?.[0] ?? [];
  // Never relabel populated legacy columns: that would associate old values
  // with different fields. Existing sheets must remove these four columns first.
  const retiredHeaders = [
    "사전기록ID",
    "사전검사일",
    "사전총점",
    "추가2회기대상",
  ];
  if (
    existingHeaders.some((header) => retiredHeaders.includes(String(header)))
  ) {
    throw new Error("POST_SURVEY_LEGACY_COLUMNS");
  }

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

    const preConfig = getGoogleSheetsConfig();
    if (!preConfig)
      return NextResponse.json(
        { message: "사전 검사 조회 설정이 없습니다." },
        { status: 503 },
      );
    const preRecord = payload.legacy
      ? await findPreSurveyRecord(sheets, preConfig, payload.contact)
      : readMatchToken(
          payload.matchToken,
          payload.contact,
          payload.timing,
          config.privateKey,
        );
    if (!preRecord)
      return NextResponse.json(
        {
          message:
            "사전 검사 연결을 확인할 수 없습니다. 검사 시작 화면에서 다시 확인해주세요.",
        },
        { status: 409 },
      );
    const extraSessions = offersExtraSessions(
      payload.totalScore,
      payload.timing,
    );
    const scoreChange = payload.totalScore - preRecord.totalScore;
    const signedScoreChange =
      scoreChange > 0 ? `+${scoreChange}` : String(scoreChange);
    let alreadyCompleted: boolean;
    try {
      alreadyCompleted = await hasCompletedPostSurvey(
        sheets,
        config.spreadsheetId,
        payload.contact,
        payload.timing,
      );
    } catch {
      return NextResponse.json(
        {
          message:
            "검사 기록 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (alreadyCompleted) {
      return NextResponse.json(
        {
          code: POST_SURVEY_ALREADY_COMPLETED,
          message: postSurveyAlreadyCompletedMessage(payload.timing),
        },
        { status: 409, headers: { "Cache-Control": "no-store" } },
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
            findResultBand(payload.totalScore).title,
            `${payload.timing}회기 후`,
            signedScoreChange,
            findResultBand(preRecord.totalScore).title,
          ],
        ],
      },
    });

    return NextResponse.json(
      {
        ok: true,
        preAnswers: preRecord.answers,
        preTotalScore: preRecord.totalScore,
        extraSessions,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "POST_SURVEY_LEGACY_COLUMNS"
    ) {
      return NextResponse.json(
        {
          message:
            "저장 시트의 이전 형식이 남아 있습니다. 담당자가 사전기록ID, 사전검사일, 사전총점, 추가2회기대상 열을 제거한 뒤 다시 시도해주세요.",
        },
        { status: 409 },
      );
    }
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
