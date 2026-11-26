"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { onLocalChange } from "@/lib/db";
import { authRedirectUrl, getSupabase, syncEnabled } from "@/lib/supabase";
import { resetSyncState, syncNow } from "@/lib/sync";
import type { Note, SyncStatus } from "@/lib/types";

const PUSH_DELAY_MS = 2_000;

/**
 * Optional cloud sync. Does nothing unless Supabase is configured and the
 * user signed in. `onApplied` receives notes that sync changed locally.
 */
export function useSync(onApplied: (notes: Note[]) => void) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SyncStatus>(syncEnabled ? "signed-out" : "off");
  const userId = session?.user.id ?? null;

  const onAppliedRef = useRef(onApplied);
  useEffect(() => {
    onAppliedRef.current = onApplied;
  }, [onApplied]);

  const run = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }
    setStatus("syncing");
    try {
      onAppliedRef.current(await syncNow(supabase, userId));
      setStatus("idle");
    } catch (e) {
      // Supabase errors are plain objects; log their fields so they are readable.
      const { code, message, details, hint } = (e ?? {}) as Record<string, unknown>;
      console.error(`sync failed: [${code ?? "?"}] ${message ?? String(e)}`, { details, hint });
      setStatus(navigator.onLine ? "error" : "offline");
    }
  }, [userId]);

  // Session: restore on load, follow sign-in / sign-out (also from the magic link).
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) setStatus("signed-out");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Triggers: sign-in, focus, back online, and shortly after local edits.
  useEffect(() => {
    if (!userId) return;
    // Deferred so the first sync does not set state inside the effect body.
    const first = setTimeout(run, 0);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const soon = () => {
      clearTimeout(timer);
      timer = setTimeout(run, PUSH_DELAY_MS);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    const onOffline = () => setStatus("offline");
    const off = onLocalChange(soon);
    window.addEventListener("online", run);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(first);
      clearTimeout(timer);
      off();
      window.removeEventListener("online", run);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, run]);

  const signIn = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: "off" as const };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: authRedirectUrl() },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    // Notes stay on this device; only the link to the account is removed.
    await supabase.auth.signOut();
    resetSyncState();
  }, []);

  return { status, email: session?.user.email ?? null, signIn, signOut, syncNow: run };
}
