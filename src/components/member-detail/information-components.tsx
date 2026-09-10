import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MeasurementValue } from "./types";
import { displayValue } from "./formatters";

interface InformationRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string | number | null;
  lines?: number;
}

interface ActionTileProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

export function InformationRow({
  icon,
  label,
  value,
  lines = 1,
}: InformationRowProps) {
  return (
    <View className="flex-row items-start border-b border-gray-100 py-4 last:border-b-0 ">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-50 ">
        <Ionicons name={icon} size={20} color="#6F3FA0" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs text-gray-500 ">
          {label}
        </Text>
        <Text
          numberOfLines={lines}
          className="mt-1 text-sm font-semibold text-gray-800 "
        >
          {displayValue(value)}
        </Text>
      </View>
    </View>
  );
}

export function ActionTile({
  icon,
  title,
  subtitle,
  color,
  backgroundColor,
  onPress,
}: ActionTileProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-4 w-[48%] rounded-3xl border border-gray-100 bg-white p-4 shadow-sm  "
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="mt-4 font-bold text-gray-900 ">
        {title}
      </Text>
      <Text className="mt-1 text-xs text-gray-500 ">
        {subtitle}
      </Text>
      <View className="mt-3 flex-row items-center">
        <Text className="mr-1 text-xs font-semibold" style={{ color }}>
          Buka
        </Text>
        <Ionicons name="arrow-forward" size={14} color={color} />
      </View>
    </TouchableOpacity>
  );
}

export function ProgressMetric({
  label,
  current,
  previous,
  unit = "",
  favorable = "neutral",
}: {
  label: string;
  current?: MeasurementValue;
  previous?: MeasurementValue;
  unit?: string;
  favorable?: "increase" | "decrease" | "neutral";
}) {
  const hasValues =
    current !== null &&
    current !== undefined &&
    current !== "" &&
    previous !== null &&
    previous !== undefined &&
    previous !== "";
  const difference = hasValues ? Number(current) - Number(previous) : null;
  const hasValidDifference = difference !== null && Number.isFinite(difference);
  const isImprovement =
    hasValidDifference &&
    difference !== 0 &&
    ((favorable === "increase" && difference > 0) ||
      (favorable === "decrease" && difference < 0));
  const trendColor =
    !hasValidDifference || difference === 0
      ? "#9CA3AF"
      : favorable === "neutral"
        ? "#6F3FA0"
        : isImprovement
          ? "#16A34A"
          : "#DC2626";

  return (
    <View className="mb-3 w-[48%] rounded-2xl bg-gray-50 p-4 ">
      <Text className="text-xs text-gray-500 ">{label}</Text>
      <Text className="mt-1 text-lg font-bold text-gray-900 ">
        {current !== null && current !== undefined && current !== ""
          ? `${current}${unit}`
          : "-"}
      </Text>
      <Text
        className="mt-1 text-xs font-semibold"
        style={{ color: trendColor }}
      >
        {!hasValidDifference
          ? "Data pembanding belum tersedia"
          : difference === 0
            ? "● Tidak berubah"
            : `${difference > 0 ? "▲ +" : "▼ "}${difference.toFixed(1)}${unit}`}
      </Text>
      {previous !== null && previous !== undefined && previous !== "" && (
        <Text className="mt-1 text-[10px] text-gray-400">
          Sebelumnya {previous}
          {unit}
        </Text>
      )}
    </View>
  );
}
