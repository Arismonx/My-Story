export interface Note {
  id: string;
  title: string;
  content: string;
  /** ISO 8601 – when the note was first written */
  createdAt: string;
  /** ISO 8601 – last edit */
  updatedAt: string;
}

/**
 * Storage abstraction. The app only talks to this interface, so the
 * IndexedDB implementation can later be swapped for (or synced with)
 * a Postgres backend such as Supabase without touching the UI.
 */
export interface NoteRepository {
  list(): Promise<Note[]>;
  save(note: Note): Promise<void>;
  remove(id: string): Promise<void>;
}

export type ExportFormat = "md" | "txt";
