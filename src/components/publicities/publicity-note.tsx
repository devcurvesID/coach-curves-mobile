import React, { useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";

type PublicityNoteProps = {
  html: string;
  compact?: boolean;
};

const tagsStyles = {
  body: {
    margin: 0,
    padding: 0,
  },
  p: {
    marginTop: 0,
    marginBottom: 12,
  },
  h1: {
    fontSize: 24,
    lineHeight: 31,
    marginTop: 8,
    marginBottom: 12,
  },
  h2: {
    fontSize: 21,
    lineHeight: 28,
    marginTop: 8,
    marginBottom: 10,
  },
  h3: {
    fontSize: 18,
    lineHeight: 25,
    marginTop: 6,
    marginBottom: 8,
  },
  h4: {
    fontSize: 17,
    lineHeight: 24,
    marginTop: 6,
    marginBottom: 8,
  },
  h5: {
    fontSize: 16,
    lineHeight: 23,
    marginTop: 4,
    marginBottom: 8,
  },
  h6: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
    marginBottom: 8,
  },
  strong: { fontWeight: "700" as const },
  b: { fontWeight: "700" as const },
  em: { fontStyle: "italic" as const },
  i: { fontStyle: "italic" as const },
  u: { textDecorationLine: "underline" as const },
  s: { textDecorationLine: "line-through" as const },
  strike: { textDecorationLine: "line-through" as const },
  del: { textDecorationLine: "line-through" as const },
  mark: { backgroundColor: "#FEF08A" },
  a: {
    color: "#7E22CE",
    textDecorationLine: "underline" as const,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: "#D8B4FE",
    marginLeft: 0,
    paddingLeft: 14,
    color: "#52525B",
  },
  ul: {
    marginTop: 0,
    marginBottom: 12,
    paddingLeft: 18,
  },
  ol: {
    marginTop: 0,
    marginBottom: 12,
    paddingLeft: 18,
  },
  li: {
    marginBottom: 7,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginTop: 10,
    marginBottom: 16,
  },
  pre: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    marginTop: 0,
    marginBottom: 12,
  },
  code: {
    backgroundColor: "#F3F4F6",
    fontFamily: "monospace",
  },
  img: {
    marginTop: 8,
    marginBottom: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginTop: 8,
    marginBottom: 14,
  },
  tr: {
    flexDirection: "row" as const,
  },
  th: {
    borderWidth: 0.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
    padding: 7,
    fontWeight: "700" as const,
  },
  td: {
    borderWidth: 0.5,
    borderColor: "#D1D5DB",
    padding: 7,
  },
};

export function PublicityNote({ html, compact = false }: PublicityNoteProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const source = useMemo(() => ({ html: html.trim() }), [html]);
  const contentWidth = measuredWidth || windowWidth - 40;

  if (!source.html) return null;

  return (
    <View
      style={compact ? styles.compactContainer : styles.container}
      onLayout={({ nativeEvent }) =>
        setMeasuredWidth(Math.floor(nativeEvent.layout.width))
      }
    >
      <RenderHTML
        contentWidth={contentWidth}
        source={source}
        baseStyle={compact ? styles.compactText : styles.baseText}
        tagsStyles={tagsStyles}
        systemFonts={defaultSystemFonts}
        renderersProps={{
          img: {
            enableExperimentalPercentWidth: true,
          },
        }}
        computeEmbeddedMaxWidth={() => contentWidth}
        enableExperimentalMarginCollapsing
        defaultTextProps={
          compact
            ? { allowFontScaling: true, numberOfLines: 3 }
            : { allowFontScaling: true, selectable: true }
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  compactContainer: {
    width: "100%",
    maxHeight: 72,
    marginTop: 12,
    overflow: "hidden",
  },
  baseText: {
    color: "#374151",
    fontSize: 16,
    lineHeight: 25,
  },
  compactText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 21,
  },
});
