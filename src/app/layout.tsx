import { Noto_Sans_JP } from "next/font/google";
import Header from "@/components/header";
import type { Metadata } from "next";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demoice",
  description: "国民が政策を提案し、議論するためのWebサービス",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={notoSansJP.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
