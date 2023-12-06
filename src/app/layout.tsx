import { Noto_Sans_JP } from "next/font/google";
import Header from "@/components/component/header";
import type { Metadata } from "next";
import "./globals.css";
import "material-symbols";

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
      <body
        className={`${notoSansJP.className} min-h-screen h-full text-gray-900 dark:text-gray-300 bg-gray-100 dark:bg-gray-900`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
