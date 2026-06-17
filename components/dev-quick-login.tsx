"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { getTestUsers, type TestUser } from "@/actions/dev-auth";
import { cn } from "@/lib/cn";

/**
 * Quick-login สำหรับทดสอบ — แสดงรายชื่อบัญชี seed คลิกแล้วเข้าได้เลย
 * แสดงเฉพาะตอน dev (getTestUsers คืน [] ใน production → component ไม่ render อะไร)
 */
export function DevQuickLogin({ next }: { next: string }) {
  const router = useRouter();
  const [users, setUsers] = useState<TestUser[]>([]);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTestUsers()
      .then(setUsers)
      .catch(() => {});
  }, []);

  if (users.length === 0) return null;

  async function quickLogin(u: TestUser) {
    setError(null);
    setLoadingEmail(u.email);
    const { error } = await signIn.email({ email: u.email, password: u.password });
    if (error) {
      setLoadingEmail(null);
      setError(`เข้าสู่ระบบเป็น ${u.email} ไม่สำเร็จ`);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-muted-surface p-4">
      <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
        <FlaskConical className="size-4" />
        เข้าสู่ระบบด่วน (สำหรับทดสอบ)
      </p>
      <p className="mb-3 text-xs text-muted">แสดงเฉพาะตอน dev — ไม่แสดงใน production</p>

      {error && (
        <p className="mb-2 rounded-lg border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        {users.map((u) => (
          <button
            key={u.email}
            type="button"
            onClick={() => quickLogin(u)}
            disabled={loadingEmail !== null}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-xl border-2 border-border bg-card px-3 py-2 text-left text-sm transition hover:bg-muted-surface",
              loadingEmail !== null && "opacity-50",
            )}
          >
            <span className="min-w-0 truncate">
              <span className="font-bold text-foreground">{u.name}</span>{" "}
              <span className="text-muted">· {u.email}</span>
            </span>
            <span
              className={cn(
                "badge shrink-0",
                u.role === "admin"
                  ? "bg-brand-500 text-on-brand"
                  : "bg-muted-surface text-muted",
              )}
            >
              {loadingEmail === u.email ? "..." : u.role}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
