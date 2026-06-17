"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { getTestUsers, type TestUser } from "@/actions/dev-auth";

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
    <div className="mt-8 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-800">🧪 เข้าสู่ระบบด่วน (สำหรับทดสอบ)</p>
      <p className="mb-3 text-xs text-amber-700">แสดงเฉพาะตอน dev — ไม่แสดงใน production</p>

      {error && (
        <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="space-y-1.5">
        {users.map((u) => (
          <button
            key={u.email}
            type="button"
            onClick={() => quickLogin(u)}
            disabled={loadingEmail !== null}
            className="flex w-full items-center justify-between gap-3 rounded-md border border-amber-200 bg-white px-3 py-2 text-left text-sm hover:bg-amber-100 disabled:opacity-50"
          >
            <span className="min-w-0 truncate">
              <span className="font-medium text-slate-900">{u.name}</span>{" "}
              <span className="text-slate-500">· {u.email}</span>
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                u.role === "admin"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {loadingEmail === u.email ? "..." : u.role}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
