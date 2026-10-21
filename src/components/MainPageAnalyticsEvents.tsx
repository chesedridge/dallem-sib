"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const MAIN_PAGE_BUTTON_CLICK_EVENT_NAME = "main_page_button_click";
// value(최대 스크롤 %)는 GA eventValue로 합산돼 별도 맞춤 지표 등록 없이 평균을 낼 수 있다.
const MAIN_PAGE_SCROLL_DEPTH_EVENT_NAME = "main_page_scroll_depth";

function getScrollPercent() {
  const { scrollHeight } = document.documentElement;

  if (scrollHeight <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(((window.scrollY + window.innerHeight) / scrollHeight) * 100),
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function MainPageAnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    // 페이지뷰당 한 번, 화면을 벗어날 때(탭 전환·닫기·CTA로 이동) 최대 스크롤 %를 보낸다.
    // 언마운트 정리에서 보내지 않는 이유: 개발 모드 StrictMode의 이중 실행이 가짜 이벤트를 만든다.
    const pageLocation = window.location.href;
    let maxScrollPercent = getScrollPercent();
    let scrollDepthSent = false;

    function updateMaxScrollPercent() {
      maxScrollPercent = Math.max(maxScrollPercent, getScrollPercent());
    }

    function sendScrollDepth() {
      if (scrollDepthSent) {
        return;
      }

      scrollDepthSent = true;
      // 마운트 시점에 레이아웃이 덜 잡혀 있었을 수 있어 떠나는 위치도 반영한다.
      updateMaxScrollPercent();
      window.gtag?.("event", MAIN_PAGE_SCROLL_DEPTH_EVENT_NAME, {
        value: maxScrollPercent,
        page_location: pageLocation,
        transport_type: "beacon",
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        sendScrollDepth();
      }
    }

    function trackMainPageButtonClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const ctaButton = target.closest<HTMLAnchorElement>(
        "[data-main-page-cta='true']",
      );

      if (!ctaButton) {
        return;
      }

      window.gtag?.("event", MAIN_PAGE_BUTTON_CLICK_EVENT_NAME, {
        button_text: ctaButton.textContent?.trim() ?? "",
        link_url: ctaButton.href,
        page_path: "/",
      });
      // CTA는 클라이언트 라우팅이라 visibilitychange 없이 페이지를 떠난다.
      sendScrollDepth();
    }

    document.addEventListener("click", trackMainPageButtonClick, true);
    window.addEventListener("scroll", updateMaxScrollPercent, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", sendScrollDepth);

    return () => {
      document.removeEventListener("click", trackMainPageButtonClick, true);
      window.removeEventListener("scroll", updateMaxScrollPercent);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", sendScrollDepth);
    };
  }, [pathname]);

  return null;
}
