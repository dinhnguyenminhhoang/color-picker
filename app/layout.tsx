import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Color Picker Pro - Công cụ chọn màu chuyên nghiệp",
  description:
    "Công cụ chọn màu miễn phí với nhiều tính năng: Color picker, palettes, color schemes, gradient generator, pick màu từ ảnh",
  keywords:
    "color picker, chọn màu, hex, rgb, hsl, palette, gradient, color scheme",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Color Picker Pro - Công cụ chọn màu chuyên nghiệp",
    description: "Chọn màu, tạo palette, gradient và color schemes dễ dàng",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
