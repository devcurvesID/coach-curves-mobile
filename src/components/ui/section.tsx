import { Text, View } from "react-native";

export default function Section({ title, children }: any) {
  return (
    <View className="mb-6">
      <Text className="text-gray-700 font-bold mb-3">{title}</Text>

      <View className="bg-white rounded-2xl p-4 shadow-sm">{children}</View>
    </View>
  );
}
