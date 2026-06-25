import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "@/public/styles/index.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider";
import { AppVersion } from "@/components/app-version";

// body face — ใช้ทุกธีม (variable font → ครบทุกน้ำหนักรวม extrabold/black)
const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  display: "swap",
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
    <html
      lang="th"
      data-theme="bold"
      className={`${notoThai.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t-2 border-border">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
              <div className="flex items-center gap-2 font-extrabold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-border bg-brand-500 text-on-brand">
                  AI
                </span>
                AI Agent Academy
              </div>
              <div className="flex flex-col items-center gap-1 sm:items-end">
                <span>© {new Date().getFullYear()} · สอนทุกอย่างเกี่ยวกับ AI</span>
                <AppVersion />
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
