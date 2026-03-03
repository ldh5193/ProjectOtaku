import type { Metadata, Viewport } from "next";
import NaverMapProvider from "@/components/NaverMapProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "오덕로드 - 오프라인 굿즈샵 지도",
  description:
    "서울 지역 애니메이션, 피규어, 만화, 아이돌 굿즈샵을 지도에서 한눈에 찾아보세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="h-screen flex flex-col">
          <NaverMapProvider>{children}</NaverMapProvider>
        </body>
    </html>
  );
}
