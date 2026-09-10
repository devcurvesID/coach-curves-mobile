import React from "react";
import { Pressable, PressableProps, StyleSheet, View } from "react-native";
import Text from "./text";

interface MenuTileProps extends PressableProps {
  icon: React.ReactNode;
  title: string;
}
const MenuTile = ({ icon, title, ...props }: MenuTileProps) => {
  return (
    <Pressable
      {...props}
      className="flex-1 rounded-3xl border border-[rgba(15,23,42,0.12)]  bg-[#6F3FA0]  px-5 py-6"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-2xl items-center justify-center bg-white/20  border border-black/10 ">
          {icon}
        </View>
        <Text variant="caption" weight="bold" className="text-white">
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

export default MenuTile;

const styles = StyleSheet.create({});
