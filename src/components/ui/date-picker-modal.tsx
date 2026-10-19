import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface DatePickerModalProps {
  eyebrow?: string;
  maximumDate?: Date;
  onCancel: () => void;
  onSelect: (date: Date) => void;
  selectedDate: Date;
  title?: string;
  visible: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const isSameDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const getCalendarDays = (month: Date): CalendarDay[] => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      isCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
};

const DatePickerModal = ({
  eyebrow = "Tanggal Point",
  maximumDate,
  onCancel,
  onSelect,
  selectedDate,
  title = "Pilih Tanggal",
  visible,
}: DatePickerModalProps) => {
  const [displayedMonth, setDisplayedMonth] = React.useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  React.useEffect(() => {
    if (!visible) return;
    setDisplayedMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
  }, [selectedDate, visible]);

  const calendarDays = React.useMemo(
    () => getCalendarDays(displayedMonth),
    [displayedMonth],
  );
  const maximumDay = maximumDate
    ? new Date(
        maximumDate.getFullYear(),
        maximumDate.getMonth(),
        maximumDate.getDate(),
      )
    : undefined;
  const nextMonth = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth() + 1,
    1,
  );
  const isNextMonthDisabled = Boolean(
    maximumDay &&
    nextMonth > new Date(maximumDay.getFullYear(), maximumDay.getMonth(), 1),
  );

  const changeMonth = (offset: number) => {
    setDisplayedMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/45 px-5">
        <View className="w-full max-w-md rounded-3xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                {eyebrow}
              </Text>
              <Text className="mt-1 text-xl font-black text-slate-900">
                {title}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup pemilih tanggal"
              onPress={onCancel}
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
            >
              <Ionicons name="close" size={21} color="#475569" />
            </Pressable>
          </View>

          <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-purple-50 px-3 py-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bulan sebelumnya"
              onPress={() => changeMonth(-1)}
              className="h-10 w-10 items-center justify-center rounded-xl bg-white"
            >
              <Ionicons name="chevron-back" size={20} color="#6F3FA0" />
            </Pressable>
            <Text className="font-bold capitalize text-purple-900">
              {new Intl.DateTimeFormat("id-ID", {
                month: "long",
                year: "numeric",
              }).format(displayedMonth)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bulan berikutnya"
              disabled={isNextMonthDisabled}
              onPress={() => changeMonth(1)}
              className={`h-10 w-10 items-center justify-center rounded-xl bg-white ${
                isNextMonthDisabled ? "opacity-30" : ""
              }`}
            >
              <Ionicons name="chevron-forward" size={20} color="#6F3FA0" />
            </Pressable>
          </View>

          <View className="mt-4 flex-row">
            {DAY_LABELS.map((label) => (
              <Text
                key={label}
                className="flex-1 text-center text-[11px] font-bold text-slate-400"
              >
                {label}
              </Text>
            ))}
          </View>

          <View className="mt-2 flex-row flex-wrap">
            {calendarDays.map(({ date, isCurrentMonth }) => {
              const isSelected = isSameDay(date, selectedDate);
              const isDisabled = Boolean(maximumDay && date > maximumDay);

              return (
                <View
                  key={date.toISOString()}
                  style={{ width: "14.2857%" }}
                  className="items-center py-1"
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "full",
                    }).format(date)}
                    disabled={isDisabled}
                    onPress={() => onSelect(date)}
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      isSelected ? "bg-purple-700" : ""
                    } ${isDisabled ? "opacity-20" : ""}`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected
                          ? "text-white"
                          : isCurrentMonth
                            ? "text-slate-800"
                            : "text-slate-300"
                      }`}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DatePickerModal;
