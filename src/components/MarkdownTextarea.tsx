"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// Textarea that highlights Markdown syntax while typing (e.g. `##` in the accent color, bold headings).
// Technique: a transparent textarea laid over a <div> that renders the colored text.
// Caution: never change glyph widths in the overlay (real font-weight/size),
// otherwise the caret drifts away from the text. Bold uses .md-bold (text-stroke) instead.

const INLINE = /(\*\*[^*\n]+?\*\*)|(`[^`\n]+`)|(~~[^~\n]+?~~)|(\[[^\]\n]+\]\([^)\s]+\))|(\*[^*\n]+?\*)/g;

const marker = (k: string, t: string) => (
  <span key={k} className="text-accent">
    {t}
  </span>
);

function inline(text: string, kp: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const s = m[0];
    const k = `${kp}${i++}`;
    if (m[1]) {
      out.push(
        marker(k + "a", "**"),
        <span key={k + "b"} className="md-bold">
          {s.slice(2, -2)}
        </span>,
        marker(k + "c", "**"),
      );
    } else if (m[2]) {
      out.push(
        <span key={k} className="text-accent">
          {s}
        </span>,
      );
    } else if (m[3]) {
      out.push(
        <span key={k} className="text-muted">
          {s}
        </span>,
      );
    } else if (m[4]) {
      out.push(
        <span key={k} className="text-accent underline">
          {s}
        </span>,
      );
    } else if (m[5]) {
      out.push(marker(k + "a", "*"), s.slice(1, -1), marker(k + "c", "*"));
    }
    last = idx + s.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function highlight(value: string): ReactNode[] {
  let inFence = false;
  return value.split("\n").map((line, n) => {
    const k = `l${n}-`;
    let body: ReactNode;
    if (/^```/.test(line)) {
      inFence = !inFence;
      body = <span className="text-muted">{line}</span>;
    } else if (inFence) {
      body = <span className="text-muted">{line}</span>;
    } else {
      let m: RegExpExecArray | null;
      if ((m = /^(#{1,6}\s+)(.*)$/.exec(line))) {
        body = (
          <>
            {marker(k + "h", m[1])}
            <span className="md-bold">{inline(m[2], k)}</span>
          </>
        );
      } else if ((m = /^(>\s?)(.*)$/.exec(line))) {
        body = (
          <>
            {marker(k + "q", m[1])}
            <span className="text-muted">{inline(m[2], k)}</span>
          </>
        );
      } else if ((m = /^(\s*(?:[-*+]|\d+[.)])\s+)(.*)$/.exec(line))) {
        body = (
          <>
            {marker(k + "u", m[1])}
            {inline(m[2], k)}
          </>
        );
      } else if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) {
        body = <span className="text-accent">{line}</span>;
      } else if (/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(line) && line.includes("|")) {
        // table delimiter row
        body = <span className="text-accent">{line}</span>;
      } else if (line.includes("|")) {
        // table row: pipes in the accent color (same glyph width, caret stays aligned)
        body = line.split("|").flatMap((cell, c) => (c === 0 ? [inline(cell, `${k}${c}-`)] : [marker(`${k}p${c}`, "|"), inline(cell, `${k}${c}-`)]));
      } else {
        body = inline(line, k);
      }
    }
    return (
      <span key={n}>
        {body}
        {"\n"}
      </span>
    );
  });
}

// Must be identical for the overlay and the textarea
const TEXT = "whitespace-pre-wrap break-words text-base leading-relaxed";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownTextarea({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow with the content so the whole page scrolls and the overlay needs no scroll sync
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="relative min-h-[50vh] min-w-0 flex-1">
      <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${TEXT}`}>
        {highlight(value)}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={`relative block min-h-[50vh] w-full resize-none overflow-hidden bg-transparent p-0 text-transparent caret-fg outline-none placeholder:text-muted ${TEXT}`}
      />
    </div>
  );
}
