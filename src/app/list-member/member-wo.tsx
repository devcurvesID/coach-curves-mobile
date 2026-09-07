import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import RankOneCard, {
  type RankOneCardData,
} from "@/components/workout/rank-one-card";
import { useAuth } from "@/context/auth";
import { getMemberFlag, MONTHLY_WORKOUT_TARGET } from "@/helpers/member-flag";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import { useWeighMeasureProgressByUserId } from "@/hooks/useWeighMeasure";
import {
  useMemberWorkoutToday,
  useWorkoutHistoryByUserId,
} from "@/hooks/useWorkout";
import { imageProfileURL } from "@/services/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface WorkoutUser {
  name: string;
  email?: string | null;
  photo?: string | null;
}

interface WorkoutClub {
  club_name?: string | null;
}

interface WorkoutMember {
  _id: string;
  user_id: string;
  created_at: string;
  user: WorkoutUser;
  club?: WorkoutClub | null;
  key_tag_id?: string | null;
}

interface WorkoutHistoryRecord {
  workout_date: string;
}

interface MemberWeighMeasureProgress {
  current?: {
    weigh_diff?: string | number | null;
    size_diff?: string | number | null;
    body_fat_diff?: string | number | null;
    wo_count?: number | null;
  } | null;
}

interface WorkoutMemberDetail {
  photo?: string | null;
  key_tag_id?: string | number | null;
  user?: {
    name?: string | null;
  } | null;
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getPhotoUrl = (photo: string): string =>
  /^https?:\/\//i.test(photo) ? photo : imageProfileURL(photo);

function MemberAvatar({
  name,
  photo,
}: {
  name: string;
  photo?: string | null;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  if (photo && !hasImageError) {
    return (
      <Image
        source={{ uri: getPhotoUrl(photo) }}
        accessibilityLabel={`Foto profil ${name}`}
        resizeMode="cover"
        onError={() => setHasImageError(true)}
        className="h-16 w-16 rounded-2xl bg-violet-100"
      />
    );
  }

  return (
    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
      <Text className="text-xl font-bold text-[#6F3FA0]">
        {getInitials(name)}
      </Text>
    </View>
  );
}

interface WorkoutMemberCardProps {
  member: WorkoutMember;
  onMeasurement: () => void;
}

function WorkoutMemberCard({ member, onMeasurement }: WorkoutMemberCardProps) {
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const checkInTime = moment(member.created_at);
  const {
    mutate: loadWorkoutHistoryByUserId,
    data: workoutHistory,
    isPending: isLoadingWorkoutHistory,
    isError: isWorkoutHistoryError,
  } = useWorkoutHistoryByUserId();
  const {
    mutate: loadMemberDetail,
    data: memberDetailData,
    isPending: isLoadingMemberDetail,
    isError: isMemberDetailError,
  } = useDetailMemberByUserId();
  const {
    mutate: loadWeighMeasureProgress,
    data: weighMeasureProgressData,
    isPending: isLoadingWeighMeasureProgress,
    isError: isWeighMeasureProgressError,
  } = useWeighMeasureProgressByUserId();

  React.useEffect(() => {
    const currentDate = new Date();
    loadWorkoutHistoryByUserId({
      user_id: member.user_id,
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
    });
    loadMemberDetail(member.user_id);
  }, [loadMemberDetail, loadWorkoutHistoryByUserId, member.user_id]);

  const memberDetail = memberDetailData as WorkoutMemberDetail | undefined;
  const memberName =
    memberDetail?.user?.name?.trim() || member.user.name || "Member";
  const memberPhoto = memberDetail?.photo?.trim() || member.user.photo;
  const keyTagId = memberDetail?.key_tag_id ?? member.key_tag_id;

  const currentDate = new Date();
  const workoutRecords = (workoutHistory ?? []) as WorkoutHistoryRecord[];
  const monthlyWorkoutCount = workoutRecords.filter((workout) => {
    const workoutDate = new Date(workout.workout_date);
    return (
      !Number.isNaN(workoutDate.getTime()) &&
      workoutDate.getFullYear() === currentDate.getFullYear() &&
      workoutDate.getMonth() === currentDate.getMonth()
    );
  }).length;
  const memberFlag = getMemberFlag(monthlyWorkoutCount);
  const remainingWorkouts = Math.max(
    MONTHLY_WORKOUT_TARGET - monthlyWorkoutCount,
    0,
  );
  const weighMeasureProgress = weighMeasureProgressData as
    MemberWeighMeasureProgress | undefined;
  const currentWeighMeasure = weighMeasureProgress?.current;
  const rankCardData: RankOneCardData = {
    club: { club_name: member.club?.club_name || "Club tidak tersedia" },
    weigh_diff: currentWeighMeasure?.weigh_diff ?? 0,
    size_diff: currentWeighMeasure?.size_diff ?? 0,
    body_fat_diff: currentWeighMeasure?.body_fat_diff ?? 0,
    wo_count: currentWeighMeasure?.wo_count ?? monthlyWorkoutCount,
  };

  const openResultModal = () => {
    setIsResultModalVisible(true);
    loadWeighMeasureProgress(member.user_id);
  };

  const closeResultModal = () => {
    if (!isLoadingWeighMeasureProgress) setIsResultModalVisible(false);
  };

  const openMeasurementResult = () => {
    setIsResultModalVisible(false);
    onMeasurement();
  };

  return (
    <>
      <View className="mx-5 mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <View className="p-5">
          <View className="flex-row items-start">
            <MemberAvatar
              key={memberPhoto || "no-photo"}
              name={memberName}
              photo={memberPhoto}
            />

            <View className="ml-4 flex-1">
              <View className="flex-row items-start justify-between">
                <View className="mr-2 flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-lg font-bold text-gray-900 dark:text-white"
                  >
                    {memberName}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                  >
                    {member.club?.club_name || "Club tidak tersedia"}
                  </Text>
                </View>

                <View className="flex-row items-center rounded-full bg-green-50 px-2.5 py-1 dark:bg-green-950">
                  <View className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />
                  <Text className="text-[10px] font-bold text-green-700 dark:text-green-300">
                    WORKOUT
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-5 flex-row rounded-2xl bg-violet-50 p-4 dark:bg-violet-950">
            <View className="flex-1 border-r border-violet-200 pr-3 dark:border-violet-800">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                CHECK-IN
              </Text>
              <View className="mt-1.5 flex-row items-center">
                <Ionicons name="time-outline" size={17} color="#6F3FA0" />
                <Text className="ml-1.5 font-bold text-gray-900 dark:text-white">
                  {checkInTime.isValid() ? checkInTime.format("HH:mm") : "-"}{" "}
                  WIB
                </Text>
              </View>
            </View>

            <View className="flex-1 pl-4">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                ESTIMASI SESI
              </Text>
              <View className="mt-1.5 flex-row items-center">
                <Ionicons name="fitness-outline" size={17} color="#6F3FA0" />
                <Text className="ml-1.5 font-bold text-[#6F3FA0] dark:text-violet-300">
                  30–45 menit
                </Text>
              </View>
            </View>
          </View>

          <View
            className="mt-4 flex-row items-center rounded-2xl px-4 py-3"
            style={{ backgroundColor: memberFlag.backgroundColor }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Ionicons name="flag" size={20} color={memberFlag.color} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-600">STATUS FLAG</Text>
              <Text
                className="mt-0.5 font-bold"
                style={{ color: memberFlag.color }}
              >
                {isLoadingWorkoutHistory
                  ? "Menghitung flag..."
                  : isWorkoutHistoryError
                    ? "Status flag gagal dimuat"
                    : `Flag ${memberFlag.flag} • ${monthlyWorkoutCount} workout bulan ini`}
              </Text>
              {!isLoadingWorkoutHistory && !isWorkoutHistoryError && (
                <Text className="mt-1 text-xs text-gray-600">
                  {remainingWorkouts > 0
                    ? `${remainingWorkouts} workout lagi menuju target ${MONTHLY_WORKOUT_TARGET} sesi`
                    : "Target bulanan tercapai"}
                </Text>
              )}
            </View>
          </View>

          <View className="mt-4 flex-row items-center rounded-xl bg-gray-50 px-3 py-3 dark:bg-zinc-800">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950">
              <Ionicons name="key-outline" size={18} color="#6F3FA0" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                KEY TAG MEMBER
              </Text>
              <Text className="mt-0.5 font-bold text-gray-800 dark:text-white">
                {isLoadingMemberDetail
                  ? "Memuat Key Tag..."
                  : String(keyTagId ?? "").trim() || "Belum tersedia"}
              </Text>
            </View>
            {isMemberDetailError ? (
              <Ionicons name="alert-circle-outline" size={19} color="#DC2626" />
            ) : null}
          </View>
        </View>

        <View className="border-t border-gray-100 dark:border-zinc-800">
          <TouchableOpacity
            onPress={openResultModal}
            accessibilityRole="button"
            accessibilityLabel={`Lihat informasi penimbangan ${memberName}`}
            className="flex-row items-center justify-center bg-violet-50 py-4 dark:bg-violet-950"
          >
            <Ionicons name="scale-outline" size={19} color="#6F3FA0" />
            <Text className="ml-2 font-bold text-[#6F3FA0] dark:text-violet-300">
              Lihat Hasil Penimbangan
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isResultModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeResultModal}
      >
        <View className="flex-1 bg-black/60">
          <Pressable
            accessibilityLabel="Tutup informasi hasil penimbangan"
            className="absolute inset-0"
            onPress={closeResultModal}
          />
          <View className="mt-auto max-h-[92%] rounded-t-[32px] bg-[#F8F7FC] pb-6 dark:bg-zinc-950">
            <View className="flex-row items-center justify-between px-6 pb-2 pt-5">
              <View className="mr-4 flex-1">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Hasil Penimbangan
                </Text>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Resume hasil latihan {memberName}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup modal"
                disabled={isLoadingWeighMeasureProgress}
                onPress={closeResultModal}
                className="h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-zinc-800"
              >
                <Ionicons name="close" size={21} color="#6F3FA0" />
              </Pressable>
            </View>

            {isLoadingWeighMeasureProgress ? (
              <View className="items-center px-8 py-20">
                <ActivityIndicator color="#6F3FA0" />
                <Text className="mt-3 text-sm text-gray-500">
                  Memuat hasil penimbangan...
                </Text>
              </View>
            ) : isWeighMeasureProgressError || !currentWeighMeasure ? (
              <View className="items-center px-8 py-16">
                <View className="rounded-full bg-violet-100 p-5 dark:bg-violet-950">
                  <Ionicons
                    name={
                      isWeighMeasureProgressError
                        ? "alert-circle-outline"
                        : "scale-outline"
                    }
                    size={38}
                    color={isWeighMeasureProgressError ? "#DC2626" : "#6F3FA0"}
                  />
                </View>
                <Text className="mt-4 text-center text-lg font-bold text-gray-900 dark:text-white">
                  {isWeighMeasureProgressError
                    ? "Hasil penimbangan gagal dimuat"
                    : "Hasil penimbangan belum tersedia"}
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
                  {isWeighMeasureProgressError
                    ? "Periksa koneksi lalu coba kembali."
                    : "Member belum memiliki data yang dapat ditampilkan dalam resume."}
                </Text>
                {isWeighMeasureProgressError ? (
                  <Pressable
                    onPress={() => loadWeighMeasureProgress(member.user_id)}
                    className="mt-5 rounded-2xl bg-[#6F3FA0] px-6 py-3"
                  >
                    <Text className="font-bold text-white">Coba Lagi</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <RankOneCard
                  data={rankCardData}
                  member={{ name: memberName, photo: memberPhoto }}
                  detailLabel="Lihat Hasil Penimbangan"
                  onPressDetail={openMeasurementResult}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function ListMemberWOScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const firstClub: unknown = user?.club_id?.[0];
  const clubId =
    typeof firstClub === "string"
      ? firstClub
      : firstClub && typeof firstClub === "object" && "_id" in firstClub
        ? String(firstClub._id)
        : undefined;
  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useMemberWorkoutToday<WorkoutMember>(clubId);

  const workoutMembers = data?.pages.flatMap((page) => page.response) ?? [];
  const workoutTotal = data?.pages[0]?.total;
  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return workoutMembers;

    return workoutMembers.filter((member) =>
      [member.user.name, member.key_tag_id].some((value) =>
        value?.toLowerCase().includes(keyword),
      ),
    );
  }, [search, workoutMembers]);

  const openMeasurement = (member: WorkoutMember) => {
    router.push({
      pathname: "/list-member/wm/[id]",
      params: { id: member.user_id },
    });
  };

  if (isLoading) return <LoadingView />;

  return (
    <ContainerPage titleHeader="Workout Hari Ini" titleContent="Member Workout">
      <View className="mx-5 mb-4 mt-4 overflow-hidden rounded-3xl bg-[#6F3FA0] p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-medium text-violet-200">
              Sedang workout hari ini
            </Text>
            <Text className="mt-1 text-3xl font-bold text-white">
              {workoutTotal ?? workoutMembers.length}
            </Text>
            <Text className="mt-1 text-xs text-violet-200">
              Terakhir diperbarui {moment().format("HH:mm")} WIB
            </Text>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <MaterialCommunityIcons name="dumbbell" size={30} color="white" />
          </View>
        </View>
      </View>

      <View className="mx-5 mb-4">
        <View className="flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />
          <TextInput
            placeholder="Cari nama atau key tag..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            className="ml-3 flex-1 text-base text-gray-800 dark:text-white"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {workoutTotal !== undefined
            ? `${filteredMembers.length} dari ${workoutTotal} member ditampilkan`
            : `${filteredMembers.length} member ditampilkan`}
        </Text>
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(member) => member._id}
        renderItem={({ item }) => (
          <WorkoutMemberCard
            member={item}
            onMeasurement={() => openMeasurement(item)}
          />
        )}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => void refetch()}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (
            hasNextPage &&
            !isFetchingNextPage &&
            !isRefetching &&
            !isFetchNextPageError
          ) {
            void fetchNextPage();
          }
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 2,
          paddingBottom: 120,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pb-20">
            <View className="mb-4 rounded-full bg-violet-50 p-5 dark:bg-violet-950">
              <MaterialCommunityIcons
                name="dumbbell"
                size={40}
                color="#6F3FA0"
              />
            </View>
            <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
              {isError
                ? "Data workout gagal dimuat"
                : search
                  ? "Member tidak ditemukan"
                  : "Belum ada member workout"}
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {isError
                ? "Tarik layar ke bawah untuk mencoba kembali."
                : search
                  ? `Tidak ada hasil untuk “${search.trim()}”.`
                  : "Member yang workout hari ini akan muncul di sini."}
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator color="#6F3FA0" />
              <Text className="mt-2 text-xs text-gray-500">
                Memuat member berikutnya...
              </Text>
            </View>
          ) : isFetchNextPageError || hasNextPage ? (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => void fetchNextPage()}
              className="mx-5 my-4 items-center rounded-2xl bg-violet-50 px-4 py-4"
            >
              <Text className="font-bold text-[#6F3FA0]">
                {isFetchNextPageError
                  ? "Gagal memuat lanjutan. Coba lagi"
                  : "Muat Member Berikutnya"}
              </Text>
            </TouchableOpacity>
          ) : workoutMembers.length > 0 ? (
            <Text className="py-5 text-center text-xs text-gray-500">
              Semua member workout hari ini telah dimuat.
            </Text>
          ) : null
        }
      />
    </ContainerPage>
  );
}
