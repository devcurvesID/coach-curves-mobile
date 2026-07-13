import React, { useCallback, useImperativeHandle } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

type BottomSheetProps = {
  children?: React.ReactNode;
};
export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};
const BottomSheetComponent = React.forwardRef<
  BottomSheetRefProps,
  BottomSheetProps
>(({ children }, ref) => {
  const translationY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const active = useSharedValue(false);

  const scrollTo = useCallback((destination: number) => {
    "worklet";
    active.value = destination !== 0;
    translationY.value = withSpring(destination, { damping: 50 });
  }, []);

  const isActive = useCallback(() => {
    return active.value;
  }, []);

  useImperativeHandle(ref, () => ({ scrollTo, isActive }), [
    scrollTo,
    isActive,
  ]);
  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translationY.value };
    })
    .onUpdate((event) => {
      console.log(event.translationY);
      translationY.value = event.translationY + context.value.y;
      translationY.value = Math.max(translationY.value, MAX_TRANSLATE_Y);
    })
    .onEnd(() => {
      if (translationY.value > -SCREEN_HEIGHT / 3) {
        // translationY.value = withSpring(0, {damping : 50})
        scrollTo(0);
      } else if (translationY.value < -SCREEN_HEIGHT / 1.5) {
        scrollTo(MAX_TRANSLATE_Y);
      }
    });

  React.useEffect(() => {
    // translationY.value = withTiming(-SCREEN_HEIGHT / 3)
    // translationY.value = withSpring(-SCREEN_HEIGHT / 3, {damping : 50})
    scrollTo(-SCREEN_HEIGHT / 3);
  }, []);

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translationY.value,
      [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
      [25, 5],

      Extrapolate.CLAMP,
    );
    return {
      borderRadius,
      transform: [{ translateY: translationY.value }],
    };
  });
  return (
    // <GestureDetector gesture={gesture}>
    //   <Animated.View style={[styles.container, rBottomSheetStyle]}>
    //     {/* <Text>BottomSheet</Text> */}
    //     <View style={styles.line} />
    //     {children}
    //   </Animated.View>
    // </GestureDetector>
    <Animated.View style={[styles.container, rBottomSheetStyle]}>
      <GestureDetector gesture={gesture}>
        <View style={styles.line} />
      </GestureDetector>
      {children}
    </Animated.View>
  );
});

export default BottomSheetComponent;

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    width: "100%",
    backgroundColor: "#6F3FA0",
    position: "absolute",
    top: SCREEN_HEIGHT,
    borderRadius: 20,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: "#ffffff",
    alignSelf: "center",
    marginVertical: 15,
    borderRadius: 2,
  },
});
