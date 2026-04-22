import { useEffect, useRef, useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard?.writeText &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to legacy path.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (!ok) return;
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-live="polite"
      aria-label="Copy share link with current inputs"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
        right: "calc(env(safe-area-inset-right, 0px) + 1.5rem)",
      }}
      className="fixed z-50 inline-flex min-w-[180px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-white/60 sm:min-w-[260px] sm:px-5"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <LinkIcon className="h-4 w-4" />
          <span>
            Copy share link
            <span className="hidden sm:inline"> w current inputs</span>
          </span>
        </>
      )}
    </button>
  );
}
