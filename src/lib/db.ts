import type { Note, NoteRepository } from "./types";

const DB_NAME = "my-story";
// v1: store `notes` (keyPath id, index updatedAt)
// v2: optional `deletedAt` / `dirty` fields for sync (no data rewrite needed)
const DB_VERSION = 2;
const STORE = "notes";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      // Bump DB_VERSION and add a branch here when the schema changes.
      // Every branch must keep existing notes.
      req.onupgradeneeded = (e) => {
        const db = req.result;
        if (e.oldVersion < 1) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("updatedAt", "updatedAt");
        }
        // v1 → v2: new fields are optional, old notes are valid as-is.
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error);
      }),
  );
}

/** Read-modify-write several notes in one transaction. */
function update(ids: string[], fn: (current: Note | undefined, id: string) => Note | null) {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        for (const id of ids) {
          const get = store.get(id);
          get.onsuccess = () => {
            const next = fn(get.result as Note | undefined, id);
            if (next) store.put(next);
          };
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

// Lets the sync layer know there is something new to push.
const listeners = new Set<() => void>();
export function onLocalChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
const notify = () => listeners.forEach((fn) => fn());

export const indexedDbRepo: NoteRepository = {
  async list() {
    const notes = await run<Note[]>("readonly", (s) => s.getAll());
    return notes
      .filter((n) => !n.deletedAt)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async save(note) {
    await run("readwrite", (s) => s.put({ ...note, dirty: true }));
    notify();
  },
  async remove(id) {
    const now = new Date().toISOString();
    // Tombstone: keep id + dates so the deletion syncs, drop the text.
    await update([id], (n) =>
      n ? { ...n, title: "", content: "", deletedAt: now, updatedAt: now, dirty: true } : null,
    );
    notify();
  },
};

/* ---- Used only by the sync layer (src/lib/sync.ts) ---- */

/** Every stored note, tombstones included. */
export function listAllNotes() {
  return run<Note[]>("readonly", (s) => s.getAll());
}

/** Mark pushed notes clean, unless they were edited again in the meantime. */
export function markClean(pushed: Note[]) {
  const at = new Map(pushed.map((n) => [n.id, n.updatedAt]));
  return update([...at.keys()], (n, id) =>
    n && n.dirty && n.updatedAt === at.get(id) ? { ...n, dirty: false } : null,
  );
}

/**
 * Merge notes from the server, last write wins by `updatedAt`.
 * Returns the notes that were actually written locally.
 */
export async function mergeRemote(remote: Note[]): Promise<Note[]> {
  const byId = new Map(remote.map((n) => [n.id, n]));
  const applied: Note[] = [];
  await update([...byId.keys()], (local, id) => {
    const r = byId.get(id)!;
    if (local && local.updatedAt >= r.updatedAt) return null;
    const next = { ...r, dirty: false };
    applied.push(next);
    return next;
  });
  return applied;
}
