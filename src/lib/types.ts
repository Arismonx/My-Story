export interface Note {
  id: string;
  title: string;
  content: string;
  /** ISO 8601 – when the note was first written */
  createdAt: string;
  /** ISO 8601 – last edit */
  updatedAt: string;
  /**
   * ISO 8601 – set when the note is deleted. Deleted notes are kept as
   * tombstones (title/content cleared) so the deletion can sync to other
   * devices. `NoteRepository.list()` never returns them.
   */
  deletedAt?: string;
  /** Local only: changed on this device and not pushed to the server yet */
  dirty?: boolean;
}

/**
 * Storage abstraction. The app only talks to this interface, so the
 * IndexedDB implementation can later be swapped for (or synced with)
 * a Postgres backend such as Supabase without touching the UI.
 */
export interface NoteRepository {
  /** Live notes only (no tombstones), newest edit first */
  list(): Promise<Note[]>;
  save(note: Note): Promise<void>;
  remove(id: string): Promise<void>;
}

export type ExportFormat = "md" | "txt";

export type SyncStatus = "off" | "signed-out" | "idle" | "syncing" | "offline" | "error";
