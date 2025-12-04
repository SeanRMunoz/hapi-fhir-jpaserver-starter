// #AI-GENERATED
"use client";

import React from "react";

type Props = {
  text: string;
  label?: string;
  className?: string;
};

export default function CopyToClipboardButton({ text, label = "Copy", className }: Props) {
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [tooltip, setTooltip] = React.useState<string>("");
  const timeoutRef = React.useRef<number | null>(null);

  const clearLater = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setStatus("idle");
      setTooltip("");
    }, 1500);
  };

  const fallbackCopy = (value: string) => {
    // Fallback for older browsers when navigator.clipboard is not available
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.left = "-1000px";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const onClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ok = fallbackCopy(text);
        if (!ok) throw new Error("Copy command failed");
      }
      setStatus("success");
      setTooltip("Copied!");
      clearLater();
    } catch (e) {
      console.error("Copy failed", e);
      setStatus("error");
      setTooltip("Copy failed");
      clearLater();
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      className={className ? className : "btn"}
      aria-live="polite"
      onClick={onClick}
      title={tooltip || label}
    >
      {status === "success" ? "Copied" : label}
    </button>
  );
}
