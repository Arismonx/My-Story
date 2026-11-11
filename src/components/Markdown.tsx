import { Fragment, type ReactNode } from "react";

// Lightweight Markdown renderer: no library, no dangerouslySetInnerHTML (safe from XSS).
// Supports: # headings, **bold**, *italic*, ~~strike~~, `code`, ```code blocks```, [links](url),
// > quotes, - / 1. lists, - [ ] checklists, --- horizontal rules, | tables | with :alignment: |

const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+?\*\*|__[^_\n]+?__)|(~~[^~\n]+?~~)|(\*[^*\n]+?\*|(?<![\w])_[^_\n]+?_(?![\w]))|(\[[^\]\n]+\]\([^)\s]+\))/g;

function safeUrl(url: string): string | null {
  return /^(https?:|mailto:)/i.test(url) ? url : null;
}

function inline(text: string, keyPrefix = ""): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const s = m[0];
    const key = `${keyPrefix}${i++}`;
    if (m[1]) {
      out.push(
        <code key={key} className="rounded bg-surface px-1 py-0.5 font-mono text-[0.9em]">
          {s.slice(1, -1)}
        </code>,
      );
    } else if (m[2]) {
      out.push(<strong key={key}>{inline(s.slice(2, -2), key + "-")}</strong>);
    } else if (m[3]) {
      out.push(<del key={key}>{inline(s.slice(2, -2), key + "-")}</del>);
    } else if (m[4]) {
      out.push(<em key={key}>{inline(s.slice(1, -1), key + "-")}</em>);
    } else if (m[5]) {
      const [, label, url] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(s)!;
      const href = safeUrl(url);
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline">
            {label}
          </a>
        ) : (
          s
        ),
      );
    }
    last = idx + s.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function lines(text: string, key: string): ReactNode {
  return text.split("\n").map((l, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {inline(l, `${key}-${i}-`)}
    </Fragment>
  ));
}

const HEADING_CLASS = [
  "",
  "text-2xl font-semibold",
  "text-xl font-semibold",
  "text-lg font-semibold",
  "text-base font-semibold",
  "text-base font-medium",
  "text-sm font-medium text-muted",
];

const RE = {
  fence: /^```/,
  heading: /^(#{1,6})\s+(.*)$/,
  hr: /^\s{0,3}([-*_])(\s*\1){2,}\s*$/,
  quote: /^>\s?/,
  ul: /^\s*[-*+]\s+(.*)$/,
  ol: /^\s*\d+[.)]\s+(.*)$/,
};

function isBlockStart(l: string) {
  return RE.fence.test(l) || RE.heading.test(l) || RE.hr.test(l) || RE.quote.test(l) || RE.ul.test(l) || RE.ol.test(l);
}

// --- Tables (GFM): header row, delimiter row (---, :---, ---:, :---:), body rows ---

const TABLE_DELIM = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

// Split a row on pipes that are not escaped (\|) and not inside `code`
function splitRow(line: string): string[] {
  const t = line.trim().replace(/^\|/, "").replace(/(?<!\\)\|$/, "");
  const cells: string[] = [];
  let cur = "";
  let inCode = false;
  for (let c = 0; c < t.length; c++) {
    const ch = t[c];
    if (ch === "\\" && t[c + 1] === "|") {
      cur += "|";
      c++;
    } else if (ch === "`") {
      inCode = !inCode;
      cur += ch;
    } else if (ch === "|" && !inCode) {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

function isTableAt(src: string[], i: number): boolean {
  const head = src[i];
  const delim = src[i + 1];
  if (head === undefined || delim === undefined) return false;
  if (!head.includes("|") || !delim.includes("-") || !TABLE_DELIM.test(delim)) return false;
  return splitRow(head).length === splitRow(delim).length;
}

type Align = "left" | "center" | "right" | undefined;

function alignOf(cell: string): Align {
  const l = cell.startsWith(":");
  const r = cell.endsWith(":");
  return l && r ? "center" : r ? "right" : l ? "left" : undefined;
}

export function Markdown({ source }: { source: string }) {
  const src = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < src.length) {
    const line = src[i];
    const key = `b${k++}`;

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (RE.fence.test(line)) {
      const code: string[] = [];
      i++;
      while (i < src.length && !RE.fence.test(src[i])) code.push(src[i++]);
      i++; // skip the closing fence
      blocks.push(
        <pre key={key} className="overflow-x-auto rounded-lg bg-surface p-3 font-mono text-sm">
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const h = RE.heading.exec(line);
    if (h) {
      const level = h[1].length;
      const Tag = `h${level}` as "h1";
      blocks.push(
        <Tag key={key} className={HEADING_CLASS[level]}>
          {inline(h[2].replace(/\s+#+\s*$/, ""), key + "-")}
        </Tag>,
      );
      i++;
      continue;
    }

    if (RE.hr.test(line)) {
      blocks.push(<hr key={key} className="border-line" />);
      i++;
      continue;
    }

    if (RE.quote.test(line)) {
      const q: string[] = [];
      while (i < src.length && RE.quote.test(src[i])) q.push(src[i++].replace(RE.quote, ""));
      blocks.push(
        <blockquote key={key} className="border-l-4 border-line pl-3 text-muted">
          {lines(q.join("\n"), key)}
        </blockquote>,
      );
      continue;
    }

    const isUl = RE.ul.test(line);
    if (isUl || RE.ol.test(line)) {
      const re = isUl ? RE.ul : RE.ol;
      const items: string[] = [];
      while (i < src.length && re.test(src[i])) items.push(re.exec(src[i++])![1]);
      const lis = items.map((t, n) => {
        const task = isUl ? /^\[( |x|X)\]\s+(.*)$/.exec(t) : null;
        return (
          <li key={n} className={task ? "list-none -ml-5" : undefined}>
            {task && (
              <input type="checkbox" checked={task[1] !== " "} readOnly disabled className="mr-2 accent-accent" />
            )}
            {inline(task ? task[2] : t, `${key}-${n}-`)}
          </li>
        );
      });
      blocks.push(
        isUl ? (
          <ul key={key} className="list-disc space-y-1 pl-6">
            {lis}
          </ul>
        ) : (
          <ol key={key} className="list-decimal space-y-1 pl-6">
            {lis}
          </ol>
        ),
      );
      continue;
    }

    if (isTableAt(src, i)) {
      const head = splitRow(src[i]);
      const aligns = splitRow(src[i + 1]).map(alignOf);
      i += 2;
      const rows: string[][] = [];
      while (i < src.length && src[i].trim() !== "" && src[i].includes("|") && !isBlockStart(src[i])) {
        const cells = splitRow(src[i++]).slice(0, head.length);
        while (cells.length < head.length) cells.push("");
        rows.push(cells);
      }
      // Literal class names so Tailwind can see them
      const ALIGN_CLASS = { left: "text-left", center: "text-center", right: "text-right" };
      const cls = (n: number, base: string) => `${base} ${ALIGN_CLASS[aligns[n] ?? "left"]}`;
      blocks.push(
        <div key={key} className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                {head.map((c, n) => (
                  <th key={n} className={cls(n, "border border-line bg-surface px-3 py-2 font-semibold")}>
                    {inline(c, `${key}-h${n}-`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, n) => (
                    <td key={n} className={cls(n, "border border-line px-3 py-2")}>
                      {inline(c, `${key}-${ri}-${n}-`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const p: string[] = [];
    while (
      i < src.length &&
      src[i].trim() !== "" &&
      (p.length === 0 || (!isBlockStart(src[i]) && !isTableAt(src, i)))
    )
      p.push(src[i++]);
    blocks.push(<p key={key}>{lines(p.join("\n"), key)}</p>);
  }

  return <div className="space-y-3 break-words leading-relaxed">{blocks}</div>;
}
