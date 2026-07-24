// Navigation config — source of truth เดียวของ app shell
// (desktop sidebar + mobile bottom tabbar + account sheet)
// แทน link ที่เคย hardcode ซ้ำใน navbar.tsx + mobile-nav.tsx
import {
  BookMarked,
  GraduationCap,
  Lightbulb,
  MessagesSquare,
  Palette,
  ShieldCheck,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

/** ผู้ใช้เท่าที่ shell ต้องใช้ — plain object (ส่งข้าม server → client component ได้) */
export type ShellUser = {
  name: string;
  email: string;
  role: string;
  image: string | null;
};

export type NavVisibility = "always" | "authed" | "admin";
export type NavGroupKey = "content" | "account";

export interface NavItem {
  href: string;
  label: string;
  /** ชื่อสั้นสำหรับแท็บล่าง mobile (ที่แคบ) — ไม่ใส่ = ใช้ label */
  short?: string;
  icon: LucideIcon;
  visibility: NavVisibility;
  /** อยู่ในแท็บล่าง mobile (เนื้อหาหลัก 4 ตัว) — ที่เหลือไปโผล่ใน account sheet */
  tabbar?: boolean;
  group: NavGroupKey;
  match: (p: string) => boolean;
}

const startsWith = (base: string) => (p: string) =>
  p === base || p.startsWith(`${base}/`);

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "คอร์สทั้งหมด",
    short: "หน้าหลัก",
    icon: GraduationCap,
    visibility: "always",
    tabbar: true,
    group: "content",
    match: (p) => p === "/",
  },
  {
    href: "/tips",
    label: "ไขความลับ",
    short: "ความลับ",
    icon: Lightbulb,
    visibility: "always",
    tabbar: true,
    group: "content",
    match: startsWith("/tips"),
  },
  {
    href: "/shop",
    label: "ของที่แนะนำ",
    short: "แนะนำ",
    icon: ShoppingBag,
    visibility: "always",
    tabbar: true,
    group: "content",
    match: startsWith("/shop"),
  },
  {
    href: "/community",
    label: "ถาม-ตอบ",
    icon: MessagesSquare,
    visibility: "always",
    tabbar: true,
    group: "content",
    match: startsWith("/community"),
  },
  {
    href: "/design-system",
    label: "Design System",
    short: "Design",
    icon: Palette,
    visibility: "always",
    group: "content",
    match: startsWith("/design-system"),
  },
  {
    href: "/my-courses",
    label: "คอร์สของฉัน",
    icon: BookMarked,
    visibility: "authed",
    group: "account",
    match: startsWith("/my-courses"),
  },
  {
    href: "/admin",
    label: "แอดมิน",
    icon: ShieldCheck,
    visibility: "admin",
    group: "account",
    match: startsWith("/admin"),
  },
];

/** ผู้ใช้คนนี้เห็น item นี้ไหม */
export function canSee(item: NavItem, user: ShellUser | null): boolean {
  if (item.visibility === "admin") return user?.role === "admin";
  if (item.visibility === "authed") return !!user;
  return true;
}

export const NAV_GROUPS: { key: NavGroupKey; title: string }[] = [
  { key: "content", title: "เนื้อหา" },
  { key: "account", title: "บัญชี" },
];

/** แท็บล่าง mobile (เนื้อหาหลัก 4 ตัว) */
export const tabbarItems: NavItem[] = NAV_ITEMS.filter((i) => i.tabbar);

/** เมนูที่เหลือ (ไม่อยู่ในแท็บล่าง) → โผล่ใน account sheet + sidebar กลุ่ม "บัญชี" */
export const moreItems: NavItem[] = NAV_ITEMS.filter((i) => !i.tabbar);
