import { Picker } from "@react-native-picker/picker";
import { Text, View } from "react-native";

export default function FormSelect({
  label,
  value,
  onValueChange,
  items,
  error,
  icon,
}: any) {
  return (
    <View className="mb-4">
      <Text className="text-gray-500 mb-1">{label}</Text>

      <View
        className={`border rounded-xl bg-white ${
          error ? "border-red-500" : "border-purple-400"
        }`}
      >
        <View className="flex-row items-center px-3">
          {icon}
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            style={{ flex: 1 }}
          >
            {items.map((item: any) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
