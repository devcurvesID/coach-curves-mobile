import Text from "@/components/ui/text";
import React, { useEffect } from "react";
import { ImageBackground, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function Dot({ delay = 0 }: { delay?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 600 }),
        ),
        -1,
      );
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0.3, 1]),
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [1, 1.4]),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className="h-10 w-10 rounded-full bg-[#6F3FA0] mx-1"
    />
  );
}

export const LoadingView = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF] dark:bg-[#121212]">
      <ImageBackground
        source={require("@/assets/images/logocurves.png")}
        resizeMode="cover"
        className="absolute inset-0"
      />
      <View
        pointerEvents="none"
        className="absolute -top-24 left-0 right-0 h-[320px] rounded-b-[60px] overflow-hidden"
        // className="absolute -top-24 left-0 right-0 h-96 rounded-b-[60px] overflow-hidden"
        style={{
          backgroundColor: "transparent",
          shadowColor: "#000",
        }}
      ></View>
      <View className="flex-1 items-center justify-center">
        {/* Tagline */}
        <Text className="text-[#6F3FA0] text-xl font-semibold -mt-4">
          Amaze Yourself™
        </Text>

        {/* Loading */}
        <View className="mt-12 items-center">
          {/* <ActivityIndicator size="large" color="#6F3FA0" /> */}
          <Dot />
          <Dot delay={200} />
          <Dot delay={400} />
          <Text className="text-[#6F3FA0] text-base mt-4 font-medium">
            Loading...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
