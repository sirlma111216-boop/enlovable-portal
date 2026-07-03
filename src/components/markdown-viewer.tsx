import { useMemo, type ReactNode } from "react";

// Small, safe Markdown renderer tuned to the subset we use in policy docs:
// #/##/### headings, - bullet lists, "N." ordered lists, > blockquotes,
// paragraphs, inline `code` and **bold**, and a fenced ``` block.
// No external deps; escapes HTML.

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(s: string): string {
  const escaped = escapeHtml(s);
  return escaped
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-surface-card text-ink text-[0.9em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

type Block =
  | { kind: "h"; level: 1 | 2 | 3; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { i++; continue; }

    // Headings
    const h = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (h) {
      blocks.push({ kind: "h", level: h[1].length as 1 | 2 | 3, text: h[2] });
      i++; continue;
    }

    // Blockquote (single-line handling; consecutive > lines merge)
    if (trimmed.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        buf.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ kind: "quote", text: buf.join(" ") });
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
        // Consume nested indented continuation lines into the previous item
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^[-*]\s+/.test(lines[i].trim())) {
          const cont = lines[i].trim();
          // If it's a sub-bullet, append as a new line so it still reads
          items[items.length - 1] += " " + cont.replace(/^[-*]\s+/, "• ");
          i++;
        }
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i].trim()) && !/^[-*]\s+/.test(lines[i].trim())) {
          items[items.length - 1] += " " + lines[i].trim();
          i++;
        }
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    // Paragraph — collect until blank/heading/list
    const buf: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,3}\s+/.test(lines[i].trim()) &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith("> ")
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    blocks.push({ kind: "p", text: buf.join(" ") });
  }
  return blocks;
}

export function MarkdownViewer({ source, className = "" }: { source: string; className?: string }) {
  const blocks = useMemo(() => parseBlocks(source), [source]);

  return (
    <div className={`space-y-4 text-body leading-relaxed ${className}`}>
      {blocks.map((b, idx) => renderBlock(b, idx))}
    </div>
  );
}

function renderBlock(b: Block, key: number): ReactNode {
  switch (b.kind) {
    case "h":
      if (b.level === 1)
        return <h1 key={key} className="serif text-3xl text-ink mt-2 mb-1">{renderInlineNode(b.text)}</h1>;
      if (b.level === 2)
        return <h2 key={key} className="serif text-xl text-ink mt-6 mb-1 border-b border-hairline pb-1">{renderInlineNode(b.text)}</h2>;
      return <h3 key={key} className="font-semibold text-ink mt-4 mb-1">{renderInlineNode(b.text)}</h3>;
    case "p":
      return <p key={key} className="text-sm sm:text-base">{renderInlineNode(b.text)}</p>;
    case "ul":
      return (
        <ul key={key} className="list-disc pl-6 space-y-1 text-sm sm:text-base marker:text-muted-text">
          {b.items.map((it, i) => <li key={i}>{renderInlineNode(it)}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol key={key} className="list-decimal pl-6 space-y-1 text-sm sm:text-base marker:text-muted-text">
          {b.items.map((it, i) => <li key={i}>{renderInlineNode(it)}</li>)}
        </ol>
      );
    case "quote":
      return (
        <blockquote key={key} className="border-l-4 border-coral bg-surface-soft rounded-r-md px-4 py-3 text-sm sm:text-base text-body-strong">
          {renderInlineNode(b.text)}
        </blockquote>
      );
  }
}

function renderInlineNode(s: string) {
  return <span dangerouslySetInnerHTML={{ __html: renderInline(s) }} />;
}

// Build a full standalone HTML string of a policy document, for isolated print.
export function markdownToPrintableHtml(title: string, markdown: string): string {
  const blocks = parseBlocks(markdown);
  const body = blocks
    .map((b) => {
      switch (b.kind) {
        case "h":
          return `<h${b.level}>${renderInline(b.text)}</h${b.level}>`;
        case "p":
          return `<p>${renderInline(b.text)}</p>`;
        case "ul":
          return `<ul>${b.items.map((i) => `<li>${renderInline(i)}</li>`).join("")}</ul>`;
        case "ol":
          return `<ol>${b.items.map((i) => `<li>${renderInline(i)}</li>`).join("")}</ol>`;
        case "quote":
          return `<blockquote>${renderInline(b.text)}</blockquote>`;
      }
    })
    .join("\n");

  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1a1a1a; max-width: 720px; margin: 0 auto; padding: 32px 24px; line-height: 1.7; }
  h1 { font-family: "Noto Serif KR", serif; font-size: 28px; margin: 0 0 16px; }
  h2 { font-family: "Noto Serif KR", serif; font-size: 20px; margin: 24px 0 8px; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; }
  h3 { font-size: 15px; margin: 16px 0 6px; }
  p, li { font-size: 14px; }
  ul, ol { padding-left: 22px; }
  blockquote { border-left: 4px solid #e97b62; background: #faf7f2; margin: 12px 0; padding: 10px 14px; }
  code { background: #f2f0eb; padding: 1px 5px; border-radius: 4px; font-size: 0.9em; }
  @page { margin: 18mm; }
</style></head><body>${body}</body></html>`;
}
