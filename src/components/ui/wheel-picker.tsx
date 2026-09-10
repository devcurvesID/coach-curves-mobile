import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Text,
  View,
} from "react-native";

const ITEM_HEIGHT = 60;
const PICKER_HEIGHT = 300;
const SETTLE_DELAY_MS = 100;

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

interface WheelPickerProps<T> {
  data: T[];
  value?: T;
  onChange?: (value: T) => void;
  keyExtractor?: (item: T, index: number) => string;
  renderLabel: (item: T) => string;
  isEqual?: (item: T, value: T) => boolean;
}

export default function WheelPicker<T>({
  data,
  value,
  onChange,
  keyExtractor,
  renderLabel,
  isEqual = Object.is,
}: WheelPickerProps<T>) {
  const flatListRef = useRef<FlatList<T>>(null);
  const isScrollingRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueIndex =
    value === undefined ? -1 : data.findIndex((item) => isEqual(item, value));
  const [selectedIndex, setSelectedIndex] = useState(
    valueIndex >= 0 ? valueIndex : 0,
  );

  const clearSettleTimer = useCallback(() => {
    if (!settleTimerRef.current) return;
    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
  }, []);

  const getIndexFromOffset = useCallback(
    (offset: number) =>
      Math.min(
        Math.max(Math.round(offset / ITEM_HEIGHT), 0),
        Math.max(data.length - 1, 0),
      ),
    [data.length],
  );

  const commitSelection = useCallback(
    (offset: number) => {
      if (data.length === 0) return;

      const index = getIndexFromOffset(offset);
      const selectedItem = data[index];
      isScrollingRef.current = false;
      setSelectedIndex(index);
      flatListRef.current?.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated: true,
      });

      if (value === undefined || !isEqual(selectedItem, value)) {
        onChange?.(selectedItem);
      }
    },
    [data, getIndexFromOffset, isEqual, onChange, value],
  );

  useEffect(() => {
    if (valueIndex < 0 || isScrollingRef.current) return;

    if (valueIndex !== selectedIndex) setSelectedIndex(valueIndex);
    flatListRef.current?.scrollToOffset({
      offset: valueIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, [selectedIndex, valueIndex]);

  useEffect(() => clearSettleTimer, [clearSettleTimer]);

  const handleScroll = (event: ScrollEvent) => {
    if (data.length === 0) return;

    const index = getIndexFromOffset(event.nativeEvent.contentOffset.y);
    if (index === selectedIndex) return;

    setSelectedIndex(index);
    if (isScrollingRef.current) onChange?.(data[index]);
  };

  const handleScrollEndDrag = (event: ScrollEvent) => {
    const offset = event.nativeEvent.contentOffset.y;
    clearSettleTimer();
    settleTimerRef.current = setTimeout(
      () => commitSelection(offset),
      SETTLE_DELAY_MS,
    );
  };

  const handleMomentumScrollEnd = (event: ScrollEvent) => {
    clearSettleTimer();
    commitSelection(event.nativeEvent.contentOffset.y);
  };

  return (
    <View style={{ height: PICKER_HEIGHT }} className="justify-center">
      <View
        className="absolute left-4 right-4 rounded-xl bg-gray-200"
        style={{
          height: ITEM_HEIGHT,
          top: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
        }}
      />

      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={keyExtractor ?? ((_, index) => index.toString())}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{
          paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
        }}
        onScrollBeginDrag={() => {
          isScrollingRef.current = true;
          clearSettleTimer();
        }}
        onMomentumScrollBegin={clearSettleTimer}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
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
              className="items-center justify-center"
            >
              <Text
                className={`text-lg ${
                  isActive ? "font-bold text-gray-900" : "text-gray-400"
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
