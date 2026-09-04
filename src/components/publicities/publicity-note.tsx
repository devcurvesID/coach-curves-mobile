import React, { useMemo } from "react";
import { Text } from "react-native";

interface PublicityNoteProps {
  html: string;
  compact?: boolean;
}

const decodeHtml = (value: string): string =>
  value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/li>|<\/h[1-6]>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export function PublicityNote({ html, compact = false }: PublicityNoteProps) {
  const content = useMemo(() => decodeHtml(html), [html]);
  if (!content) return null;

  return (
    <Text
      numberOfLines={compact ? 4 : undefined}
      className={
        compact
          ? "text-sm leading-5 text-slate-600"
          : "text-base leading-7 text-slate-600"
      }
    >
      {content}
    </Text>
  );
}
