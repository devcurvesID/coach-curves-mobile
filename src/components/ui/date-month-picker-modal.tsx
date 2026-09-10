import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import WheelPicker from "./wheel-picker";

interface DateMonthValue {
  year: number;
  month: number;
  month_value: string;
}

interface DateMonthPickerModalProps {
  onSelect: (data: DateMonthValue) => void;
  joined_year: number;
  onCancel: () => void;
  visible: boolean;
  selectedYear?: number;
  selectedMonth?: number;
}

interface MonthOption {
  label: string;
  value: number;
}

const getMonthLabel = (month: number): string =>
  new Date(2000, month - 1, 1).toLocaleString("id-ID", {
    month: "long",
  });

const DateMonthPickerModal = ({
  onSelect,
  onCancel,
  joined_year,
  visible,
  selectedYear,
  selectedMonth,
}: DateMonthPickerModalProps) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [tempYear, setTempYear] = React.useState<number>(currentYear);
  const [tempMonth, setTempMonth] = React.useState<number>(currentMonth);

  React.useEffect(() => {
    if (!visible) return;

    const year = selectedYear ?? currentYear;
    const month = selectedMonth ?? currentMonth;

    setTempYear(year);
    setTempMonth(month);
  }, [currentMonth, currentYear, selectedMonth, selectedYear, visible]);

  const years = React.useMemo(() => {
    const values: number[] = [];
    for (let year = currentYear; year >= joined_year; year--) {
      values.push(year);
    }
    return values;
  }, [currentYear, joined_year]);

  const months = React.useMemo(() => {
    const maxMonth = tempYear === currentYear ? currentMonth : 12;
    const values: MonthOption[] = [];

    for (let month = 1; month <= maxMonth; month++) {
      values.push({ label: getMonthLabel(month), value: month });
    }
    return values;
  }, [currentMonth, currentYear, tempYear]);

  React.useEffect(() => {
    if (tempYear === currentYear && tempMonth > currentMonth) {
      setTempMonth(currentMonth);
    }
  }, [currentMonth, currentYear, tempMonth, tempYear]);

  const selectDate = () => {
    onSelect({
      year: tempYear,
      month: tempMonth,
      month_value: getMonthLabel(tempMonth),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/30">
        <View className="rounded-t-[20px] bg-white p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Batalkan pemilihan periode"
              onPress={onCancel}
            >
              <Text className="text-red-500">Batal</Text>
            </TouchableOpacity>

            <Text className="text-lg font-bold">Pilih Tanggal</Text>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Gunakan periode terpilih"
              onPress={selectDate}
            >
              <Text className="font-semibold text-purple-600">Pilih</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center rounded-2xl bg-purple-50 px-4 py-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-purple-500">
              Periode dipilih
            </Text>
            <Text className="mt-1 text-lg font-bold text-purple-900">
              {getMonthLabel(tempMonth)} {tempYear}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1">
              <WheelPicker
                data={years}
                value={tempYear}
                keyExtractor={(year) => year.toString()}
                onChange={setTempYear}
                renderLabel={(year) => year.toString()}
              />
            </View>

            <View className="flex-1">
              <WheelPicker
                data={months}
                value={months.find((month) => month.value === tempMonth)}
                keyExtractor={(month) => month.value.toString()}
                isEqual={(month, value) => month.value === value.value}
                onChange={(month) => setTempMonth(month.value)}
                renderLabel={(month) => month.label}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateMonthPickerModal;
