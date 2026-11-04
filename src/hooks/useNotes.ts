"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { indexedDbRepo } from "@/lib/db";
import type { Note, NoteRepository } from "@/lib/types";

const byUpdatedDesc = (a: Note, b: Note) =>
  b.updatedAt.localeCompare(a.updatedAt);

export function useNotes(repo: NoteRepository = indexedDbRepo) {
  const [notes, setNotesState] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  // Mirror of state so callbacks always see the latest notes synchronously.
  const notesRef = useRef<Note[]>([]);

  const setNotes = useCallback((next: Note[]) => {
    notesRef.current = next;
    setNotesState(next);
  }, []);

  useEffect(() => {
    repo
      .list()
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [repo, setNotes]);

  const create = useCallback(async () => {
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    setNotes([note, ...notesRef.current]);
    await repo.save(note);
    return note;
  }, [repo, setNotes]);

  const update = useCallback(
    async (id: string, patch: Partial<Pick<Note, "title" | "content">>) => {
      const current = notesRef.current.find((n) => n.id === id);
      if (!current) return;
      const saved: Note = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      setNotes(
        notesRef.current.map((n) => (n.id === id ? saved : n)).sort(byUpdatedDesc),
      );
      await repo.save(saved);
    },
    [repo, setNotes],
  );

  const remove = useCallback(
    async (id: string) => {
      setNotes(notesRef.current.filter((n) => n.id !== id));
      await repo.remove(id);
    },
    [repo, setNotes],
  );

  return { notes, loading, create, update, remove };
}
