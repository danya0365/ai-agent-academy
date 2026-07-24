"use client";

// In-app browser patterns (userAgent markers ของ mobile WebView ยอดนิยม)
const IN_APP_PATTERNS = [
  // Facebook + Messenger
  /FBAN|FBAV|FBIOS/i,
  /Messenger/i,
  // Instagram
  /Instagram/i,
  // LINE
  /LINE/i,
  // TikTok
  /TikTok/i,
  // Twitter / X
  /Twitter/i,
  // Snapchat
  /Snapchat/i,
  // Threads
  /Threads/i,
  // WeChat
  /MicroMessenger/i,
  // generic WebView
  /wv|WebView|; wv\)/i,
];

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return IN_APP_PATTERNS.some((p) => p.test(ua));
}

/** ชื่อแอปที่ detect ได้ */
export function detectedAppName(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/FBAN|FBAV|FBIOS/i.test(ua)) return "Facebook";
  if (/Messenger/i.test(ua)) return "Messenger";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/LINE/i.test(ua)) return "LINE";
  if (/TikTok/i.test(ua)) return "TikTok";
  if (/Twitter/i.test(ua)) return "X (Twitter)";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/Threads/i.test(ua)) return "Threads";
  if (/MicroMessenger/i.test(ua)) return "WeChat";
  return null;
}
