import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AdaptiveContent from "./adaptive-content";

interface NavigationHeaderProps {
  fallbackHref: "/(auth)" | "/(tabs)";
  label?: string;
  title?: string;
}

export default function NavigationHeader({
  fallbackHref,
  label = "Kembali",
  title,
}: NavigationHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  };

  return (
    <AdaptiveContent
      className="flex-row items-center px-4 pb-2"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={10}
        onPress={goBack}
        className="min-h-11 flex-row items-center justify-center rounded-full px-2 active:bg-white/15"
      >
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        <Text className="ml-1 text-base font-semibold text-white">{label}</Text>
      </Pressable>

      {title ? (
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="mx-3 flex-1 text-center text-lg font-bold text-white"
        >
          {title}
        </Text>
      ) : (
        <View className="flex-1" />
      )}

      {title ? <View className="w-[88px]" /> : null}
    </AdaptiveContent>
  );
}
