import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "五险一金计算器",
  description: "基于员工工资和城市社保标准计算社保公积金费用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
