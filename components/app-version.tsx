import { getAppVersion } from "@/lib/version";

/** แคปชันเลขเวอร์ชั่นท้ายเพจ — "AI Agent Academy vX.Y.Z (sha)" */
export function AppVersion({ className }: { className?: string }) {
  const { displayVersion } = getAppVersion();
  return (
    <span className={`text-xs text-muted ${className ?? ""}`}>
      AI Agent Academy {displayVersion}
    </span>
  );
}
