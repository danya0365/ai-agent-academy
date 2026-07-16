"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { DevQuickLogin } from "@/components/dev-quick-login";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/my-courses";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn.email({ email, password });
    setLoading(false);
    if (error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-2xl font-black tracking-tight text-foreground">เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-foreground">อีเมล</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-foreground">รหัสผ่าน</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </label>

        {error && (
          <p className="rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted">หรือ</span>
        </div>
      </div>

      <button
        type="button"
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            // ใช้ API โดยตรง → ได้ url สำหรับ redirect ไป Google
            // redirect-based sign-in หลีกเลี่ยงปัญหา popup 403
            const res = await fetch(`/api/auth/sign-in/social`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: "google",
                callbackURL: next,
                disableRedirect: true,
              }),
            });
            const data = await res.json();
            if (data.url) {
              window.location.href = data.url;
            } else {
              throw new Error("no redirect URL");
            }
          } catch (e) {
            console.error("Google sign-in error:", e);
            setError("ไม่สามารถเชื่อมต่อกับ Google ได้ กรุณาลองใหม่");
            setLoading(false);
          }
        }}
        disabled={loading}
        className="btn btn-secondary flex w-full items-center justify-center gap-2"
      >
        <GoogleIcon />
        เข้าสู่ระบบด้วย Google
      </button>

      <p className="mt-4 text-center text-sm text-muted">
        ยังไม่มีบัญชี?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-bold text-brand-700 hover:underline"
        >
          สมัครสมาชิก
        </Link>
      </p>

      <DevQuickLogin next={next} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
