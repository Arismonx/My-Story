"use client";

import { useEffect, useRef, useState } from "react";
import type { SyncStatus } from "@/lib/types";

const LABEL: Record<SyncStatus, string> = {
  off: "",
  "signed-out": "ซิงค์ข้ามอุปกรณ์",
  idle: "ซิงค์แล้ว",
  syncing: "กำลังซิงค์…",
  offline: "ออฟไลน์ (จะซิงค์เมื่อกลับมาออนไลน์)",
  error: "ซิงค์ไม่สำเร็จ",
};

const DOT: Record<SyncStatus, string> = {
  off: "",
  "signed-out": "bg-muted",
  idle: "bg-accent",
  syncing: "bg-accent animate-pulse",
  offline: "bg-muted",
  error: "bg-danger",
};

interface Props {
  status: SyncStatus;
  email: string | null;
  onSignIn: (email: string) => Promise<{ error: string | null }>;
  onSignOut: () => void;
  onSyncNow: () => void;
}

export function SyncMenu({ status, email, onSignIn, onSignOut, onSyncNow }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (status === "off") return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await onSignIn(input.trim());
    setBusy(false);
    if (error) setError("ส่งลิงก์ไม่สำเร็จ ลองใหม่อีกครั้ง");
    else setSent(true);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn flex min-h-10 items-center gap-2 px-2 text-xs text-muted"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[status]}`} />
        <span className="truncate">{status === "offline" ? "ออฟไลน์" : LABEL[status]}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="ซิงค์"
          className="absolute bottom-full left-0 z-30 mb-1 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-surface p-4 text-sm shadow-lg"
        >
          {email ? (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-muted">เข้าสู่ระบบเป็น</p>
                <p className="truncate font-medium">{email}</p>
              </div>
              <p className="text-xs text-muted">{LABEL[status]}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn min-h-10 flex-1 border border-line"
                  disabled={status === "syncing"}
                  onClick={onSyncNow}
                >
                  ซิงค์ตอนนี้
                </button>
                <button
                  type="button"
                  className="btn min-h-10 flex-1 text-danger"
                  onClick={() => {
                    onSignOut();
                    setOpen(false);
                    setSent(false);
                  }}
                >
                  ออกจากระบบ
                </button>
              </div>
              <p className="text-[11px] text-muted">ออกจากระบบแล้ว บันทึกยังอยู่ในเครื่องนี้</p>
            </div>
          ) : sent ? (
            <div className="flex flex-col gap-3">
              <p>ส่งลิงก์เข้าสู่ระบบไปที่ {input} แล้ว</p>
              <p className="text-xs text-muted">เปิดลิงก์ในอีเมลบนอุปกรณ์นี้เพื่อเริ่มซิงค์</p>
              <button type="button" className="btn min-h-10 border border-line" onClick={() => setSent(false)}>
                ใช้อีเมลอื่น
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <p className="text-xs text-muted">
                เข้าสู่ระบบด้วยอีเมลเพื่อซิงค์บันทึกระหว่างอุปกรณ์ ไม่ต้องใช้รหัสผ่าน
              </p>
              <input
                type="email"
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="อีเมล"
                autoComplete="email"
                className="w-full rounded-lg border border-line bg-bg px-3 py-2 outline-none focus:border-accent"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="min-h-10 rounded-lg bg-accent px-3 text-sm font-medium text-bg active:scale-95 disabled:opacity-40"
              >
                {busy ? "กำลังส่ง…" : "ส่งลิงก์เข้าสู่ระบบ"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
