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
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
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

  const closeFullscreen = () => {
    setIsVisible(false);
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(4, Math.max(1, savedScale.value * event.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value <= 1) return;
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });
  const animatedStyle = useAnimatedStyle(() => ({
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
        style={[
          thumbnail ? styles.thumbnail : styles.preview,
          thumbnailSize
            ? { width: thumbnailSize, height: thumbnailSize }
            : undefined,
          thumbnailStyle,
        ]}
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
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
        <View
          style={[
            styles.indicator,
            thumbnailIndicatorPosition === "top-right"
              ? styles.indicatorTop
              : styles.indicatorBottom,
          ]}
        >
          <Ionicons name="expand-outline" size={13} color="#FFFFFF" />
          {!thumbnail && <Text style={styles.indicatorText}>Lihat penuh</Text>}
        </View>
      </Pressable>
      <Modal
        visible={isVisible}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={closeFullscreen}
      >
        <View style={styles.modal}>
          <GestureDetector
            gesture={Gesture.Simultaneous(pinchGesture, panGesture)}
          >
            <Animated.View style={[styles.content, animatedStyle]}>
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
            accessibilityLabel="Tutup tampilan layar penuh"
            hitSlop={8}
            onPress={closeFullscreen}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={27} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  thumbnail: { position: "relative" },
  preview: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  modal: { flex: 1, backgroundColor: "#000000" },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  indicator: {
    position: "absolute",
    right: -2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
  },
  indicatorTop: { top: -2 },
  indicatorBottom: { bottom: -2 },
  indicatorText: { marginLeft: 5, fontSize: 11, color: "#FFFFFF" },
  statusBadge: {
    position: "absolute",
    right: 16,
    top: 16,
    borderRadius: 18,
    backgroundColor: "#EC4899",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: { fontSize: 12, fontWeight: "800", color: "#FFFFFF" },
});
