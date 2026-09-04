import ContainerPage from "@/components/ui/container-page";
import { DailyChallengeView } from "@/components/workout/daily-challenge";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isHoliday: boolean;
}

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDate = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const getCalendarDays = (month: Date): CalendarDay[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const firstDayIndex = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cellCount = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, monthIndex, index - firstDayIndex + 1);

    return {
      date,
      isCurrentMonth: date.getMonth() === monthIndex,
      isHoliday: date.getDay() === 0,
    };
  });
};

const formatMonthYear = (date: Date): string =>
  new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatSelectedDate = (date: Date): string =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const getRelativeDateLabel = (selectedDate: Date, today: Date): string => {
  const differenceInDays = Math.round(
    (startOfDay(selectedDate).getTime() - startOfDay(today).getTime()) /
      86_400_000,
  );

  if (differenceInDays === 0) return "Hari ini";
  if (differenceInDays === 1) return "Besok";
  if (differenceInDays === -1) return "Kemarin";
  return "Tanggal dipilih";
};

export default function CalendarScreen() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const calendarDays = useMemo(
    () => getCalendarDays(new Date(today.getFullYear(), today.getMonth(), 1)),
    [today],
  );
  const calendarWeeks = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(calendarDays.length / 7) },
        (_, weekIndex) => calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7),
      ),
    [calendarDays],
  );

  const selectDay = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  const goToToday = () => {
    setSelectedDate(today);
  };

  return (
    <ContainerPage
      titleHeader="Kalender"
      titleContent="Lihat tanggal dan agenda"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <View className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
          <View className="bg-purple-600 px-5 py-5">
            <View className="items-center">
              <Text className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                Kalender Bulan Ini
              </Text>
              <Text className="mt-1 text-xl font-bold capitalize text-white">
                {formatMonthYear(today)}
              </Text>
            </View>

            <Pressable
              onPress={goToToday}
              className="mt-4 flex-row items-center justify-center self-center rounded-full bg-white/15 px-4 py-2"
            >
              <Ionicons name="today-outline" size={16} color="#FFFFFF" />
              <Text className="ml-2 text-xs font-bold text-white">
                Lihat Hari Ini
              </Text>
            </Pressable>
          </View>

          <View className="px-3 pb-5 pt-4">
            <View className="flex-row">
              {DAY_NAMES.map((dayName, index) => (
                <View key={dayName} className="flex-1 items-center py-2">
                  <Text
                    className={`text-xs font-bold ${
                      index === DAY_NAMES.length - 1
                        ? "text-pink-500"
                        : "text-slate-400"
                    }`}
                  >
                    {dayName}
                  </Text>
                </View>
              ))}
            </View>

            <View>
              {calendarWeeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} className="flex-row">
                  {week.map((day) => {
                    const dayKey = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`;

                    if (!day.isCurrentMonth) {
                      return <View key={dayKey} className="h-12 flex-1" />;
                    }

                    const isToday = isSameDate(day.date, today);
                    const isSelected = isSameDate(day.date, selectedDate);

                    return (
                      <Pressable
                        key={dayKey}
                        accessibilityRole="button"
                        accessibilityLabel={`${formatSelectedDate(day.date)}${
                          day.isHoliday ? ", hari libur" : ""
                        }`}
                        onPress={() => selectDay(day)}
                        className="h-12 flex-1 items-center justify-center"
                      >
                        <View
                          className={`h-10 w-10 items-center justify-center rounded-full ${
                            isSelected
                              ? day.isHoliday
                                ? "bg-red-500"
                                : "bg-purple-600"
                              : isToday
                                ? day.isHoliday
                                  ? "border border-red-400 bg-red-50"
                                  : "border border-purple-400 bg-purple-50"
                                : "bg-transparent"
                          }`}
                        >
                          <Text
                            className={`text-sm font-semibold ${
                              isSelected
                                ? "text-white"
                                : day.isHoliday
                                  ? "text-red-500"
                                  : isToday
                                    ? "text-purple-700"
                                    : "text-slate-700"
                            }`}
                          >
                            {day.date.getDate()}
                          </Text>
                          {isToday && !isSelected && (
                            <View
                              className={`absolute bottom-1 h-1 w-1 rounded-full ${
                                day.isHoliday ? "bg-red-500" : "bg-purple-600"
                              }`}
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

            <View className="mt-3 flex-row items-center justify-center border-t border-slate-100 pt-4">
              <View className="h-3 w-3 rounded-full bg-purple-600" />
              <Text className="ml-2 text-xs text-slate-500">Dipilih</Text>
              <View className="ml-5 h-3 w-3 rounded-full border border-purple-400 bg-purple-50" />
              <Text className="ml-2 text-xs text-slate-500">Hari ini</Text>
              <View className="ml-5 h-3 w-3 rounded-full bg-red-500" />
              <Text className="ml-2 text-xs text-slate-500">Hari libur</Text>
            </View>
          </View>
        </View>

        <View className="mt-5 overflow-hidden rounded-3xl bg-purple-50">
          <View className="flex-row items-center p-5">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-purple-600">
              <Text className="text-xs font-semibold uppercase text-purple-200">
                {new Intl.DateTimeFormat("id-ID", { month: "short" }).format(
                  selectedDate,
                )}
              </Text>
              <Text className="text-2xl font-bold text-white">
                {selectedDate.getDate()}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <View className="self-start rounded-full bg-purple-100 px-3 py-1">
                <Text className="text-xs font-bold text-purple-700">
                  {getRelativeDateLabel(selectedDate, today)}
                </Text>
              </View>
              <Text className="mt-2 font-bold capitalize leading-5 text-slate-900">
                {formatSelectedDate(selectedDate)}
              </Text>
            </View>
          </View>

          {!isSameDate(selectedDate, today) && (
            <Pressable
              onPress={goToToday}
              className="flex-row items-center justify-center border-t border-purple-100 bg-white/60 py-3.5"
            >
              <Ionicons name="locate-outline" size={18} color="#6F3FA0" />
              <Text className="ml-2 font-bold text-purple-700">
                Kembali ke Hari Ini
              </Text>
            </Pressable>
          )}
        </View>

        <View className="mb-1 mt-7 flex-row items-center justify-between px-1">
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <Ionicons name="barbell-outline" size={21} color="#6F3FA0" />
            </View>
            <View className="ml-3">
              <Text className="text-lg font-bold text-slate-900">
                Daily Challenge
              </Text>
              <Text className="mt-0.5 text-xs text-slate-500">
                Challenge pada tanggal terpilih
              </Text>
            </View>
          </View>
        </View>

        <DailyChallengeView challengeDate={selectedDate} />

        <View className="mt-5 flex-row items-start rounded-2xl bg-slate-50 px-4 py-4">
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#64748B"
          />
          <Text className="ml-3 flex-1 text-sm leading-5 text-slate-500">
            Ketuk tanggal untuk melihat challenge pada hari tersebut. Kalender
            hanya menampilkan bulan berjalan.
          </Text>
        </View>
      </ScrollView>
    </ContainerPage>
  );
}
