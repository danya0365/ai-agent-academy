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
  title: {
    template: "%s — AI Agent Academy",
    default: "AI Agent Academy — สอนทุกอย่างเกี่ยวกับ AI",
  },
  description:
    "คอร์สเรียน AI ตั้งแต่พื้นฐานจนถึงการเขียนซอฟต์แวร์ด้วย AI สมัครเรียนออนไลน์ได้ทันที",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png" }],
  },
  manifest: "/favicon/site.webmanifest",
  // ยืนยันความเป็นเจ้าของโดเมนกับ Google Search Console (สำหรับ OAuth brand verification)
  // ตั้งค่า GOOGLE_SITE_VERIFICATION = code ที่ Search Console ให้ (เว้นว่าง = ไม่ render)
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
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
<script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: "AI Agent Academy",
              description:
                "แพลตฟอร์มเรียน AI ออนไลน์ตั้งแต่พื้นฐานจนถึงการเขียนซอฟต์แวร์ — AI Agent Academy",
              provider: {
                "@type": "Organization",
                name: "AI Agent Academy",
              },
              offers: {
                "@type": "CategoryCodeSet",
                name: "AI Courses",
              },
              url: "https://ai-agent-academy.easy-ai.online",
              inLanguage: "th",
            }),
          }}
        />
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
                <div className="flex gap-3 text-xs">
                  <a href="/terms" className="font-bold text-brand-700 hover:underline">ข้อกำหนด</a>
                  <a href="/privacy" className="font-bold text-brand-700 hover:underline">นโยบายความเป็นส่วนตัว</a>
                </div>
                <AppVersion />
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
