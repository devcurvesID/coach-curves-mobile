import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type UserRoleValue =
  | string
  | {
      name?: unknown;
      role?: unknown;
      role_name?: unknown;
      user_role?: unknown;
    }
  | UserRoleValue[]
  | null
  | undefined;

interface UserRoleBadgeProps {
  role: UserRoleValue;
  variant?: "default" | "light";
}

const normalizeRole = (role: UserRoleValue): string => {
  if (Array.isArray(role)) return normalizeRole(role[0]);
  if (typeof role === "string") return role.trim();

  if (role && typeof role === "object") {
    const roleValue =
      role.role_name ?? role.name ?? role.role ?? role.user_role;
    return typeof roleValue === "string" ? roleValue.trim() : "";
  }

  return "";
};

const formatRole = (role: UserRoleValue): string => {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) return "Pengguna";

  return normalizedRole
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const UserRoleBadge = ({
  role,
  variant = "default",
}: UserRoleBadgeProps) => {
  const isLight = variant === "light";

  return (
    <View
      className={`flex-row items-center self-start rounded-full px-3 py-1.5 ${
        isLight ? "bg-white/15" : "bg-purple-100"
      }`}
      accessibilityLabel={`Role pengguna: ${formatRole(role)}`}
    >
      <Ionicons
        name="shield-checkmark-outline"
        size={14}
        color={isLight ? "#FFFFFF" : "#6F3FA0"}
      />
      <Text
        className={`ml-1.5 text-xs font-bold ${
          isLight ? "text-white" : "text-purple-700"
        }`}
      >
        {formatRole(role)}
      </Text>
    </View>
  );
};
