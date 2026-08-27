import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import { useListMember } from "@/hooks/useMember";
import { imageProfileURL } from "@/services/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import moment from "moment";
import React, { useState } from "react";

import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

import { useMemberAppointmentByStaffId } from "@/hooks/useWeighMeasure";
import dayjs from "dayjs";

type Props = {
  item: any;
  onPress: () => void;
};

function WeighMeasureCard({ item, onPress }: Props) {
  const today = dayjs();
  const appDate = dayjs(item.app_date);

  const diff = appDate.diff(today, "day");
  const canInput =
    !item.status &&
    !dayjs().startOf("day").isBefore(dayjs(item.app_date).startOf("day"));
  const getStatus = () => {
    if (item.status)
      return {
        color: "#22C55E",
        bg: "#DCFCE7",
        text: "Sudah Ditimbang",
      };

    if (diff < 0)
      return {
        color: "#EF4444",
        bg: "#FEE2E2",
        text: `Terlambat ${Math.abs(diff)} Hari`,
      };

    if (diff === 0)
      return {
        color: "#F59E0B",
        bg: "#FEF3C7",
        text: "Hari Ini",
      };

    if (diff === 1)
      return {
        color: "#3B82F6",
        bg: "#DBEAFE",
        text: "Besok",
      };

    return {
      color: "#8B5CF6",
      bg: "#F3E8FF",
      text: `${diff} Hari Lagi`,
    };
  };

  const status = getStatus();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-white rounded-2xl p-4 shadow-sm mb-4 mx-2"
    >
      {/* Header */}
      <View className="flex-row">
        <Image
          source={{
            uri: "https://i.pravatar.cc/150?img=10",
          }}
          className="w-16 h-16 rounded-full"
        />

        <View className="flex-1 ml-4">
          <Text className="text-xl font-bold text-gray-800">
            {item.user.name}
          </Text>

          <View
            className="self-start mt-2 px-3 py-1 rounded-full"
            style={{
              backgroundColor: status.bg,
            }}
          >
            <Text
              style={{
                color: status.color,
              }}
              className="font-semibold"
            >
              {status.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}

      <View className="h-px bg-gray-200 my-5" />

      {/* Date */}

      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />

          <Text className="ml-2 text-gray-600">
            {dayjs(item.app_date).format("DD MMM YYYY")}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={18} color="#8B5CF6" />

          <Text className="ml-2 text-gray-600">
            {item.app_hour.slice(0, 5)}
          </Text>
        </View>
      </View>

      {/* Status */}

      <View className="flex-row items-center mt-4">
        <MaterialCommunityIcons
          name={item.status ? "check-circle" : "clock-outline"}
          size={20}
          color={item.status ? "#22C55E" : "#F59E0B"}
        />

        <Text className="ml-2 text-gray-700">
          {item.status
            ? "Weigh Measure Sudah Diisi"
            : "Menunggu Input Weigh Measure"}
        </Text>
      </View>

      {/* Button */}

      <TouchableOpacity
        disabled={!canInput}
        onPress={onPress}
        activeOpacity={0.8}
        className={`mt-5 rounded-2xl py-4 items-center ${
          canInput ? "bg-purple-600" : "bg-gray-300"
        }`}
      >
        <Text
          className={`font-bold text-base ${
            canInput ? "text-white" : "text-gray-500"
          }`}
        >
          {item.status
            ? "Lihat Weigh Measure"
            : canInput
              ? "Input Weigh Measure"
              : "Belum Bisa Input"}
        </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
        onPress={onPress}
        className="mt-5 rounded-2xl py-4 items-center"
        style={{
          backgroundColor: "#8B2CF5",
        }}
      >
        <Text className="text-white font-bold text-base">
          Input Weigh Measure
        </Text>
      </TouchableOpacity> */}
    </TouchableOpacity>
  );
}
const tshirt = (size: number) => {
  switch (size) {
    case 1:
      return "S";
    case 2:
      return "M";
    case 3:
      return "L";
    case 4:
      return "XL";
    case 5:
      return "XXL";
    default:
      return "-";
  }
};

const WorkoutMemberCard = ({ item, onDetail, onWorkout }: any) => {
  const duration = moment.duration(moment().diff(moment(item.workout_date)));

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 mx-2">
      <View className="bg-white dark:bg-zinc-900 rounded-3xl shadow mb-5 overflow-hidden">
        {/* Header */}

        <View className="p-5">
          <View className="flex-row">
            {/* Avatar */}

            {item.user.photo ? (
              <Image
                source={{
                  uri: item.user.photo,
                }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-950 items-center justify-center">
                <MaterialCommunityIcons
                  name="account"
                  size={34}
                  color="#6F3FA0"
                />
              </View>
            )}

            <View className="flex-1 ml-4">
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className="font-bold text-lg text-gray-900 dark:text-white">
                    {item.user.name}
                  </Text>

                  <Text className="text-gray-500 dark:text-gray-400 mt-1">
                    {item.club.club_name}
                  </Text>
                </View>

                <View className="bg-green-500 px-3 py-1 rounded-full self-start">
                  <Text className="text-white font-bold text-xs">LIVE</Text>
                </View>
              </View>

              <View className="flex-row mt-4">
                <View className="flex-1">
                  <Text className="text-xs text-gray-400">Check In</Text>

                  <Text className="font-semibold dark:text-white">
                    {moment(item.workout_date).format("HH:mm")} WIB
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-gray-400">Durasi</Text>

                  <Text className="font-semibold text-[#6F3FA0]">
                    {duration.hours()}j {duration.minutes()}m
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}

        <View className="border-t border-gray-100 dark:border-zinc-800 flex-row">
          <TouchableOpacity
            className="flex-1 py-4 items-center"
            onPress={() => onDetail(item)}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="#6F3FA0"
            />

            <Text className="mt-1 text-[#6F3FA0] font-semibold">Detail</Text>
          </TouchableOpacity>

          <View className="w-px bg-gray-200 dark:bg-zinc-700" />

          <TouchableOpacity
            className="flex-1 py-4 items-center"
            onPress={() => onWorkout(item)}
          >
            <MaterialCommunityIcons name="dumbbell" size={22} color="#6F3FA0" />

            <Text className="mt-1 text-[#6F3FA0] font-semibold">Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
function MemberCard({
  item,
  onPress,
  onMeasurement,
}: {
  item: any;
  onPress: () => void;
  onMeasurement: () => void;
}) {
  // const onDetailInfo = (data: any) => {
  //   onDetail(data);
  // };
  return (
    <View className="bg-white dark:bg-zinc-900 rounded-[30px] overflow-hidden shadow-lg mb-5">
      {/* Header */}

      <View className="bg-[#6F3FA0] px-5 py-5">
        <View className="flex-row">
          {/* Avatar */}

          {item.photo ? (
            <Image
              source={{ uri: imageProfileURL(item.photo) }}
              className="w-20 h-20 rounded-full border-4 border-white"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-white justify-center items-center">
              <MaterialCommunityIcons
                name="account"
                size={42}
                color="#6F3FA0"
              />
            </View>
          )}

          <View className="flex-1 ml-4">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold">
                  {item.user.name}
                </Text>

                <Text className="text-violet-100 mt-1">
                  Member {item.flag} •{" "}
                  {item.sex == "F" ? "Perempuan" : "Laki-laki"}
                </Text>
              </View>

              <View className="bg-green-500 px-3 py-1 rounded-full self-start">
                <Text className="text-white text-xs font-bold">ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Body */}

      <View className="p-5">
        {/* Info Card */}

        <View className="flex-row justify-between">
          <View className="bg-violet-50 dark:bg-violet-950 rounded-2xl p-4 flex-1 mr-2">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">
              KEY TAG
            </Text>

            <Text className="font-bold text-lg dark:text-white mt-1">
              {item.key_tag_id}
            </Text>
          </View>

          <View className="bg-violet-50 dark:bg-violet-950 rounded-2xl p-4 flex-1 ml-2">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">
              T-SHIRT
            </Text>

            <Text className="font-bold text-lg dark:text-white mt-1">
              {tshirt(item.tshirt_size)}
            </Text>
          </View>
        </View>

        {/* Contact */}

        <View className="mt-5 space-y-4">
          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={18} color="#6F3FA0" />

            <Text className="ml-3 text-gray-700 dark:text-gray-300">
              {item.phone}
            </Text>
          </View>

          <View className="flex-row">
            <Ionicons name="location-outline" size={18} color="#6F3FA0" />

            <Text
              numberOfLines={2}
              className="ml-3 flex-1 text-gray-700 dark:text-gray-300"
            >
              {item.address}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#6F3FA0" />

            <Text className="ml-3 text-gray-700 dark:text-gray-300">
              Bergabung {moment(item.joined).format("DD MMM YYYY")}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}

      <View className="border-t border-gray-100 dark:border-zinc-800 flex-row">
        <TouchableOpacity
          onPress={onPress}
          className="flex-1 py-4 items-center"
        >
          <Text className="text-[#6F3FA0] font-bold">Detail</Text>
        </TouchableOpacity>

        <View className="w-px bg-gray-200 dark:bg-zinc-700" />

        <TouchableOpacity
          onPress={onMeasurement}
          className="flex-1 py-4 items-center"
        >
          <Text className="text-[#6F3FA0] font-bold">Penimbangan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
export default function ListMemberWMToday() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: listMembers, isLoading: isLoadingPromo } = useListMember();
  console.log("listMembers", listMembers);
  const {
    mutate: memberWorkoutFn,
    data: memberWorkoutData,
    isPending: isPendingMemberWorkout,
  } = useMemberAppointmentByStaffId();

  React.useEffect(() => {
    async function getMemberWO() {
      await memberWorkoutFn(user._id);
    }
    getMemberWO();
  }, []);
  const [search, setSearch] = useState("");
  const onDetail = (data: any) => {
    router.push({
      pathname: "/user/input-wm",
      params: {
        id: user._id,
      },
    });
  };
  const onMeasure = (data: any) => {
    router.push({
      pathname: `/list-member/wm/[id]`,
      params: {
        id: data.user_id,
      },
    });
  };
  // const filteredData = React.useMemo(() => {
  //   if (!search && memberWorkoutData) return memberWorkoutData.response;

  //   return memberWorkoutData.response.filter((item: any) => {
  //     const keyword = search.toLowerCase();

  //     return (
  //       item.user.name.toLowerCase().includes(keyword) ||
  //       item.user.email.toLowerCase().includes(keyword)
  //     );
  //   });
  // }, [search]);
  if (isPendingMemberWorkout || !memberWorkoutData) {
    return <LoadingView />;
  }

  //   console.log("filteredData -sss", filteredData);

  // 🔥 generate bulan (dinamis)

  return (
    <>
      <ContainerPage titleHeader="List Member WM" titleContent="List Member WM">
        {/* <View className="flex-row justify-between mt-4">
          <View className="bg-[#6F3FA0] flex-1 rounded-3xl p-5 mr-2">
            <MaterialCommunityIcons
              name="account-group"
              size={26}
              color="white"
            />

            <Text className="text-3xl font-bold text-white mt-3">10</Text>

            <Text className="text-violet-200">Workout Hari Ini</Text>
          </View>

          <View className="bg-green-500 flex-1 rounded-3xl p-5 ml-2">
            <MaterialCommunityIcons name="dumbbell" size={26} color="white" />

            <Text className="text-3xl font-bold text-white mt-3">20</Text>

            <Text className="text-green-100">Sedang Workout</Text>
          </View>
        </View> */}
        {/* <View className="mx-5 mt-4 mb-2">
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100">
            <Ionicons name="search-outline" size={22} color="#9CA3AF" />

            <TextInput
              placeholder="Cari Member..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-3 text-base text-gray-800"
            />
          </View>
        </View> */}
        {memberWorkoutData && (
          <FlatList
            data={memberWorkoutData ? memberWorkoutData.response : []}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 15,
              paddingBottom: 120,
            }}
            renderItem={({ item }) => (
              <WeighMeasureCard
                item={item}
                onPress={() => onDetail(item)}
                // onWorkout={() => onMeasure(item)}
              />
            )}
          />
        )}
      </ContainerPage>
    </>
  );
}
