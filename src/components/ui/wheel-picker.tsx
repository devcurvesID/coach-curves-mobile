import { useEffect, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";

const ITEM_HEIGHT = 60;

type WheelPickerProps<T> = {
  data: T[];
  value?: T;
  onChange?: (val: T) => void;
  keyExtractor?: (item: T, index: number) => string;
  renderLabel: (item: T) => string;
};

export default function WheelPicker<T>({
  data,
  value,
  onChange,
  keyExtractor,
  renderLabel,
}: WheelPickerProps<T>) {
  const flatListRef = useRef<FlatList>(null);

  // 🔥 cari index dari value
  const initialIndex = data.findIndex((d) => d === value);

  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0,
  );

  useEffect(() => {
    if (initialIndex >= 0) {
      flatListRef.current?.scrollToOffset({
        offset: initialIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [initialIndex]);

  const onScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);

    if (index >= 0 && index < data.length) {
      setSelectedIndex(index);
      onChange?.(data[index]);
    }
  };

  return (
    <View className="h-[300px] justify-center">
      {/* Highlight */}
      <View
        className="absolute left-4 right-4 bg-gray-200 rounded-xl"
        style={{
          height: ITEM_HEIGHT,
          top: (300 - ITEM_HEIGHT) / 2,
        }}
      />

      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={keyExtractor || ((_, i) => i.toString())}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const isActive = index === selectedIndex;

          return (
            <View
              style={{ height: ITEM_HEIGHT }}
              className="justify-center items-center"
            >
              <Text
                className={`text-lg ${
                  isActive ? "text-gray-900 font-bold" : "text-gray-400"
                }`}
              >
                {renderLabel(item)}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}
