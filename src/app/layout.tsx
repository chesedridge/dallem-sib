import type { Metadata } from "next";
import { Suspense } from "react";

import GoogleAnalytics from "@/components/GoogleAnalytics";

import "./globals.css";

export const metadata: Metadata = {
  title: "경기도 거주자, 직장인 멘탈 프로젝트",
  description:
    "우울증 개선 및 자살예방 SIB사업 - 경기도 직장인을 위한 무료 심리 상담 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
