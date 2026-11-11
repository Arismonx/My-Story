// Turn an imported .md / .txt file into a note draft (the reverse of export.ts).

export const IMPORT_ACCEPT = ".md,.markdown,.txt,text/markdown,text/plain";
export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;

export interface NoteDraft {
  title: string;
  content: string;
}

// Matches the title that export writes for a note without one
const UNTITLED = "ไม่มีชื่อ";

/**
 * Title = first `# heading` (removed from the body), otherwise the file name.
 * The `> สร้างเมื่อ / > แก้ไขล่าสุด` block written by our own export is dropped,
 * so exporting and re-importing a note does not pile up metadata.
 */
export function parseImported(fileName: string, text: string): NoteDraft {
  const lines = text
    .replace(/^﻿/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n");

  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;

  let title = "";
  const h = /^#\s+(.*?)(\s+#+)?\s*$/.exec(lines[i] ?? "");
  if (h) {
    title = h[1].trim();
    i++;
    let j = i;
    while (j < lines.length && lines[j].trim() === "") j++;
    if (/^>\s*(สร้างเมื่อ|แก้ไขล่าสุด):/.test(lines[j] ?? "")) {
      while (j < lines.length && /^>\s*(สร้างเมื่อ|แก้ไขล่าสุด):/.test(lines[j])) j++;
      i = j;
    }
  }
  if (!title) title = fileName.replace(/\.(md|markdown|txt)$/i, "").trim();
  if (title === UNTITLED && h) title = "";

  return { title, content: lines.slice(i).join("\n").replace(/^\n+/, "").trimEnd() };
}
