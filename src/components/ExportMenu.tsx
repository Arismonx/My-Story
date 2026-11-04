"use client";

import { useEffect, useRef, useState } from "react";
import type { ExportFormat } from "@/lib/types";

interface Props {
  label: string;
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}

export function ExportMenu({ label, onExport, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const pick = (f: ExportFormat) => {
    onExport(f);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="btn"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
        >
          <button role="menuitem" className="menu-item" onClick={() => pick("md")}>
            Markdown (.md)
          </button>
          <button role="menuitem" className="menu-item" onClick={() => pick("txt")}>
            ข้อความ (.txt)
          </button>
        </div>
      )}
    </div>
  );
}
