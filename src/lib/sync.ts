import type { SupabaseClient } from "@supabase/supabase-js";
import { listAllNotes, markClean, mergeRemote } from "./db";
import type { Note } from "./types";

/*
 * Local-first sync: IndexedDB stays the source the UI reads; Supabase is a
 * remote copy.
 * 1. push notes marked `dirty` (the server skips rows that are older than
 *    what it has, see supabase/schema.sql)
 * 2. pull rows changed since the last cursor (server `synced_at`)
 * 3. merge into IndexedDB, last write wins by `updatedAt`
 */

interface Row {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at?: string;
}

const toRow = (n: Note, userId: string): Row => ({
  id: n.id,
  user_id: userId,
  title: n.title,
  content: n.content,
  created_at: n.createdAt,
  updated_at: n.updatedAt,
  deleted_at: n.deletedAt ?? null,
});

// Postgres returns "+00:00" offsets; normalise to the ISO form the app writes
// so string comparison of updatedAt keeps working.
const iso = (t: string) => new Date(t).toISOString();

const fromRow = (r: Row): Note => ({
  id: r.id,
  title: r.title,
  content: r.content,
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
  ...(r.deleted_at ? { deletedAt: iso(r.deleted_at) } : {}),
});

const CURSOR_KEY = "my-story:sync-cursor";
const USER_KEY = "my-story:sync-user";
const PAGE = 500;
// Re-read a few seconds before the cursor: transactions can commit slightly
// out of order. Merging is idempotent, so re-reading is harmless.
const OVERLAP_MS = 5_000;

/** Forget sync progress (on sign-out) so the next sign-in starts fresh. */
export function resetSyncState() {
  localStorage.removeItem(CURSOR_KEY);
  localStorage.removeItem(USER_KEY);
}

let running: Promise<Note[]> | null = null;

/** Run one sync. Concurrent calls share the same run. Returns notes changed locally. */
export function syncNow(supabase: SupabaseClient, userId: string): Promise<Note[]> {
  running ??= doSync(supabase, userId).finally(() => {
    running = null;
  });
  return running;
}

async function doSync(supabase: SupabaseClient, userId: string): Promise<Note[]> {
  const all = await listAllNotes();

  // First sync for this account on this device: upload every local note,
  // not only the dirty ones, and pull everything.
  const firstTime = localStorage.getItem(USER_KEY) !== userId;
  if (firstTime) localStorage.removeItem(CURSOR_KEY);

  const toPush = all.filter((n) => n.dirty || (firstTime && !n.deletedAt));
  for (let i = 0; i < toPush.length; i += PAGE) {
    const batch = toPush.slice(i, i + PAGE);
    const { error } = await supabase
      .from("notes")
      .upsert(batch.map((n) => toRow(n, userId)), { onConflict: "id" });
    if (error) throw error;
    await markClean(batch);
  }
  localStorage.setItem(USER_KEY, userId);

  // One fixed lower bound per run, paged by offset. (Rows written in one
  // upsert share the same synced_at, so paging by timestamp could skip some.)
  const cursor = localStorage.getItem(CURSOR_KEY);
  const since = cursor ? new Date(Date.parse(cursor) - OVERLAP_MS).toISOString() : null;
  const applied: Note[] = [];
  let newest = cursor;
  for (let offset = 0; ; offset += PAGE) {
    let q = supabase
      .from("notes")
      .select("*")
      .order("synced_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (since) q = q.gt("synced_at", since);
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    if (rows.length > 0) {
      applied.push(...(await mergeRemote(rows.map(fromRow))));
      const last = rows[rows.length - 1].synced_at!;
      if (!newest || Date.parse(last) > Date.parse(newest)) newest = last;
    }
    if (rows.length < PAGE) break;
  }
  if (newest) localStorage.setItem(CURSOR_KEY, newest);
  return applied;
}
