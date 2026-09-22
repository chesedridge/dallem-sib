import { NextResponse } from "next/server";
import { getGoogleSheetsConfig, getSheetsClient } from "@/lib/google";
import {
  createMatchToken,
  findPreSurveyRecord,
  hasCompletedPostSurvey,
} from "@/lib/post-survey";
import {
  isPostTiming,
  POST_SURVEY_ALREADY_COMPLETED,
  postSurveyAlreadyCompletedMessage,
} from "@/lib/survey-policy";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.nickname !== "string" ||
    !body.nickname.trim() ||
    body.nickname.length > 100 ||
    typeof body.contact !== "string" ||
    !/^010\d{7,8}$/.test(body.contact) ||
    !isPostTiming(body.timing)
  ) {
    return NextResponse.json(
      { message: "닉네임, 연락처, 사후검사 시기를 모두 확인해주세요." },
      { status: 400, headers },
    );
  }
  const config = getGoogleSheetsConfig();
  const sheets = getSheetsClient();
  if (!config || !sheets)
    return NextResponse.json(
      { message: "검사 기록을 조회할 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 503, headers },
    );
  try {
    if (
      await hasCompletedPostSurvey(
        sheets,
        config.spreadsheetId,
        body.contact,
        body.timing,
      )
    ) {
      return NextResponse.json(
        {
          code: POST_SURVEY_ALREADY_COMPLETED,
          message: postSurveyAlreadyCompletedMessage(body.timing),
        },
        { status: 409, headers },
      );
    }
    const record = await findPreSurveyRecord(sheets, config, body.contact);
    if (!record)
      return NextResponse.json(
        {
          message:
            "입력하신 연락처로 등록된 사전 검사 기록을 찾지 못했어요. 상담 신청 때 입력한 연락처가 맞는지 확인해 주세요.",
        },
        { status: 404, headers },
      );
    return NextResponse.json(
      {
        matchToken: createMatchToken(
          record,
          body.contact,
          body.timing,
          config.privateKey,
        ),
      },
      { headers },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "검사 기록 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 503, headers },
    );
  }
}
