import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WheelPicker from "./wheel-picker";

interface IDatePicker {
  onSelect: (data: {
    year: number;
    month: number;
    month_value: string;
  }) => void;
  joined_year: number;
  selectedYear?: number;
  selectedMonth?: number;
  onCancel: () => void;
  visible: boolean;
}

const DateMonthPickerModal = ({
  onSelect,
  onCancel,
  joined_year,
  selectedYear = new Date().getFullYear(),
  selectedMonth = new Date().getMonth() + 1,
  visible,
}: IDatePicker) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [tempYear, setTempYear] = React.useState(selectedYear);
  const [tempMonth, setTempMonth] = React.useState(selectedMonth);
  const [labelMonth, setLabelMonth] = React.useState<string>(
    new Date(0, selectedMonth - 1).toLocaleString("id-ID", {
      month: "long",
    }),
  );

  const years = React.useMemo(() => {
    const arr = [];
    const firstYear = Number.isFinite(joined_year)
      ? Math.min(joined_year, currentYear)
      : currentYear;
    for (let y = currentYear; y >= firstYear; y--) {
      // arr.push({ label: `${y}`, value: y });
      arr.push(y);
    }
    return arr;
  }, [currentYear, joined_year]);

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

  React.useEffect(() => {
    if (!visible) return;
    const safeYear = Math.min(selectedYear, currentYear);
    const maxMonth = safeYear === currentYear ? currentMonth : 12;
    const safeMonth = Math.min(Math.max(selectedMonth, 1), maxMonth);
    setTempYear(safeYear);
    setTempMonth(safeMonth);
    setLabelMonth(
      new Date(0, safeMonth - 1).toLocaleString("id-ID", { month: "long" }),
    );
  }, [currentMonth, currentYear, selectedMonth, selectedYear, visible]);

  React.useEffect(() => {
    if (tempYear === currentYear && tempMonth > currentMonth) {
      setTempMonth(currentMonth);
      setLabelMonth(
        new Date(0, currentMonth - 1).toLocaleString("id-ID", {
          month: "long",
        }),
      );
    }
  }, [currentMonth, currentYear, tempMonth, tempYear]);

  const onSelectDate = async () => {
    onSelect({ year: tempYear, month: tempMonth, month_value: labelMonth });
    //   onPress();
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
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
                value={tempYear}
                onChange={(val) => setTempYear(val)}
                renderLabel={(item) => item.toString()}
              />
            </View>
            <View className="flex-1">
              <WheelPicker
                data={months}
                value={months.find((month) => month.value === tempMonth)}
                onChange={(val) => {
                  setTempMonth(val.value);
                  setLabelMonth(val.label);
                }}
                renderLabel={(item) => item.label}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateMonthPickerModal;

const styles = StyleSheet.create({});
