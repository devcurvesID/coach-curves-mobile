import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const MIN_ZOOM_SCALE = 1;
const MAX_ZOOM_SCALE = 4;

interface FullscreenImageProps {
  accessibilityLabel: string;
  imageUrl?: string;
  fullscreenContent?: (dimensions: {
    width: number;
    height: number;
  }) => React.ReactNode;
  status?: string;
  thumbnail?: React.ReactNode;
  thumbnailIndicatorPosition?: "top-right" | "bottom-right";
  thumbnailSize?: number;
  thumbnailStyle?: StyleProp<ViewStyle>;
}

export const FullscreenImage = ({
  accessibilityLabel,
  imageUrl,
  fullscreenContent,
  status,
  thumbnail,
  thumbnailIndicatorPosition = "bottom-right",
  thumbnailSize,
  thumbnailStyle,
}: FullscreenImageProps) => {
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(MIN_ZOOM_SCALE);
  const savedScale = useSharedValue(MIN_ZOOM_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    if (!imageUrl) return;

    Image.getSize(
      imageUrl,
      (imageWidth, imageHeight) => setAspectRatio(imageWidth / imageHeight),
      () => setAspectRatio(1),
    );
  }, [imageUrl]);

  const resetZoom = () => {
    scale.value = withTiming(MIN_ZOOM_SCALE);
    savedScale.value = MIN_ZOOM_SCALE;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const closeFullscreen = () => {
    setIsVisible(false);
    resetZoom();
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(
        MAX_ZOOM_SCALE,
        Math.max(MIN_ZOOM_SCALE, savedScale.value * event.scale),
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;

      if (scale.value <= MIN_ZOOM_SCALE) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value <= MIN_ZOOM_SCALE) return;

      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const imageGesture = Gesture.Simultaneous(pinchGesture, panGesture);
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => setIsVisible(true)}
        className={
          thumbnail
            ? "relative"
            : "relative w-full overflow-hidden rounded-2xl bg-slate-100"
        }
        style={
          thumbnail
            ? [
                thumbnailSize
                  ? { width: thumbnailSize, height: thumbnailSize }
                  : undefined,
                thumbnailStyle,
              ]
            : undefined
        }
      >
        {thumbnail ??
          (imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", aspectRatio }}
              resizeMode="cover"
            />
          ) : null)}

        {status && (
          <View className="absolute right-4 top-4 rounded-full bg-pink-500 px-3 py-2">
            <Text className="font-bold text-white">{status}</Text>
          </View>
        )}

        {thumbnail ? (
          <View
            style={[
              styles.thumbnailIndicator,
              thumbnailIndicatorPosition === "top-right"
                ? styles.thumbnailIndicatorTop
                : styles.thumbnailIndicatorBottom,
            ]}
          >
            <Ionicons name="expand-outline" size={13} color="#FFFFFF" />
          </View>
        ) : (
          <View className="absolute bottom-4 right-4 flex-row items-center rounded-full bg-black/60 px-3 py-2">
            <Ionicons name="expand-outline" size={17} color="#FFFFFF" />
            <Text className="ml-1.5 text-xs font-semibold text-white">
              Lihat penuh
            </Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={isVisible}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={closeFullscreen}
      >
        <View style={styles.container}>
          <GestureDetector gesture={imageGesture}>
            <Animated.View style={[styles.content, animatedImageStyle]}>
              {fullscreenContent ? (
                fullscreenContent({ width, height })
              ) : imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width, height }}
                  resizeMode="contain"
                />
              ) : null}
            </Animated.View>
          </GestureDetector>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup gambar layar penuh"
            hitSlop={8}
            onPress={closeFullscreen}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={27} color="#FFFFFF" />
          </Pressable>

          {/* <View pointerEvents="none" style={styles.zoomHint}>
            <Ionicons name="scan-outline" size={16} color="#FFFFFF" />
            <Text className="ml-2 text-xs text-white">
              Cubit untuk memperbesar gambar
            </Text>
          </View> */}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 52,
    right: 20,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
  },
  zoomHint: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
  },
  thumbnailIndicator: {
    position: "absolute",
    right: -2,
    width: 23,
    height: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
  },
  thumbnailIndicatorTop: {
    top: -2,
  },
  thumbnailIndicatorBottom: {
    bottom: -2,
  },
});
