/**
 * Static course catalog — single source of truth
 * No DB dependency · deploy-to-update
 *
 * Architecture:
 * - 6 broad courses, each with 20-30+ stacks (project/skill hybrid)
 * - Student books 2-hour sessions, picks which stack to learn
 * - Can repeat endlessly until they've covered all stacks
 */

/* ──────────── Shared types ──────────── */

export type Stack = {
  title: string;
  /** อธิบายสั้นๆ ว่า stack นี้ทำอะไร, e.g. "สร้าง landing page จาก prompt" */
  desc: string;
};

export type CurriculumItem = { title: string; desc?: string };
export type FaqItem = { q: string; a: string };
export type Instructor = { name: string; bio: string; avatar?: string | null };

export type Course = {
  slug: string;
  title: string;
  /** 1-line hook แสดงใต้ title */
  subtitle: string;
  /** คำอธิบายยาว (แสดงในหน้า detail) */
  description: string;
  type: "live";
  price: number;
  sessionDurationMin: number; // 120 — 2 ชม. ต่อ session
  isPublished: boolean;
  /** หัวข้อย่อยให้เลือกเรียน 2 ชม. */
  stacks: Stack[];

  /* ── ข้อมูลเนื้อหาหน้า course detail (merged from old course-content.ts) ── */
  level: string;
  highlights: string[];
  outcomes: string[];
  curriculum: CurriculumItem[];
  forWho: string[];
  includes: string[];
  faq: FaqItem[];
  instructor: Instructor;
};

/**
 * For backward compat with pages/components that consumed course-content.ts
 * — all Course fields are already filled, but compat types use optional markers.
 */
export type ResolvedCourseContent = {
  level?: string;
  highlights?: string[];
  outcomes?: string[];
  curriculum?: CurriculumItem[];
  forWho?: string[];
  includes: string[];
  faq: FaqItem[];
  instructor: Instructor;
};

/** getCourseContent — compat wrapper; all our courses have every field. */
export function getCourseContent(slug: string): ResolvedCourseContent {
  const c = COURSES.find((c) => c.slug === slug);
  if (!c) {
    return {
      includes: GENERIC_INCLUDES,
      faq: GENERIC_FAQ,
      instructor: GENERIC_INSTRUCTOR,
    };
  }
  return {
    level: c.level,
    highlights: c.highlights,
    outcomes: c.outcomes,
    curriculum: c.curriculum,
    forWho: c.forWho,
    includes: c.includes,
    faq: c.faq,
    instructor: c.instructor,
  };
}

/* ──────────── Generic shared values ──────────── */

const GENERIC_INCLUDES = [
  "เข้าถึงเนื้อหาและสไลด์ประกอบทั้งหมด",
  "เวิร์กช็อปลงมือทำจริงระหว่างเรียน",
  "ถาม-ตอบกับผู้สอนในคอมมูนิตี้",
  "อัปเดตเนื้อหาเมื่อเครื่องมือหรือแพตเกจเปลี่ยน",
];

const GENERIC_INSTRUCTOR: Instructor = {
  name: "ทีมผู้สอน AI Agent Academy",
  bio: "ผู้สอนที่ใช้ AI ทำงานจริงทุกวัน เน้นลงมือทำมากกว่าท่องทฤษฎี พาคุณไปใช้งานได้จริงตั้งแต่วันแรก",
  avatar: null,
};

const GENERIC_FAQ: FaqItem[] = [
  { q: "ต้องมีพื้นฐานมาก่อนไหม", a: "ไม่จำเป็น คอร์สออกแบบให้เริ่มจากศูนย์ได้ ถ้ามีพื้นฐานอยู่แล้วก็จะยิ่งต่อยอดได้เร็วขึ้น แค่ใช้ AI เป็นผู้ช่วย ทุกอย่างผ่าน prompt" },
  { q: "แต่ละ stack ใช้เวลาเรียนเท่าไหร่", a: "2 ชม. ต่อ 1 stack — เลือกเรียนหัวข้อที่อยากทำในวันนั้น เลือกมาจองแล้วลงมือทำเลย" },
  { q: "เรียนครั้งเดียวจบทั้งคอร์สไหม", a: "แล้วแต่คุณ แต่ละ stack เป็นโปรเจกต์/ทักษะอิสระ ลูกค้าบางคนเรียนครั้งเดียวเพื่อทำ workshop จบ บางคนกลับมาเรียนหลายครั้งจนครบทุก stack" },
  { q: "ชำระเงินอย่างไร", a: "โอนเงินแล้วแนบสลิปในระบบ เราตรวจสอบและยืนยันที่นั่งให้อัตโนมัติ" },
  { q: "ถ้าติดปัญหาระหว่างเรียนถามได้ไหม", a: "ได้ ถามผู้สอนและเพื่อนร่วมคอร์สได้ในคอมมูนิตี้ของเรา" },
];

/* ──────────── 6 courses ──────────── */

export const COURSES: Course[] = [
  /* ─── 1. build-web-with-ai ─── */
  {
    slug: "build-web-with-ai",
    title: "สร้างเว็บด้วย AI",
    subtitle: "ตั้งแต่ Landing page ธรรมดา จนถึง Full-stack Application",
    description:
      "เปลี่ยน prompt ให้กลายเป็นเว็บจริง ใช้ AI เป็นผู้ช่วยตั้งแต่สร้าง component ไปจนถึง deploy\n" +
      "ไม่ต้องเขียน HTML/CSS เองทุกบรรทัด แค่บอก AI ว่าต้องการอะไร แล้วปรับแต่ง—เร็วขึ้น 10 เท่า\n" +
      "30 สแต็กครอบคลุมทั้ง frontend, backend, database, deployment และ testing",
    type: "live",
    price: 1290,
    sessionDurationMin: 120,
    isPublished: true,
    level: "ผู้เริ่มต้น-กลาง",
    highlights: ["ใช้ AI สร้างตั้งแต่ zero → deploy", "30 โปรเจกต์/ทักษะให้เลือก", "ไม่ต้องมีพื้นฐานมาก่อน"],
    outcomes: [
      "สร้างเว็บไซต์ทุกประเภทด้วย AI (Landing page, E-commerce, Dashboard, Blog, ฯลฯ)",
      "ใช้ Cursor / Claude Code / Copilot เขียนโค้ด frontend และ backend",
      "ออกแบบและเชื่อมต่อฐานข้อมูลผ่าน prompt",
      "deploy เว็บขึ้น Vercel / Netlify / Cloud Run",
      "เพิ่มฟีเจอร์ซับซ้อนได้ เช่น Auth, Payment, Chat, Search",
    ],
    curriculum: [
      { title: "ปูพื้นฐาน — สร้างเว็บด้วย AI ครั้งแรก", desc: "ทำความรู้จักเครื่องมือ วิธี prompt ที่ได้ผล ลงมือสร้าง Landing page ภายใน session แรก" },
      { title: "Frontend: สร้าง UI ทุกประเภท", desc: "Landing, E-commerce, Blog, Dashboard, Portfolio, Admin panel — สร้าง component ได้ตาม需求" },
      { title: "Backend & Database", desc: "REST API, Auth, Database, File upload, Search, CRUD — ให้ AI ออกแบบ schema และ endpoint" },
      { title: "Real-time & Advanced", desc: "WebSocket, Chat, Notifications, i18n, PWA, Animation" },
      { title: "Deploy & Production", desc: "SEO, Analytics, Performance, Security, Testing, Deployment" },
    ],
    forWho: [
      "คนที่อยากสร้างเว็บแต่ไม่อยากนั่งเขียน HTML/CSS ทีละบรรทัด",
      "นักออกแบบที่อยากทำ prototype เป็นเว็บได้เอง",
      "ฟรีแลนซ์ที่อยากรับงานทำเว็บได้เร็วขึ้น 10 เท่า",
      "คนที่เขียนเว็บเป็นแล้วแต่อยากเพิ่ม productivity ด้วย AI",
    ],
    includes: GENERIC_INCLUDES,
    faq: GENERIC_FAQ,
    instructor: GENERIC_INSTRUCTOR,
    stacks: [
      { title: "Landing Page", desc: "สร้างหน้าแรกจาก prompt ปรับดีไซน์ layout สี responsive" },
      { title: "Portfolio", desc: "เว็บพอร์ตโฟลิโอส่วนตัว แสดงผลงาน ประวัติ ติดต่อ" },
      { title: "Blog", desc: "เว็บบล็อกพร้อมระบบโพสต์ content management" },
      { title: "E-commerce", desc: "ร้านค้าออนไลน์ ตะกร้าสินค้า ระบบสั่งซื้อ" },
      { title: "Dashboard", desc: "หน้าแสดงข้อมูล สถิติ กราฟ ตาราง" },
      { title: "Admin Panel", desc: "ระบบจัดการหลังบ้าน CRUD ผู้ใช้ สินค้า เนื้อหา" },
      { title: "Authentication", desc: "ระบบสมัครสมาชิก Login/Logout OAuth" },
      { title: "Full CRUD", desc: "สร้างระบบเพิ่ม/ลบ/แก้ไขข้อมูลครบวงจร" },
      { title: "REST API", desc: "สร้าง API endpoint ด้วย AI พร้อม validation" },
      { title: "Database Schema", desc: "ให้ AI ออกแบบ schema Tables Relations Indexes" },
      { title: "Search System", desc: "ค้นหาข้อความ full-text search filter sort" },
      { title: "i18n Multi-language", desc: "รองรับหลายภาษา locale switching" },
      { title: "Complex Form", desc: "ฟอร์มหลายขั้นตอน validation dynamic fields" },
      { title: "File Upload", desc: "อัปโหลดรูป/ไฟล์ preview resize" },
      { title: "Payment Gateway", desc: "PromptPay / Stripe integration" },
      { title: "Charts & Graphs", desc: "แสดงข้อมูลด้วย Chart / Recharts D3" },
      { title: "Maps & Location", desc: "แผนที่ Google Maps / Mapbox" },
      { title: "Calendar Booking", desc: "ระบบจองเวลา ปฏิทิน" },
      { title: "Notifications", desc: "Push notification / Email alert" },
      { title: "Real-time Chat", desc: "แชทสด WebSocket real-time" },
      { title: "SEO Optimization", desc: "meta tags Open Graph sitemap" },
      { title: "Analytics", desc: "ติดตามผู้ใช้ Google Analytics custom event" },
      { title: "WebSocket", desc: "real-time connection bidirectional" },
      { title: "PWA", desc: "Progressive Web App offline support" },
      { title: "Animation", desc: "CSS animation / Framer Motion transition" },
      { title: "Testing", desc: "Unit test Integration test E2E" },
      { title: "Performance", desc: "optimize bundle lazy load caching" },
      { title: "Security", desc: "XSS CSRF SQL injection input sanitize" },
      { title: "Deployment", desc: "deploy Vercel / Netlify / Railway" },
      { title: "SSR / SSG", desc: "Server-side rendering / Static generation" },
    ],
  },

  /* ─── 2. build-2d-game-with-ai ─── */
  {
    slug: "build-2d-game-with-ai",
    title: "สร้างเกม 2D ด้วย AI",
    subtitle: "Platformer, Shooter, Puzzle, RPG — ใช้ AI เขียนโค้ดเกมให้คุณ",
    description:
      "อยากสร้างเกมแต่เขียนโค้ดไม่เป็น? แค่บอก AI ว่าอยากได้เกมแบบไหน AI จะสร้าง canvas,\n" +
      "sprite, physics, scoring และ sound effect ให้คุณ ปรับแต่งต่อได้ทันที\n" +
      "25 สแต็ก จากง่าย (Snake, Pong) ไปจนถึงซับซ้อน (RPG, Tower Defense)",
    type: "live",
    price: 990,
    sessionDurationMin: 120,
    isPublished: true,
    level: "กลาง",
    highlights: ["จากไอเดียเป็นเกมเล่นได้ใน 2 ชม.", "25 แนวเกมให้เลือก", "AI จัดการโค้ดให้ เราแค่ปรับ"],
    outcomes: [
      "สร้างเกม 2D หลากหลายแนวด้วย AI และ HTML Canvas",
      "เข้าใจโครงสร้างเกม: Game loop, Collision, Physics, Animation",
      "เพิ่ม Sprite, Sound FX, Particle Effects",
      "ทำระบบเซฟเกม, Leaderboard และ UI/UX ของเกม",
      "export เกมให้คนอื่นเล่นผ่านเว็บได้",
    ],
    curriculum: [
      { title: "เริ่มต้น — สร้างเกมเก่าแก่ 3 เกม", desc: "Pong → Snake → Breakout — 3 เกมคลาสสิกภายใน 1 ชม. เพื่อเข้าใจ game loop" },
      { title: "Platformer & Action", desc: "Mario-style platformer, Shooter, Infinite Runner, Tower Defense" },
      { title: "Puzzle & Strategy", desc: "Match-3, Card Game, Board Game, Puzzle" },
      { title: "Racing & Sports", desc: "Top-down racing, Rhythm game, Pong" },
      { title: "Graphics & Polish", desc: "Sprite animation, Particle, Sound, UI/HUD, Save/Load" },
    ],
    forWho: [
      "คนที่อยากสร้างเกมแต่เขียนโค้ดเกมไม่เป็น",
      "นักออกแบบเกมที่อยากทำ prototype เร็วๆ",
      "นักเรียน/นักศึกษาที่อยากเริ่มเรียนรู้การทำเกม",
      "คนที่มีไอเดียเกมแล้วอยากลองทำให้เป็นจริง",
    ],
    includes: GENERIC_INCLUDES,
    faq: GENERIC_FAQ,
    instructor: GENERIC_INSTRUCTOR,
    stacks: [
      { title: "Platformer (Mario-style)", desc: "ตัวละครกระโดด เก็บเหรียญ ผ่านด่าน" },
      { title: "Shooter (Space Invaders)", desc: "ยิงศัตรู ป้องกันฐาน" },
      { title: "Puzzle", desc: "เกมปริศนาตรรกะ จับคู่ เรียงชิ้นส่วน" },
      { title: "RPG Basic", desc: "ตัวละครเดินพูดคุย ต่อสู้เทิร์นเบส" },
      { title: "Card Game", desc: "Solitaire / Poker / เกมไพ่" },
      { title: "Board Game", desc: "Chess / Checkers / เกมกระดาน" },
      { title: "Rhythm Game", desc: "กดตามจังหวะเพลง" },
      { title: "Racing (Top-down)", desc: "รถแข่งมุมมองจากด้านบน" },
      { title: "Match-3", desc: "Candy Crush-style จับคู่ 3 ชิ้น" },
      { title: "Tower Defense", desc: "วางหอคอยป้องกันข้าศึก" },
      { title: "Infinite Runner", desc: "Dino Run-style วิ่งหนีอุปสรรค" },
      { title: "Snake", desc: "เกมงูคลาสสิก" },
      { title: "Pong", desc: "ปิงปอง 2 ผู้เล่น" },
      { title: "Breakout", desc: "ตีลูกบอลทำลายอิฐ" },
      { title: "Physics Sandbox", desc: "จำลองฟิสิกส์ วัตถุตก ชน สปริง" },
      { title: "Tile Map Editor", desc: "สร้างแผนที่จาก tiles Grid-based" },
      { title: "Sprite Animation", desc: "เดิน กระโดด ตาย — อนิเมชันตัวละคร" },
      { title: "Particle Effects", desc: "ระเบิด ไฟ ควัน ดาว" },
      { title: "Sound Effects", desc: "เพิ่มเสียง shoot coin explosion" },
      { title: "Save / Load", desc: "เซฟความคืบหน้า LocalStorage" },
      { title: "Leaderboard", desc: "ตารางคะแนนสูงสุด" },
      { title: "Cutscene", desc: "ฉากเล่าเรื่องระหว่างด่าน" },
      { title: "Level Editor", desc: "เครื่องมือให้ผู้เล่นสร้างด่านเอง" },
      { title: "Touch Controls", desc: "ปุ่มสัมผัสสำหรับมือถือ" },
      { title: "UI / HUD", desc: "คะแนน ชีวิต กระสุน เมนู" },
    ],
  },

  /* ─── 3. build-3d-game-with-ai ─── */
  {
    slug: "build-3d-game-with-ai",
    title: "สร้างเกม 3D ด้วย AI",
    subtitle: "Three.js, Babylon.js — โลก 3D, ตัวละคร, เกม FPS",
    description:
      "เปลี่ยนจาก 2D สู่ 3D ให้ AI ช่วยคุณสร้าง environment 3D, ตัวละคร, terrain,\n" +
      "แสงเงา และฟิสิกส์ สร้าง First-person, Third-person, Racing 3D และ Open world\n" +
      "ใช้ Three.js / React Three Fiber (R3F) คู่กับ AI coding assistant",
    type: "live",
    price: 1490,
    sessionDurationMin: 120,
    isPublished: true,
    level: "กลาง-สูง",
    highlights: ["สร้างโลก 3D จาก prompt", "25 สแต็ก 3D ครบทุกมิติ", "ใช้ Three.js / R3F / Babylon"],
    outcomes: [
      "สร้าง scene 3D ด้วย Three.js / React Three Fiber",
      "สร้างตัวละคร Terrain ฟิสิกส์ และการชนใน 3D",
      "จัดแสง เงา หมอก Skybox และ Water effect",
      "สร้างเกม 3D หลายแนว: FPS, Racing, Open World",
      "เพิ่ม Shader, Post-processing, VR/XR",
    ],
    curriculum: [
      { title: "ปูพื้นฐาน 3D", desc: "Scene, Camera, Renderer — สร้าง cube หมุนได้ภายใน 10 บรรทัด" },
      { title: "Environment & Terrain", desc: "Terrain, Skybox, Fog, Water, Lighting, Shadows" },
      { title: "ตัวละคร & ฟิสิกส์", desc: "First/Third person, Animation, Physics, Collision" },
      { title: "เกม 3D ตัวอย่าง", desc: "FPS Shooter, Racing 3D, Open World" },
      { title: "Polish & Production", desc: "Shaders, Post-processing, VR/XR, Mini-map, Sound" },
    ],
    forWho: [
      "คนที่เคยเล่นเกม 3D แล้วอยากสร้างเองบ้าง",
      "นักพัฒนาเว็บที่อยากขยับมาทำ 3D",
      "คนที่เรียน 2D game แล้วอยากเพิ่มมิติ",
      "设计师ที่อยากทำ 3D interactive experience",
    ],
    includes: GENERIC_INCLUDES,
    faq: GENERIC_FAQ,
    instructor: GENERIC_INSTRUCTOR,
    stacks: [
      { title: "First Person Walk", desc: "เดินสำรวจ scene 3D มุมมองบุคคลที่หนึ่ง" },
      { title: "Third Person Character", desc: "ตัวละครมุมมองเหนือบ่า ขยับ camera" },
      { title: "Terrain Generation", desc: "สร้างภูมิประเทศ ภูเขา หุบเขา พื้นผิว" },
      { title: "Lighting System", desc: "Ambient, Directional, Point, Spot light" },
      { title: "Shadows", desc: "เงาจากแสง เงาตกกระทบ Soft shadow" },
      { title: "Physics Engine", desc: "Rapier / Cannon.js ฟิสิกส์ 3D" },
      { title: "Collision Detection", desc: "ตรวจจับการชนใน 3D" },
      { title: "3D Animation", desc: "เดิน วิ่ง กระโดด — Animation blending" },
      { title: "FPS Shooter", desc: "ยิงปืน เล็งเป้า นับคะแนน" },
      { title: "Racing 3D", desc: "รถแข่ง 3D ติดตามเส้นทาง" },
      { title: "Open World", desc: "โลกเปิดกว้าง load/unload พื้นที่" },
      { title: "Skybox", desc: "ท้องฟ้า 360 องศา" },
      { title: "Fog & Atmosphere", desc: "หมอก บรรยากาศ ระยะการมองเห็น" },
      { title: "Water Effect", desc: "น้ำ ระลอกคลื่น เงาสะท้อน" },
      { title: "Shader Programming", desc: "เขียน shader ปรับแต่งพื้นผิว" },
      { title: "Post-processing", desc: "Bloom, DOF, Glow, Color grading" },
      { title: "VR / XR", desc: "WebXR ความเป็นจริงเสมือน" },
      { title: "Mini-map", desc: "แผนที่ย่อมุมบนจอ" },
      { title: "Inventory System", desc: "เก็บไอเทม จัดการช่อง物品" },
      { title: "Dialogue System", desc: "พูดคุย NPC แสดงข้อความเลือกตอบ" },
      { title: "NPC AI", desc: "ศัตรูเดิน巡逻 โจมตีอัตโนมัติ" },
      { title: "Quest System", desc: "รับเควส ติดตาม ทำเควส" },
      { title: "3D Cutscene", desc: "ฉากคัทซีน 3D Cinematic camera" },
      { title: "3D Sound", desc: "เสียงรอบทิศทาง Positional audio" },
      { title: "Multi-scene", desc: "โหลด Scene ข้ามด่าน" },
    ],
  },

  /* ─── 4. build-multiplayer-game-with-ai ─── */
  {
    slug: "build-multiplayer-game-with-ai",
    title: "สร้างเกม Real-time ด้วย AI",
    subtitle: "WebSocket, Sync, Lobby — เกม多人ที่เล่นพร้อมกัน",
    description:
      "ยกระดับเกมของคุณสู่ Multiplayer! ใช้ AI สร้างระบบ WebSocket, synchronize ผู้เล่น,\n" +
      "จัดการห้อง และจับคู่แข่งขัน\n" +
      "ทั้ง Turn-based และ Real-time combat รองรับ Spectator, Reconnect, Anti-cheat",
    type: "live",
    price: 1490,
    sessionDurationMin: 120,
    isPublished: true,
    level: "สูง",
    highlights: ["เกม多人จาก AI ใน 2 ชม.", "WebSocket + State Sync", "ทั้ง Turn-based และ Real-time"],
    outcomes: [
      "สร้างระบบ multiplayer ด้วย WebSocket และ AI",
      "ซิงค์ตำแหน่ง สถานะ และ action ระหว่างผู้เล่น",
      "จัดการ Room, Lobby, Matchmaking",
      "รับมือกับ Latency และ Lag Compensation",
      "เพิ่ม Chat, Party, Leaderboard และ Spectator mode",
    ],
    curriculum: [
      { title: "WebSocket 101", desc: "ตั้งค่า WebSocket server/client, send/receive message, broadcast" },
      { title: "Room & Lobby", desc: "สร้างห้อง, join/leave, รายชื่อผู้เล่น" },
      { title: "State Synchronization", desc: "ซิงค์ตำแหน่ง กระสุน คะแนน — authoritative server" },
      { title: "Real-time Combat", desc: "ยิงปืน หลบ กระสุน — synced แบบ real-time" },
      { title: "Production", desc: "Lag compensation, Reconnect, Anti-cheat, Spectator" },
    ],
    forWho: [
      "คนที่ทำเกม 2D/3D เป็นแล้วอยากเพิ่ม多人",
      "นักพัฒนาที่อยากลองทำ real-time game",
      "คนที่อยากสร้างเกมแข่งกับเพื่อนออนไลน์",
    ],
    includes: GENERIC_INCLUDES,
    faq: GENERIC_FAQ,
    instructor: GENERIC_INSTRUCTOR,
    stacks: [
      { title: "WebSocket Setup", desc: "ตั้งค่า WS server/client handshake" },
      { title: "Room Management", desc: "สร้างห้อง join leave รายชื่อ" },
      { title: "Position Sync", desc: "ซิงค์ตำแหน่งผู้เล่น实时" },
      { title: "State Sync", desc: "ซิงค์สถานะเกมคะแนนเวลา" },
      { title: "Latency Handling", desc: "วัด ping แสดง delay" },
      { title: "Lag Compensation", desc: "ชดเชยความหน่วงของผู้เล่น" },
      { title: "Lobby System", desc: "หน้า lobby รอผู้เล่นพร้อม" },
      { title: "In-game Chat", desc: "แชทระหว่างเล่น" },
      { title: "Matchmaking", desc: "จับคู่玩家ระดับเดียวกัน" },
      { title: "Turn-based Game", desc: "ผลัดกันเล่น Sync turn" },
      { title: "Real-time Combat", desc: "ยิงสู้实时 sync position + action" },
      { title: "Spectator Mode", desc: "ดูเกมคนอื่นได้" },
      { title: "Reconnect", desc: "หลุดแล้วกลับมาเล่นต่อ" },
      { title: "Auth System", desc: "Login ก่อนเล่น" },
      { title: "Save to DB", desc: "เซฟสถิติ match history" },
      { title: "Cloud Save", desc: "เซฟ progress ข้าม session" },
      { title: "Leaderboard", desc: "อันดับผู้เล่น ranking" },
      { title: "Party System", desc: "ชวนเพื่อนเข้าปาร์ตี้" },
      { title: "Emotes", desc: "แสดง表情 dances" },
      { title: "Anti-cheat", desc: "ตรวจสอบ cheating" },
      { title: "Match History", desc: "ประวัติการแข่ง replay" },
      { title: "Voice Chat", desc: "คุยเสียงในเกม WebRTC" },
    ],
  },

  /* ─── 5. build-saas-with-ai ─── */
  {
    slug: "build-saas-with-ai",
    title: "สร้างระบบ SaaS ด้วย AI",
    subtitle: "Auth, Subscription, Team, Billing — สร้างธุรกิจซอฟต์แวร์ของคุณ",
    description:
      "จากไอเดียสู่ SaaS จริง! ใช้ AI สร้างระบบ backend ครบทุกฟังก์ชันที่ SaaS ต้องมี:\n" +
      "Authentication, Subscription (Stripe), Team/Role/Permission, Billing, Dashboard\n" +
      "API Key, Webhook, Rate Limit, Multi-tenant DB, Analytics — พร้อมขาย",
    type: "live",
    price: 1490,
    sessionDurationMin: 120,
    isPublished: true,
    level: "กลาง-สูง",
    highlights: ["สร้าง SaaS ที่พร้อมขาย", "28 สแต็ก ครบทุกฟังก์ชัน", "Stripe + Multi-tenant"],
    outcomes: [
      "สร้างระบบ Authentication และ Authorization ครบวงจร",
      "ต่อ Stripe Subscription + Webhook + Billing",
      "ออกแบบ Multi-tenant database และ Role/Permission",
      "สร้าง Dashboard Analytics Audit Log API Key",
      "เพิ่ม 2FA SSO Invite Flow Custom Domain — พร้อม scale",
    ],
    curriculum: [
      { title: "Foundation — Auth & Users", desc: "Signup, Login, OAuth, Session, Profile" },
      { title: "Payment & Subscription", desc: "Stripe integration, Subscription tiers, Webhook, Invoice" },
      { title: "Organization & Team", desc: "Team/Org structure, Invite flow, Role/Permission" },
      { title: "Infrastructure", desc: "Multi-tenant DB, API Key, Rate Limit, Audit Log, Webhook" },
      { title: "Growth & Production", desc: "Landing/Pricing page, Waitlist, Referral, Analytics, Custom Domain" },
    ],
    forWho: [
      "คนที่อยากสร้าง SaaS ของตัวเอง",
      "ฟรีแลนซ์ที่อยากเปลี่ยนจากรับเหมาเป็นขายซอฟต์แวร์",
      "นักพัฒนาที่มีไอเดีย SaaS แต่อยากเร่ง speed to market",
      "สตาร์ทอัพที่อยาก prototype product เร็วขึ้น",
    ],
    includes: GENERIC_INCLUDES,
    faq: GENERIC_FAQ,
    instructor: GENERIC_INSTRUCTOR,
    stacks: [
      { title: "Auth & Signup", desc: "Email/password OAuth Google" },
      { title: "Subscription (Stripe)", desc: "สร้าง subscription plan จัดการ billing" },
      { title: "Team / Org", desc: "สร้างองค์กร เพิ่มสมาชิก" },
      { title: "Role / Permission", desc: "admin member viewer custom role" },
      { title: "Billing", desc: "ใบแจ้งหนี้ ใบกำกับภาษี" },
      { title: "Dashboard", desc: "ภาพรวมผู้ใช้ รายได้ สถิติ" },
      { title: "Invite Flow", desc: "ส่งอีเมลเชิญ Accept/reject" },
      { title: "Webhook Handler", desc: "รับ event Stripe/SendGrid" },
      { title: "Email Service", desc: "SendGrid / Resend ส่งอีเมล" },
      { title: "API Key", desc: "สร้าง revoke จัดการ key" },
      { title: "Rate Limit", desc: "จำกัด request ต่อ key/IP" },
      { title: "Usage Analytics", desc: "track usage แสดง graph" },
      { title: "Audit Log", desc: "บันทึกทุก action ผู้ใช้" },
      { title: "Multi-tenant DB", desc: "แยก data ตาม org row-level isolation" },
      { title: "Onboarding Flow", desc: "引导ผู้ใช้แรกเข้า" },
      { title: "SSO Login", desc: "Single Sign-On สำหรับองค์กร" },
      { title: "File Upload", desc: "อัปโหลดรูป เอกสาร ไป S3" },
      { title: "Landing Page", desc: "หน้าโปรโมต SaaS" },
      { title: "Pricing Page", desc: "หน้าวางแผนราคา" },
      { title: "Waitlist", desc: "ให้ผู้ใช้ลงชื่อรอเปิด" },
      { title: "Referral System", desc: "ชวนเพื่อน ได้ส่วนลด" },
      { title: "Coupon / Discount", desc: "สร้างโค้ดส่วนลด" },
      { title: "Invoice", desc: "ใบกำกับภาษีอิเล็กทรอนิกส์" },
      { title: "Data Export", desc: "ส่งออกข้อมูล CSV/JSON" },
      { title: "2FA / MFA", desc: "สองชั้นยืนยันตัวตน" },
      { title: "Custom Domain", desc: "ผู้ใช้ใช้ domain ตัวเองได้" },
      { title: "Status Page", desc: "แจ้ง uptime/downtime" },
      { title: "Changelog", desc: "บันทึก version ใหม่" },
    ],
  },

  /* ─── 6. build-mobile-app-with-ai ─── */
  {
    slug: "build-mobile-app-with-ai",
    title: "สร้างแอปมือถือด้วย AI",
    subtitle: "React Native, Expo — สร้างแอป iOS/Android ด้วย prompt",
    description:
      "สร้างแอปมือถือข้ามแพลตฟอร์มด้วย AI และ React Native (Expo)\n" +
      "ไม่ต้องเขียน Swift หรือ Kotlin — prompt เดียวได้หน้าแอป พร้อม Navigation\n" +
      "Camera, GPS, Push Notification, Offline, Biometric, Payment — สร้างพร้อม Deploy ขึ้น Store",
    type: "live",
    price: 990,
    sessionDurationMin: 120,
    isPublished: true,
    level: "กลาง",
    highlights: ["แอป iOS/Android จาก promptเดียว", "24 สแต็กมือถือครบ", "Deploy ขึ้น Store ได้จริง"],
    outcomes: [
      "สร้างแอปมือถือข้ามแพลตฟอร์มด้วย React Native + Expo",
      "ใช้ Navigation, Form, Camera, GPS, Push Notification",
      "ทำงานแบบ Offline, Dark Mode, i18n",
      "เพิ่ม biometric, payment, social login",
      "Deploy ขึ้น App Store และ Google Play",
    ],
    curriculum: [
      { title: "เริ่มต้น — แอปแรกของคุณ", desc: "Setup Expo, สร้างหน้าด้วย prompt, Navigation (bottom tab + stack)" },
      { title: "ฟีเจอร์มือถือ", desc: "Camera, GPS, Push, Biometric, File picker, Background task" },
      { title: "UI & UX", desc: "Dark mode, i18n, Animation, Form" },
      { title: "Data & Network", desc: "API integration, Offline, WebSocket, State management" },
      { title: "Deploy", desc: "App Store / Google Play, Deep link, OTA update" },
    ],
    forWho: [
      "คนที่มีไอเดียแอปแล้วอยากสร้างเอง",
      "นักพัฒนาเว็บที่อยากขยายสู่มือถือ",
      "เจ้าของธุรกิจที่อยากทำแอปให้ลูกค้า",
      "ฟรีแลนซ์ที่อยากรับงานทำแอป",
    ],
    includes: GENERIC_INCLUDES,
    faq: GENERIC_FAQ,
    instructor: GENERIC_INSTRUCTOR,
    stacks: [
      { title: "Expo Setup", desc: "สร้างโปรเจกต์ Expo dev environment" },
      { title: "Navigation", desc: "Stack / Bottom tab / Drawer navigation" },
      { title: "List / Detail", desc: "FlatList infinite scroll detail screen" },
      { title: "Form & Validation", desc: "ฟอร์ม input validation submit" },
      { title: "Auth System", desc: "Login register token storage" },
      { title: "Camera", desc: "ถ่ายรูป scan QR code" },
      { title: "GPS / Map", desc: "ตำแหน่งปัจจุบัน แผนที่ marker" },
      { title: "Push Notification", desc: "Expo push notification local + remote" },
      { title: "Offline First", desc: "SQLite local store sync เมื่อมีเน็ต" },
      { title: "Dark Mode", desc: "เปลี่ยนธีมตาม OS/binding" },
      { title: "i18n", desc: "หลายภาษา locale detection" },
      { title: "Animations", desc: "Reanimated transitions gestures" },
      { title: "Biometric", desc: "Face ID / Fingerprint unlock" },
      { title: "In-app Payment", desc: "Stripe / RevenueCat" },
      { title: "Social Login", desc: "Login ด้วย Google Facebook Apple" },
      { title: "Share Sheet", desc: "แชร์ลิงก์ รูป ข้อความ" },
      { title: "File Picker", desc: "เลือกภาพ เอกสาร จากเครื่อง" },
      { title: "Background Task", desc: "ทำงานเบื้องหลังเมื่อปิดแอป" },
      { title: "Deep Link", desc: "เปิดแอปจากลิงก์ URL scheme" },
      { title: "App Store Deploy", desc: "ส่งขึ้น App Store/Play Store" },
      { title: "Push Notification Advanced", desc: "custom notification action" },
      { title: "State Management", desc: "Zustand / Context / Redux" },
      { title: "API Integration", desc: "REST / GraphQL axios" },
      { title: "WebSocket Mobile", desc: "real-time บนมือถือ" },
    ],
  },
];

/* ──────────── Helpers ──────────── */

export function getPublishedCourses(): Course[] {
  return COURSES.filter((c) => c.isPublished);
}

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
