/** join className แบบเบา (กรองค่า falsy ออก) */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
