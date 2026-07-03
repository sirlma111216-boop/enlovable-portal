import { useRef, useState } from "react";
import { PolicyModal } from "./policy-modal";
import {
  SERVICE_NAME,
  EFFECTIVE_DATE,
  OFFICER_NAME,
  OFFICER_AFFILIATION,
  OFFICER_CONTACT,
  termsMarkdown,
  privacyMarkdown,
  TERMS_FILENAME,
  PRIVACY_FILENAME,
} from "@/data/policies";

type Which = "terms" | "privacy" | null;

export function SiteFooter() {
  const [open, setOpen] = useState<Which>(null);
  const termsBtnRef = useRef<HTMLButtonElement>(null);
  const privacyBtnRef = useRef<HTMLButtonElement>(null);

  const openTerms = () => setOpen("terms");
  const openPrivacy = () => setOpen("privacy");
  const close = () => setOpen(null);

  return (
    <>
      <footer
        className="no-print border-t border-hairline bg-surface-cream-strong/50 mt-16"
        aria-label="사이트 정보"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4 text-[11px] sm:text-xs text-muted-text">
          {/* Left */}
          <p className="text-left md:shrink-0 whitespace-nowrap">
            © 2026 {SERVICE_NAME}. All rights reserved.
          </p>

          {/* Center */}
          <p className="text-left md:text-center md:flex-1 whitespace-nowrap">
            개인정보책임자: {OFFICER_NAME} 교사 ({OFFICER_AFFILIATION}) | 문의:{" "}
            {OFFICER_CONTACT}
          </p>

          {/* Right */}
          <nav
            className="flex flex-wrap gap-x-4 gap-y-1 md:justify-end md:shrink-0"
            aria-label="법적 문서"
          >
            <button
              ref={termsBtnRef}
              type="button"
              onClick={openTerms}
              className="font-semibold text-ink hover:text-coral hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral rounded-sm"
            >
              이용약관
            </button>
            <button
              ref={privacyBtnRef}
              type="button"
              onClick={openPrivacy}
              className="font-semibold text-ink hover:text-coral hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral rounded-sm"
            >
              개인정보처리방침
            </button>
          </nav>
        </div>
      </footer>

      <PolicyModal
        open={open === "terms"}
        onClose={close}
        title="이용약관"
        effectiveDate={EFFECTIVE_DATE}
        markdown={termsMarkdown}
        filename={TERMS_FILENAME}
        returnFocusTo={termsBtnRef.current}
      />
      <PolicyModal
        open={open === "privacy"}
        onClose={close}
        title="개인정보처리방침"
        effectiveDate={EFFECTIVE_DATE}
        markdown={privacyMarkdown}
        filename={PRIVACY_FILENAME}
        returnFocusTo={privacyBtnRef.current}
      />
    </>
  );
}
