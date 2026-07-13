import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface MenuItemProps extends PressableProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  danger?: boolean;
  isBottom?: boolean;
}
const MenuItem = ({
  icon,
  title,
  danger,
  isBottom,
  ...props
}: MenuItemProps) => {
  return (
    <Pressable
      {...props}
      className="flex-row items-center justify-between px-5 py-4 bg-[#6F3FA0] dark:bg-[#BB86FC] border border-[#D1D1D1] dark:border-[#2C2C2C] rounded-2xl mb-3"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-black/30 items-center justify-center">
          <Ionicons
            name={icon}
            size={20}
            color={danger ? "#ff4d4f" : "#F8BBD0"}
          />
        </View>
        <Text
          className={`text-base font-semibold ${
            danger ? "text-red-400" : "text-white"
          }`}
        >
          {title}
        </Text>
      </View>

      {!danger && (
        <Ionicons
          name={isBottom ? "chevron-down" : "chevron-forward"}
          size={18}
          color="rgba(255,255,255,0.4)"
        />
      )}
    </Pressable>
  );
};

export default MenuItem;

const styles = StyleSheet.create({});
