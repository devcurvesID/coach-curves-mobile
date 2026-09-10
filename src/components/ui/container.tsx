import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";
import Text from "./text";

interface ContainerProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
  onDetail?: boolean;
  titleHeader?: string;
}
const Container = ({
  onDetail,
  titleHeader,
  children,
  className,
  ...props
}: ContainerProps) => {
  return (
    <View
      {...props}
      className={["flex-1 ", className].filter(Boolean).join(" ")}
    >
      <ImageBackground
        source={require("@/assets/images/bgcurveslightnew.png")}
        resizeMode="cover"
        className="absolute inset-0"
      />
      {onDetail && (
        <View className="flex-row items-center justify-between px-6 pt-14 pb-10">
          <Pressable
            onPress={() => router.back()}
            className="w-12 h-12 rounded-full bg-[#6F3FA0]  border border-[#BB86FC]  items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </Pressable>

          <Text weight="bold" variant="body" className=" text-lg font-semibold">
            {titleHeader}
          </Text>
          <View className="w-12 h-12 " />
        </View>
      )}
      <View className="flex-1 bg-transparent">{children}</View>
    </View>
  );
};

export default Container;

const styles = StyleSheet.create({});
