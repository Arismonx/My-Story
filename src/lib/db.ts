import type { Note, NoteRepository } from "./types";

const DB_NAME = "my-story";
const DB_VERSION = 1;
const STORE = "notes";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      // Bump DB_VERSION and add a branch here when the schema changes.
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("updatedAt", "updatedAt");
        }
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

export const indexedDbRepo: NoteRepository = {
  async list() {
    const notes = await run<Note[]>("readonly", (s) => s.getAll());
    return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async save(note) {
    await run("readwrite", (s) => s.put(note));
  },
  async remove(id) {
    await run("readwrite", (s) => s.delete(id));
  },
};
