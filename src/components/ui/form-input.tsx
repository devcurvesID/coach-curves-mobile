import { Text, TextInput, View } from "react-native";

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  error,
}: any) {
  return (
    <View className="mb-4">
      <Text className="text-gray-500 mb-1">{label}</Text>

      <View
        className={`flex-row items-center border rounded-xl px-4 py-3 bg-white ${
          error ? "border-red-500" : "border-purple-400"
        }`}
      >
        {icon}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          className="ml-3 flex-1 text-gray-800"
        />
      </View>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
