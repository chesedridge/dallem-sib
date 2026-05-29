import { NextResponse } from "next/server";

import { getLatestAnalyticsSummary } from "@/lib/analytics";
import { getGoogleApiErrorDetails } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await getLatestAnalyticsSummary();

    return NextResponse.json(
      {
        ok: true,
        summary,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      },
    );
  } catch (error) {
    const { status, message } = getGoogleApiErrorDetails(error);

    console.error("Failed to load latest analytics summary", {
      status,
      message,
    });

    return NextResponse.json(
      {
        ok: false,
        summary: null,
      },
      { status: 200 },
    );
  }
}
