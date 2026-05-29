import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { syncGaAnalyticsToSheets } from "@/lib/analytics";
import { getGoogleApiErrorDetails } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function isAuthorized(request: Request) {
  const expectedSecret = process.env.ANALYTICS_SYNC_SECRET;

  if (!expectedSecret) {
    return false;
  }

  const { searchParams } = new URL(request.url);
  const receivedSecret =
    request.headers.get("x-analytics-sync-secret") ??
    searchParams.get("secret") ??
    "";

  return secretsMatch(receivedSecret, expectedSecret);
}

async function handleSync(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        message: "인증되지 않은 GA 동기화 요청입니다.",
      },
      { status: 401 },
    );
  }

  try {
    const result = await syncGaAnalyticsToSheets();

    if (!result) {
      return NextResponse.json(
        {
          message:
            "GA 또는 Google Sheets 설정이 비어 있습니다. 환경변수를 확인해주세요.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      dailyRowCount: result.dailyRowCount,
      summary: result.summary,
    });
  } catch (error) {
    const { status, message } = getGoogleApiErrorDetails(error);

    console.error("Failed to sync GA analytics to Google Sheets", {
      status,
      message,
    });

    return NextResponse.json(
      {
        message:
          status === 403
            ? "GA 또는 Google Sheets 접근 권한이 없습니다. 서비스 계정 권한을 확인해주세요."
            : "GA 집계 동기화 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
