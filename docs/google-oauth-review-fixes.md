# Google OAuth Review — Fixes Applied

## What was fixed in code

### 1. Home page missing brand name

**File:** [app/page.tsx](../app/page.tsx)

H1 changed — now shows "AI Agent Academy" as brand name above tagline "สอนทุกอย่างเกี่ยวกับ AI". Before, only tagline was visible. Badge also updated from "เรียน AI กับผู้สอนตัวจริง" → "แพลตฟอร์มเรียน AI ออนไลน์" to clarify app purpose.

### 2. Home page missing purpose explanation

**File:** [app/page.tsx](../app/page.tsx)

Subtitle now starts with "แพลตฟอร์มเรียน AI ออนไลน์" so the first sentence clearly describes what the website is. Structured data (JSON-LD) added in layout `<head>` for richer schema.

### 3. site.webmanifest — empty name filled

**File:** [public/favicon/site.webmanifest](../public/favicon/site.webmanifest)

Was `"name":"","short_name":""` → now `"name":"AI Agent Academy","short_name":"AI Agent Academy"`.

## What needs doing in Google Cloud Console

### 1. Fix OAuth consent screen app name

| Field | Current (wrong) | Correct |
|---|---|---|
| App name | `AI Agent Academy — สอนทุกอย่างเกี่ยวกับ AI` | `AI Agent Academy` |

Go to [Google Cloud Console > APIs & Services > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
→ Edit App → change **App name** to `AI Agent Academy`.

### 2. Verify domain ownership — DONE

Meta tag added at [app/layout.tsx:47](../app/layout.tsx#L47):

```html
<meta name="google-site-verification" content="AT_C5-x7nvY343kbnv-4ekWHL-HtFaSJ9jvDANud8N8" />
```

Rebuild and deploy.
