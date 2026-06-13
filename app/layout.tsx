import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Agent Academy — สอนทุกอย่างเกี่ยวกับ AI",
  description:
    "คอร์สเรียน AI ตั้งแต่พื้นฐานจนถึงการเขียนซอฟต์แวร์ด้วย AI สมัครเรียนออนไลน์ได้ทันที",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${notoThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} AI Agent Academy · สอนทุกอย่างเกี่ยวกับ AI
        </footer>
      </body>
    </html>
  );
}
