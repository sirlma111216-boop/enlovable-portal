import { useCallback, useEffect, useRef } from "react";
import { X, Printer, Download } from "lucide-react";
import { MarkdownViewer, markdownToPrintableHtml } from "./markdown-viewer";
import { downloadMarkdown } from "@/data/policies";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  effectiveDate: string;
  markdown: string;
  filename: string;
  /** Element to return focus to on close. */
  returnFocusTo?: HTMLElement | null;
};

export function PolicyModal({
  open,
  onClose,
  title,
  effectiveDate,
  markdown,
  filename,
  returnFocusTo,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Scroll lock, ESC, focus management
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevActive = document.activeElement as HTMLElement | null;
    // Focus first actionable element
    requestAnimationFrame(() => closeBtnRef.current?.focus());

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        // Simple focus trap
        const nodes = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
      const target = returnFocusTo ?? prevActive;
      target?.focus?.();
    };
  }, [open, onClose, returnFocusTo]);

  const handlePrint = useCallback(() => {
    const html = markdownToPrintableHtml(title, markdown);
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    // Give the new window a tick to render before printing.
    const doPrint = () => {
      try {
        w.focus();
        w.print();
      } catch {}
    };
    if (w.document.readyState === "complete") setTimeout(doPrint, 100);
    else w.addEventListener("load", () => setTimeout(doPrint, 50));
  }, [title, markdown]);

  const handleDownload = useCallback(() => {
    downloadMarkdown(filename, markdown);
  }, [filename, markdown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-ink/60 backdrop-blur-sm p-0 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
        className="bg-canvas w-full sm:max-w-3xl sm:rounded-lg shadow-xl flex flex-col max-h-[100vh] sm:max-h-[90vh] h-full sm:h-auto"
      >
        {/* Header (sticky) */}
        <header className="flex items-start justify-between gap-3 px-5 sm:px-7 py-4 border-b border-hairline">
          <div className="min-w-0">
            <h2 id="policy-modal-title" className="serif text-xl sm:text-2xl text-ink leading-snug">
              {title}
            </h2>
            <p className="text-xs text-muted-text mt-1">시행일: {effectiveDate}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
              aria-label={`${title} 인쇄`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">인쇄</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
              aria-label={`${title} Markdown 다운로드`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Markdown 다운로드</span>
              <span className="sm:hidden">.md</span>
            </button>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-md bg-ink text-canvas hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">닫기</span>
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6">
          <MarkdownViewer source={markdown} />
        </div>
      </div>
    </div>
  );
}
