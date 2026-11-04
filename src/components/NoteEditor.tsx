"use client";

import type { Note } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { exportNote } from "@/lib/export";
import { ExportMenu } from "./ExportMenu";

interface Props {
  note: Note;
  onChange: (patch: Partial<Pick<Note, "title" | "content">>) => void;
  onDelete: () => void;
  onBack: () => void;
}

export function NoteEditor({ note, onChange, onDelete, onBack }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <button type="button" onClick={onBack} className="btn md:hidden" aria-label="กลับ">
          ←
        </button>
        <div className="flex-1" />
        <ExportMenu label="ส่งออก" onExport={(f) => exportNote(note, f)} />
        <button
          type="button"
          className="btn text-danger"
          onClick={() => {
            if (confirm("ลบบันทึกนี้?")) onDelete();
          }}
        >
          ลบ
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 md:px-8">
        <input
          value={note.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="ชื่อเรื่อง"
          className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted"
        />
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <div>
            <dt className="inline">จดเมื่อ </dt>
            <dd className="inline">
              <time dateTime={note.createdAt}>{formatDateTime(note.createdAt)}</time>
            </dd>
          </div>
          <div>
            <dt className="inline">แก้ไขล่าสุด </dt>
            <dd className="inline">
              <time dateTime={note.updatedAt}>{formatDateTime(note.updatedAt)}</time>
            </dd>
          </div>
        </dl>
        <textarea
          value={note.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="เขียนเรื่องราวของคุณ…"
          className="mt-4 min-h-[50vh] w-full flex-1 resize-none bg-transparent leading-relaxed outline-none placeholder:text-muted"
        />
      </div>
    </div>
  );
}
