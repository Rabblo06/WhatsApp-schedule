"use client";

import { Copy } from "lucide-react";

export function CopyLinkButton({ value }: { value: string }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      onClick={() => void navigator.clipboard.writeText(value)}
      type="button"
    >
      <Copy className="h-4 w-4" />
      Copy chat link
    </button>
  );
}
