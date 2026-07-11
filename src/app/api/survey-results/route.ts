import { NextResponse } from "next/server";

import {
  buildSurveyConfirmationSms,
  getAligoConfig,
  maskPhoneNumber,
  sendAligoSms,
} from "@/lib/aligo";
import {
  getGoogleApiErrorDetails,
  getGoogleSheetsConfig,
  getSheetsClient,
  getSpreadsheetSheetTitles,
  sheetRange,
  type SheetsClient,
} from "@/lib/google";
import {
  isValidBirthDate,
  isValidPreferredScheduleDate,
  isValidPreferredScheduleTime,
  PREFERRED_SCHEDULE_LIMIT,
  type PreferredSchedule,
} from "@/lib/preferred-schedule";

export const runtime = "nodejs";

const PHONE_PATTERN = /^010\d{7,8}$/;
const ANSWER_COUNT = 9;
const HEADER_ROW = 3;
const FIRST_DATA_ROW = HEADER_ROW + 1;
const SHEET_LAST_COLUMN = "AD";
const isAligoSmsEnabled = process.env.ALIGO_SMS_ENABLED === "Y";
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
  "생년월일",
  "희망일정1 날짜",
  "희망일정1 시간",
  "희망일정2 날짜",
  "희망일정2 시간",
  "희망일정3 날짜",
  "희망일정3 시간",
] as const;

type SurveySubmission = {
  nickname: string;
  birthDate: string;
  contact: string;
  residence: string;
  consultationMethod: string;
  consultationTopic: string;
  consultationTopicDetail: string;
  supportTopics: string[];
  supportTopicsDetail: string;
  hardshipLevel: string;
  expectedSupport: string[];
  preferredSchedules: PreferredSchedule[];
  privacyConsent: boolean;
  answers: number[];
  totalScore: number;
  resultTitle: string;
  resultDescription: string;
};

function validateSubmission(payload: unknown): SurveySubmission | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const submission = payload as Partial<SurveySubmission>;
  const nickname = submission.nickname?.trim();
  const birthDate = submission.birthDate?.trim();
  const contact = submission.contact?.trim();
  const residence = submission.residence?.trim();
  const consultationMethod = submission.consultationMethod?.trim();
  const consultationTopic = submission.consultationTopic?.trim();
  const consultationTopicDetail = submission.consultationTopicDetail?.trim() ?? "";
  const supportTopics = submission.supportTopics;
  const supportTopicsDetail = submission.supportTopicsDetail?.trim() ?? "";
  const hardshipLevel = submission.hardshipLevel?.trim();
  const expectedSupport = submission.expectedSupport;
  const preferredSchedules = submission.preferredSchedules;
  const answers = submission.answers;
  const totalScore = submission.totalScore;
  const resultTitle = submission.resultTitle?.trim();
  const resultDescription = submission.resultDescription?.trim();

  if (
    !nickname ||
    !birthDate ||
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

  if (!isValidBirthDate(birthDate)) {
    return null;
  }

  if (submission.privacyConsent !== true) {
    return null;
  }

  if (
    !Array.isArray(preferredSchedules) ||
    preferredSchedules.length !== PREFERRED_SCHEDULE_LIMIT
  ) {
    return null;
  }

  const normalizedPreferredSchedules = preferredSchedules.map((schedule) => {
    if (!schedule || typeof schedule !== "object") {
      return null;
    }

    const date = typeof schedule.date === "string" ? schedule.date.trim() : "";
    const time = typeof schedule.time === "string" ? schedule.time.trim() : "";

    if (
      !isValidPreferredScheduleDate(date) ||
      !isValidPreferredScheduleTime(time)
    ) {
      return null;
    }

    return { date, time };
  });

  if (normalizedPreferredSchedules.some((schedule) => schedule === null)) {
    return null;
  }

  const completePreferredSchedules = normalizedPreferredSchedules as PreferredSchedule[];

  if (
    new Set(
      completePreferredSchedules.map((schedule) => `${schedule.date} ${schedule.time}`),
    ).size !== completePreferredSchedules.length
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
    birthDate,
    contact,
    residence,
    consultationMethod,
    consultationTopic,
    consultationTopicDetail,
    supportTopics: normalizedSupportTopics,
    supportTopicsDetail,
    hardshipLevel,
    expectedSupport: normalizedExpectedSupport,
    preferredSchedules: completePreferredSchedules,
    privacyConsent: submission.privacyConsent,
    answers,
    totalScore,
    resultTitle,
    resultDescription,
  };
}

const SMS_HIGHLIGHT_SHEET_ID = 1525438762;
const SMS_HIGHLIGHT_SHEET_NAME = "상담진행관리";
const NICKNAME_COLUMN_INDEX = 2;
const CONTACT_COLUMN = "D";

async function highlightSmsSentRow(
  sheets: SheetsClient,
  spreadsheetId: string,
  contact: string,
) {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetRange(
      SMS_HIGHLIGHT_SHEET_NAME,
      `${CONTACT_COLUMN}:${CONTACT_COLUMN}`,
    ),
  });

  const contactCells = data.values ?? [];
  const normalizedContact = contact.replace(/\D/g, "");
  let highlightRowNumber = -1;

  // 같은 연락처로 여러 번 신청했을 수 있으므로 가장 최근(아래) 행을 찾는다.
  for (let index = contactCells.length - 1; index >= 0; index -= 1) {
    const cellValue = String(contactCells[index]?.[0] ?? "").replace(/\D/g, "");

    if (cellValue && cellValue === normalizedContact) {
      highlightRowNumber = index + 1;
      break;
    }
  }

  if (highlightRowNumber < 2) {
    throw new Error(
      `${SMS_HIGHLIGHT_SHEET_NAME} 탭에서 연락처를 찾을 수 없습니다. (receiver: ${maskPhoneNumber(contact)})`,
    );
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: SMS_HIGHLIGHT_SHEET_ID,
              startRowIndex: highlightRowNumber - 1,
              endRowIndex: highlightRowNumber,
              startColumnIndex: NICKNAME_COLUMN_INDEX,
              endColumnIndex: NICKNAME_COLUMN_INDEX + 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 1, green: 1, blue: 0 },
              },
            },
            fields: "userEnteredFormat.backgroundColor",
          },
        },
      ],
    },
  });
}

async function ensureHeaderRow(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetName: string,
) {
  const headerRange = sheetRange(
    sheetName,
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
    const sheets = getSheetsClient();
    let sheetTitles: string[];

    if (!sheets) {
      return NextResponse.json(
        {
          message:
            "Google Sheets 설정이 비어 있습니다. 환경변수를 먼저 설정해주세요.",
        },
        { status: 500 },
      );
    }

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
      range: sheetRange(config.sheetName, `A${FIRST_DATA_ROW}:${SHEET_LAST_COLUMN}`),
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
            payload.birthDate,
            ...Array.from({ length: PREFERRED_SCHEDULE_LIMIT }, (_, index) => {
              const schedule = payload.preferredSchedules[index];

              return [schedule?.date ?? "", schedule?.time ?? ""];
            }).flat(),
          ],
        ],
      },
    });

    // 문자 발송 실패가 신청 접수 자체를 막으면 안 되므로 오류는 기록만 한다.
    if (isAligoSmsEnabled && getAligoConfig()) {
      let smsSent = false;

      try {
        await sendAligoSms(
          payload.contact,
          buildSurveyConfirmationSms(payload.nickname),
        );
        smsSent = true;
      } catch (error) {
        console.error("Failed to send Aligo SMS", {
          receiver: maskPhoneNumber(payload.contact),
          message: error instanceof Error ? error.message : String(error),
        });
      }

      if (smsSent) {
        try {
          await highlightSmsSentRow(sheets, config.spreadsheetId, payload.contact);
        } catch (error) {
          console.error("Failed to highlight SMS-sent row", {
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } else if (isAligoSmsEnabled) {
      console.warn(
        "Aligo SMS skipped: ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER 미설정",
      );
    } else {
      console.info("Aligo SMS skipped: notification sending is disabled");
    }

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
