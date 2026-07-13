import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import Text from "./text";

interface ListItemProps extends ViewProps {
  label: string;
  value: string;
}
const ListItem = ({ label, value, ...props }: ListItemProps) => {
  return (
    <View
      {...props}
      className="border border-width-[2px] border-[#6F3FA0] dark:border-[#BB86FC] rounded-2xl p-4 mb-5"
    >
      <Text
        variant="caption"
        weight="semibold"
        className="text-[#6F3FA0] text-xs mb-1"
      >
        {label}
      </Text>

      <Text variant="body" weight="bold" className=" text-xl font-bold">
        {value ? value : "-"}
      </Text>
    </View>
  );
};

export default ListItem;

const styles = StyleSheet.create({});
