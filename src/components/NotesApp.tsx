"use client";

import { useMemo, useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { exportAll } from "@/lib/export";
import { ExportMenu } from "./ExportMenu";
import { NoteEditor } from "./NoteEditor";
import { NoteList } from "./NoteList";

const VERSION = process.env.NEXT_PUBLIC_APP_VERSION;

export function NotesApp() {
  const { notes, loading, create, update, remove } = useNotes();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
    );
  }, [notes, query]);

  const handleNew = async () => {
    const note = await create();
    setSelectedId(note.id);
  };

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* List pane: full screen on mobile, sidebar on desktop */}
      <aside
        className={`${
          selected ? "hidden md:flex" : "flex"
        } w-full flex-col border-line md:w-80 md:border-r`}
      >
        <header className="flex items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2">
          <h1 className="flex-1 text-xl font-bold">My Story</h1>
          <ExportMenu
            label="ส่งออกทั้งหมด"
            disabled={notes.length === 0}
            onExport={(f) => exportAll(notes, f)}
          />
        </header>
        <div className="px-4 pb-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา…"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-6 text-center text-sm text-muted">กำลังโหลด…</p>
          ) : (
            <NoteList notes={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </div>
        <footer className="px-4 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] text-[11px] text-muted">
          v{VERSION}
        </footer>
      </aside>

      {/* Editor pane */}
      <main className={`${selected ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
        {selected ? (
          <NoteEditor
            key={selected.id}
            note={selected}
            onChange={(patch) => update(selected.id, patch)}
            onDelete={() => {
              remove(selected.id);
              setSelectedId(null);
            }}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="m-auto text-center text-muted">
            <p>เลือกบันทึก หรือเริ่มเขียนเรื่องใหม่</p>
          </div>
        )}
      </main>

      {/* Floating "new note" button – thumb-friendly on mobile */}
      <button
        type="button"
        onClick={handleNew}
        aria-label="บันทึกใหม่"
        className={`${
          selected ? "hidden md:flex" : "flex"
        } fixed right-5 bottom-[max(env(safe-area-inset-bottom),1.25rem)] h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl text-white shadow-lg active:scale-95 md:bottom-6 md:left-[17rem] md:right-auto md:h-12 md:w-12`}
      >
        +
      </button>
    </div>
  );
}
