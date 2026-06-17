// ข้อมูลตัวอย่างร่วมสำหรับหน้า design preview (ไม่พึ่ง DB)

export type DemoCourse = {
  title: string;
  blurb: string;
  type: "scheduled" | "open";
  price: number;
  level: string;
};

export const DEMO_COURSES: DemoCourse[] = [
  {
    title: "AI Literacy สำหรับคนทำงาน",
    blurb: "เข้าใจ AI ตั้งแต่ศูนย์ ใช้เครื่องมือ AI ช่วยงานประจำวันได้จริงภายในคอร์สเดียว",
    type: "scheduled",
    price: 1990,
    level: "เริ่มต้น",
  },
  {
    title: "Prompt Engineering ขั้นใช้งานจริง",
    blurb: "เขียนพรอมต์ให้ได้ผลลัพธ์แม่นยำ ออกแบบเวิร์กโฟลว์ AI สำหรับทีมและงานจริง",
    type: "scheduled",
    price: 2490,
    level: "กลาง",
  },
  {
    title: "Vibe Coding — สร้างซอฟต์แวร์ด้วย AI",
    blurb: "เขียนโปรแกรมด้วย AI agent ตั้งแต่ไอเดียจนถึงดีพลอย เรียนได้ทันทีไม่ต้องรอรอบ",
    type: "open",
    price: 2990,
    level: "ขั้นสูง",
  },
];

export type DemoFeature = {
  title: string;
  desc: string;
  /** ชื่อไอคอน inline ใน components/icons ของแต่ละหน้า */
  icon: "spark" | "shield" | "bolt";
};

export const DEMO_FEATURES: DemoFeature[] = [
  {
    title: "ผู้สอนตัวจริง",
    desc: "เรียนกับคนที่ใช้ AI ทำงานจริง ไม่ใช่แค่ทฤษฎี",
    icon: "spark",
  },
  {
    title: "จ่ายแล้วเริ่มได้ทันที",
    desc: "สมัคร โอน แนบสลิป ระบบยืนยันที่นั่งอัตโนมัติ",
    icon: "bolt",
  },
  {
    title: "เนื้อหาอัปเดตเสมอ",
    desc: "ตามทันเครื่องมือ AI ใหม่ ๆ ที่เปลี่ยนเร็วทุกเดือน",
    icon: "shield",
  },
];

export const DEMO_STATS: { value: string; label: string }[] = [
  { value: "1,200+", label: "ผู้เรียน" },
  { value: "12", label: "คอร์ส" },
  { value: "4.9/5", label: "คะแนนรีวิว" },
];

export function baht(n: number): string {
  return new Intl.NumberFormat("th-TH").format(n) + " บาท";
}

export const STYLES = [
  {
    slug: "modern",
    name: "Modern Gradient SaaS",
    desc: "ไล่สี indigo→violet, การ์ดมน, navbar กระจกฝ้า ดูทันสมัยสะอาด",
  },
  {
    slug: "dark",
    name: "Dark Premium / Aurora",
    desc: "ฮีโร่มืดมีแสง aurora เนื้อหาสว่าง อิมแพ็กต์สูง เหมาะพรีเซนต์",
  },
  {
    slug: "elegant",
    name: "Elegant Minimal",
    desc: "เน้น whitespace ตัวอักษรเนี้ยบ accent สีเดียว ดูแพงเรียบหรู",
  },
  {
    slug: "bold",
    name: "Bold Edutech",
    desc: "สีจัดจ้าน ปุ่มมนใหญ่ รูปทรงสนุก พลังงานสูงแบบ edutech",
  },
] as const;
