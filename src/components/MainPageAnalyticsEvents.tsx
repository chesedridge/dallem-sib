"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const MAIN_PAGE_BUTTON_CLICK_EVENT_NAME = "main_page_button_click";

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
    }

    document.addEventListener("click", trackMainPageButtonClick, true);

    return () => {
      document.removeEventListener("click", trackMainPageButtonClick, true);
    };
  }, [pathname]);

  return null;
}
