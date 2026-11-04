const dateTimeFmt = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dayFmt = new Intl.DateTimeFormat("th-TH", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
export const formatDay = (iso: string) => dayFmt.format(new Date(iso));

/** YYYY-MM-DD in local time, used for file names and grouping */
export function isoDay(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function noteTitle(title: string) {
  return title.trim() || "ไม่มีชื่อ";
}
