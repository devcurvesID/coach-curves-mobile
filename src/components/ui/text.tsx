import React from "react";
import { Text as RSText, StyleSheet, TextProps } from "react-native";
type Variant = "title" | "subtitle" | "body" | "caption";

interface TextIProps extends TextProps {
  variant?: Variant;
  weight?: "regular" | "medium" | "semibold" | "bold";
  className?: string;
  children: React.ReactNode;
}
const Text = ({
  variant = "body",
  weight = "regular",
  className,
  children,
  ...props
}: TextIProps) => {
  const variantStyles: Record<Variant, string> = {
    title: "text-2xl",
    subtitle: "text-xl",
    body: "text-base",
    caption: "text-sm",
  };

  // 🎯 Mapping font weight
  const weightStyles: Record<NonNullable<TextIProps["weight"]>, string> = {
    regular: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  return (
    <RSText
      {...props}
      className={[
        "text-[#212121] dark:text-[#FFFFFF]",
        variantStyles[variant],
        weightStyles[weight],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </RSText>
  );
};

export default Text;

const styles = StyleSheet.create({});
