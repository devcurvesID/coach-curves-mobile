import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomSheetComponent, { BottomSheetRefProps } from "./bottom-sheet";
import WheelPicker from "./wheel-picker";

interface IDatePicker {
  onSelect: (data: any) => void;
  joined_year: number;
  onCancel: () => void;
}

const DateMonthPicker = React.forwardRef<BottomSheetRefProps, IDatePicker>(
  ({ onSelect, onCancel, joined_year }, ref) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const [tempYear, setTempYear] = React.useState(currentYear);
    const [tempMonth, setTempMonth] = React.useState(currentMonth);
    const [labelMonth, setLabelMonth] = React.useState<string>(
      new Date(0, currentMonth - 1).toLocaleString("id-ID", {
        month: "long",
      }),
    );

    const years = React.useMemo(() => {
      const arr = [];
      for (let y = currentYear; y >= joined_year; y--) {
        // arr.push({ label: `${y}`, value: y });
        arr.push(y);
      }
      return arr;
    }, []);

    // 🔥 generate bulan (dinamis)
    const months = React.useMemo(() => {
      const maxMonth = tempYear === currentYear ? currentMonth : 12;

      const arr = [];
      for (let m = 1; m <= maxMonth; m++) {
        arr.push({
          label: new Date(0, m - 1).toLocaleString("id-ID", {
            month: "long",
          }),
          value: m,
        });
      }
      return arr;
    }, [tempYear]);

    if (tempYear === currentYear && tempMonth > currentMonth) {
      setTempMonth(currentMonth);
    }

    const onSelectDate = async () => {
      onSelect({ year: tempYear, month: tempMonth, month_value: labelMonth });
      //   onPress();
    };
    return (
      <BottomSheetComponent ref={ref}>
        <View className="flex-1 p-4 bg-white">
          {/* HEADER */}
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={onCancel}>
              <Text className="text-red-500">Batal</Text>
            </TouchableOpacity>

            <Text className="font-bold text-lg">Pilih Tanggal</Text>

            <TouchableOpacity onPress={onSelectDate}>
              <Text className="text-purple-600 font-semibold">Pilih</Text>
            </TouchableOpacity>
          </View>
          {/* PICKER */}
          <View className="flex-row justify-between">
            <View className="flex-1">
              <WheelPicker
                data={years}
                value={currentYear}
                onChange={(val) => setTempYear(val)}
                renderLabel={(item) => item.toString()}
              />
            </View>
            <View className="flex-1">
              <WheelPicker
                data={months}
                value={months[currentMonth]}
                onChange={(val) => {
                  setTempMonth(val.value);
                  setLabelMonth(val.label);
                }}
                renderLabel={(item) => item.label}
              />
            </View>
          </View>
        </View>
      </BottomSheetComponent>
    );
  },
);
export default DateMonthPicker;

const styles = StyleSheet.create({});
