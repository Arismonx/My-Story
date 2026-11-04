import type { ExportFormat, Note } from "./types";
import { formatDateTime, isoDay, noteTitle } from "./format";

export function noteToMarkdown(note: Note) {
  return [
    `# ${noteTitle(note.title)}`,
    "",
    `> สร้างเมื่อ: ${formatDateTime(note.createdAt)}  `,
    `> แก้ไขล่าสุด: ${formatDateTime(note.updatedAt)}`,
    "",
    note.content,
    "",
  ].join("\n");
}

export function noteToText(note: Note) {
  const title = noteTitle(note.title);
  return [
    title,
    "=".repeat(Math.max(title.length, 3)),
    `สร้างเมื่อ: ${formatDateTime(note.createdAt)}`,
    `แก้ไขล่าสุด: ${formatDateTime(note.updatedAt)}`,
    "",
    note.content,
    "",
  ].join("\n");
}

const serialize = (note: Note, format: ExportFormat) =>
  format === "md" ? noteToMarkdown(note) : noteToText(note);

/** Keep Thai/Unicode letters, strip characters that are illegal in file names */
function safeName(s: string) {
  return (
    s
      .trim()
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, 60) || "note"
  );
}

function download(filename: string, content: string, format: ExportFormat) {
  const mime = format === "md" ? "text/markdown" : "text/plain";
  // BOM so Windows Notepad opens Thai text as UTF-8
  const blob = new Blob(["﻿", content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportNote(note: Note, format: ExportFormat) {
  const name = `${isoDay(note.createdAt)}_${safeName(noteTitle(note.title))}.${format}`;
  download(name, serialize(note, format), format);
}

export function exportAll(notes: Note[], format: ExportFormat) {
  const ordered = [...notes].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const sep = format === "md" ? "\n---\n\n" : "\n----------------------------------------\n\n";
  const body = ordered.map((n) => serialize(n, format)).join(sep);
  const today = isoDay(new Date().toISOString());
  download(`my-story_${today}.${format}`, body, format);
}
