"use client";

import type { Note } from "@/lib/types";
import { formatDay, isoDay, noteTitle } from "@/lib/format";

interface Props {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Notes grouped by the day they were written */
export function NoteList({ notes, selectedId, onSelect }: Props) {
  if (notes.length === 0) {
    return <p className="p-6 text-center text-sm text-muted">ยังไม่มีบันทึก</p>;
  }

  const groups = new Map<string, Note[]>();
  for (const n of [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const key = isoDay(n.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }

  return (
    <div className="pb-24">
      {[...groups.entries()].map(([day, items]) => (
        <section key={day}>
          <h3 className="sticky top-0 bg-bg/95 px-4 py-2 text-xs font-medium text-muted backdrop-blur">
            {formatDay(items[0].createdAt)}
          </h3>
          <ul>
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onSelect(n.id)}
                  className={`w-full border-b border-line px-4 py-3 text-left transition-colors hover:bg-surface ${
                    n.id === selectedId ? "bg-surface" : ""
                  }`}
                >
                  <div className="truncate font-medium">{noteTitle(n.title)}</div>
                  <div className="mt-0.5 line-clamp-2 text-sm text-muted">
                    {n.content || "…"}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
