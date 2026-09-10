import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  type ViewProps,
} from "react-native";
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
  return (
    <KeyboardAvoidingView
      {...props}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className={["flex-1 bg-[#6F3FA0]", className].filter(Boolean).join(" ")}
    >
      {showBackButton && (
        <NavigationHeader fallbackHref={backFallbackHref} label={backLabel} />
      )}
      {/* HEADER */}
      <AdaptiveContent className={`px-6 ${showBackButton ? "pt-3" : "pt-20"}`}>
        <Text className="text-white text-2xl font-bold">{titleHeader}</Text>
        <Text className="text-purple-200 mt-2">{titleContent}</Text>
      </AdaptiveContent>

      <View
        className={`${showBackButton ? "mt-6" : "mt-10"} flex-1 items-center rounded-t-[32px] bg-white`}
      >
        <AdaptiveContent className="flex-1 px-6 pt-8">
          {children}
        </AdaptiveContent>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ContainerPage;
