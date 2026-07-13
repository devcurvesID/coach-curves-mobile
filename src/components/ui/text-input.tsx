import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  Pressable,
  TextInput as RSTextInput,
  StyleSheet,
  TextInputProps,
  View,
} from "react-native";
import Text from "./text";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const EmailAndUsernameInput = ({ label, ...props }: InputProps) => {
  return (
    <View className="mb-2">
      <Text className="text-gray-500 mb-2">{label}</Text>
      <View className="flex-row items-center border border-[#6F3FA0] dark:border-[#BB86FC] rounded-xl px-4 py-3 mb-6">
        <Feather name="mail" size={20} color="#9CA3AF" />
        <RSTextInput
          {...props}
          className="flex-1 ml-3 py-3 text-[#4A2E75] dark:text-[#FFFFFF]"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
};

export const UsernameInput = ({ label, ...props }: InputProps) => {
  return (
    <View className="mb-2">
      <Text className="text-gray-500 mb-2">{label}</Text>
      <View className="flex-row items-center border border-[#6F3FA0] dark:border-[#BB86FC] rounded-xl px-4 py-3 mb-6">
        <Feather name="user" size={20} color="#9CA3AF" />
        <RSTextInput
          {...props}
          className="flex-1 ml-3 py-3 text-[#4A2E75] dark:text-[#FFFFFF]"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
};

export const NumberPhoneInput = ({ label, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = React.useState(false);

  // const handleChange = (text: string) => {
  //   // auto remove non-number
  //   let clean = text.replace(/[^0-9]/g, "");

  //   // auto remove leading 0 → jadi format Indonesia (+62)
  //   if (clean.startsWith("0")) {
  //     clean = clean.substring(1);
  //   }

  //   onChangeText(clean);
  // };

  return (
    <View className="mb-5">
      {/* Label */}
      <Text className="text-gray-500 mb-2 text-sm">{label}</Text>

      {/* Input Container */}
      <View
        className={`flex-row items-center rounded-2xl px-4 py-3 border 
        ${isFocused ? "border-purple-600" : "border-gray-300"}
        bg-white dark:bg-[#1E1E1E] shadow-sm`}
      >
        {/* Icon */}
        <Feather
          name="phone"
          size={20}
          color={isFocused ? "#7C3AED" : "#9CA3AF"}
        />

        {/* Prefix +62 */}
        <Text className="ml-3 text-base text-gray-700 dark:text-gray-200 font-medium">
          +62
        </Text>

        {/* Input */}
        <RSTextInput
          {...props}
          keyboardType="number-pad"
          placeholderTextColor="#9CA3AF"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 ml-3 py-3 text-[#4A2E75] dark:text-[#FFFFFF]"
        />
      </View>

      {/* Hint */}
      <Text className="text-xs text-gray-400 mt-1">Contoh: 81234567890</Text>
    </View>
  );
};

export const PasswordInput = ({ label, ...props }: InputProps) => {
  const { colorScheme } = useColorScheme(); // "light" | "dark"

  const [secure, setSecure] = React.useState(true);

  return (
    <View className="mb-1">
      <Text className="text-gray-500 mb-2">{label}</Text>
      <View className="flex-row items-center border border-[#6F3FA0] dark:border-[#BB86FC] rounded-xl px-4 py-3 mb-8">
        <Feather name="lock" size={20} color="#9CA3AF" />
        <RSTextInput
          {...props}
          secureTextEntry={secure}
          className="flex-1 ml-3 py-3 text-[#4A2E75] dark:text-[#FFFFFF]"
          placeholderTextColor="#9CA3AF"
        />

        <Pressable onPress={() => setSecure(!secure)}>
          <Feather
            name={secure ? "eye-off" : "eye"}
            size={20}
            color={colorScheme === "dark" ? "#9A67EA" : "#5E2E91"}
          />
        </Pressable>
      </View>
    </View>
  );
};

const TextInput = ({ label, error, ...props }: InputProps) => {
  return (
    <View className="mb-4">
      <Text weight="medium" className="text-sm mb-2">
        {label}
      </Text>
      <View className="bg-white dark:bg-gray-900 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-4">
        <RSTextInput
          {...props}
          placeholderTextColor="text-black dark:text-white"
          className="text-black dark:text-white text-base"
        />
      </View>
      {error && (
        <Text className="text-[#ff4d4f]/80  text-sm mt-2">{error}</Text>
      )}
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.create({});
