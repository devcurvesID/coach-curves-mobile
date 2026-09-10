import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  type ViewProps,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AdaptiveContent from "./adaptive-content";
import NavigationHeader from "./navigation-header";

interface ContainerPageProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
  titleHeader?: string;
  titleContent?: string;
  showBackButton?: boolean;
  backFallbackHref?: "/(auth)" | "/(tabs)";
  backLabel?: string;
}
const ContainerPage = ({
  titleHeader,
  children,
  className,
  titleContent,
  showBackButton = true,
  backFallbackHref = "/(tabs)",
  backLabel = "Kembali",
  ...props
}: ContainerPageProps) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const horizontalGutter = Math.round(
    Math.max(12, Math.min(width * 0.045, 24)),
  );
  const isCompactHeight = height < 700;
  const contentTopSpacing = isCompactHeight ? 12 : height < 820 ? 16 : 20;
  const containerTopSpacing = isCompactHeight ? 16 : height < 820 ? 20 : 24;
  const headerTopSpacing = showBackButton
    ? isCompactHeight
      ? 6
      : 10
    : Math.max(insets.top + 12, isCompactHeight ? 44 : 56);

  return (
    <KeyboardAvoidingView
      {...props}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className={["flex-1 bg-[#6F3FA0]", className].filter(Boolean).join(" ")}
    >
      {showBackButton && (
        <NavigationHeader fallbackHref={backFallbackHref} label={backLabel} />
      )}
      <AdaptiveContent
        style={{
          paddingHorizontal: horizontalGutter,
          paddingTop: headerTopSpacing,
        }}
      >
        <Text className="text-2xl font-bold text-white">{titleHeader}</Text>
        <Text className="mt-2 text-purple-200">{titleContent}</Text>
      </AdaptiveContent>

      <View
        className="flex-1 items-center rounded-t-[32px] bg-white"
        style={{ marginTop: containerTopSpacing }}
      >
        <AdaptiveContent
          className="flex-1"
          style={{
            paddingHorizontal: horizontalGutter,
            paddingTop: contentTopSpacing,
          }}
        >
          {children}
        </AdaptiveContent>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ContainerPage;
