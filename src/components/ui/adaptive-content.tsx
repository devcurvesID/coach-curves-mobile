import React from "react";
import { View, type ViewProps } from "react-native";

export const TABLET_CONTENT_MAX_WIDTH = 900;
export const TABLET_FORM_MAX_WIDTH = 640;

type AdaptiveContentProps = ViewProps & {
  maxWidth?: number;
};

/** Keeps phone layouts readable on iPad while preserving full-width phones. */
export default function AdaptiveContent({
  children,
  maxWidth = TABLET_CONTENT_MAX_WIDTH,
  style,
  ...props
}: AdaptiveContentProps) {
  return (
    <View
      {...props}
      style={[{ width: "100%", maxWidth, alignSelf: "center" }, style]}
    >
      {children}
    </View>
  );
}
