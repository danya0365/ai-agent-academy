import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "@/public/styles/index.css";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellUser } from "@/components/shell/nav";
import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider";
import { getSession } from "@/lib/session";
import { OAuthErrorHandler } from "@/components/oauth-error-handler";
import { Toaster } from "sonner";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const su = session?.user ?? null;
  const user: ShellUser | null = su
    ? {
        name: su.name,
        email: su.email,
        role: su.role ?? "customer",
        image: su.image ?? null,
      }
    : null;

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
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <OAuthErrorHandler />
          <Toaster richColors closeButton position="top-center" />
          <AppShell user={user}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
