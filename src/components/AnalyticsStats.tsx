"use client";

import { useEffect, useState } from "react";

type AnalyticsSummary = {
  activeUsers: number;
  buttonClicks: number;
  date: string;
  pagePath: string;
  screenPageViews: number;
  syncedAt: string;
};

type AnalyticsSummaryResponse = {
  ok: boolean;
  summary: AnalyticsSummary | null;
};

const numberFormatter = new Intl.NumberFormat("ko-KR");

export default function AnalyticsStats() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const response = await fetch("/api/analytics/summary", {
          cache: "no-store",
        });
        const data = (await response.json()) as AnalyticsSummaryResponse;

        if (!cancelled && data.ok && data.summary) {
          setSummary(data.summary);
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
        }
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!summary) {
    return null;
  }

  return (
    <section className="w-full bg-bg-warm-light px-5 py-6 md:px-10 md:py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[20px] border border-border-soft bg-bg-white px-6 py-5 shadow-[0_2px_12px_rgba(240,135,119,0.08)] md:flex-row md:items-center md:justify-between md:rounded-[24px] md:px-10 md:py-6">
        <div>
          <p className="text-[13px] font-bold tracking-[0.08em] text-primary-strong">
            방문 현황
          </p>
          <p className="mt-1 text-sm font-medium text-text-sub md:text-[15px]">
            {summary.date} 기준
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 md:min-w-[520px] md:gap-6">
          <div>
            <p className="text-[24px] font-extrabold leading-none tracking-[-0.03em] text-text-dark md:text-[32px]">
              {numberFormatter.format(summary.screenPageViews)}
            </p>
            <p className="mt-2 text-sm font-semibold text-text-sub">
              페이지 조회
            </p>
          </div>
          <div>
            <p className="text-[24px] font-extrabold leading-none tracking-[-0.03em] text-text-dark md:text-[32px]">
              {numberFormatter.format(summary.activeUsers)}
            </p>
            <p className="mt-2 text-sm font-semibold text-text-sub">
              유니크 방문자
            </p>
          </div>
          <div>
            <p className="text-[24px] font-extrabold leading-none tracking-[-0.03em] text-text-dark md:text-[32px]">
              {numberFormatter.format(summary.buttonClicks)}
            </p>
            <p className="mt-2 text-sm font-semibold text-text-sub">
              신청 버튼 클릭
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
