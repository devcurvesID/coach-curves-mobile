import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface IItem {
  label: string;
  value: any;
  iconKey: string;
}
const getIcon = (key: string) => {
  switch (key) {
    // profile
    case "name":
      return <Ionicons name="person" size={18} color="#6366F1" />;
    case "email":
      return <Ionicons name="mail" size={18} color="#3B82F6" />;
    case "birth":
      return (
        <MaterialCommunityIcons name="cake-variant" size={18} color="#F59E0B" />
      );
    case "joined":
      return (
        <MaterialCommunityIcons
          name="calendar-check"
          size={18}
          color="#10B981"
        />
      );
    case "leave-date":
      return (
        <MaterialCommunityIcons name="calendar-end" size={18} color="#F43F5E" />
      );
    case "sex":
      return (
        <MaterialCommunityIcons
          name="gender-female"
          size={18}
          color="#EC4899"
        />
      );
    case "phone":
      return <Ionicons name="call" size={18} color="#22C55E" />;
    case "address":
      return <Ionicons name="location" size={18} color="#F97316" />;
    case "tshirt":
      return (
        <MaterialCommunityIcons name="tshirt-crew" size={18} color="#8B5CF6" />
      );
    // profile
    case "age":
      return <Ionicons name="person-outline" size={18} color="#6366F1" />;
    case "height":
      return (
        <MaterialCommunityIcons
          name="human-male-height"
          size={18}
          color="#6366F1"
        />
      );
    case "weight":
      return (
        <MaterialCommunityIcons
          name="scale-bathroom"
          size={18}
          color="#8B5CF6"
        />
      );

    case "bmi":
      return (
        <MaterialCommunityIcons name="chart-line" size={18} color="#F59E0B" />
      );
    case "body_fat":
      return (
        <MaterialCommunityIcons
          name="water-percent"
          size={18}
          color="#EF4444"
        />
      );
    case "muscle_mass":
      return (
        <MaterialCommunityIcons name="arm-flex" size={18} color="#10B981" />
      );
    case "bone_mass":
      return <MaterialCommunityIcons name="bone" size={18} color="#6B7280" />;
    case "body_water":
      return <MaterialCommunityIcons name="water" size={18} color="#3B82F6" />;
    case "visceral":
      return (
        <MaterialCommunityIcons name="heart-pulse" size={18} color="#EF4444" />
      );

    case "bp":
      return (
        <MaterialCommunityIcons name="heart-pulse" size={18} color="#DC2626" />
      );
    case "rhr":
      return <MaterialCommunityIcons name="heart" size={18} color="#F43F5E" />;

    case "chest":
      return (
        <MaterialCommunityIcons name="human-male" size={18} color="#6366F1" />
      );
    case "waist":
      return (
        <MaterialCommunityIcons name="tape-measure" size={18} color="#8B5CF6" />
      );
    case "abdomen":
      return (
        <MaterialCommunityIcons name="stomach" size={18} color="#F97316" />
      );
    case "hip":
      return (
        <MaterialCommunityIcons name="human-female" size={18} color="#EC4899" />
      );
    case "thigh":
      return <MaterialCommunityIcons name="run" size={18} color="#22C55E" />;
    case "arm":
      return (
        <MaterialCommunityIcons
          name="arm-flex-outline"
          size={18}
          color="#10B981"
        />
      );

    case "person-active":
      return (
        <FontAwesome6 name="person-circle-check" size={18} color="#22C55E" />
      );
    case "person-non-active":
      return (
        <FontAwesome6 name="person-circle-xmark" size={18} color="#EC4899" />
      );
    case "wm-date":
      return <FontAwesome6 name="calendar-days" size={18} color="#22C55E" />;
    default:
      return (
        <Ionicons name="information-circle-outline" size={18} color="#999" />
      );
  }
};

export default function Item({ label, value, iconKey }: IItem) {
  return (
    <View className="mb-3">
      <Text className="text-gray-400 text-xs mb-1">{label}</Text>

      <View className="flex-row items-center border border-purple-400 rounded-xl px-4 py-3 bg-white">
        {getIcon(iconKey)}
        <Text className="ml-3 text-gray-800 font-semibold">{value ?? "-"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
