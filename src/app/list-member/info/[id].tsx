import type {
  MemberDetail,
  MemberAppointment,
  WeighMeasureProgress,
} from "@/components/member-detail/types";
import { MemberProfile } from "@/components/member-detail/member-profile";
import { MemberPersonalInfo } from "@/components/member-detail/member-personal-info";
import { MemberActivities } from "@/components/member-detail/member-activities";
import { MemberAppointmentCard } from "@/components/member-detail/member-appointment-card";
import { MemberProgressSummary } from "@/components/member-detail/member-progress-summary";
import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useChallengeSummaryByUserId } from "@/hooks/useChallenges";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import {
  useMemberAppointmentByUserId,
  useWeighMeasureProgressByUserId,
} from "@/hooks/useWeighMeasure";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function DetailInformasiMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    mutate: loadMemberDetail,
    data,
    isPending,
    isError,
  } = useDetailMemberByUserId();
  const { data: appointmentData, isLoading: isLoadingAppointment } =
    useMemberAppointmentByUserId(id);
  const { data: challengeSummary, isLoading: isLoadingChallengeSummary } =
    useChallengeSummaryByUserId(id);
  const {
    mutate: loadWeighMeasureProgress,
    data: weighMeasureProgressData,
    isPending: isPendingWeighMeasureProgress,
    isError: isWeighMeasureProgressError,
  } = useWeighMeasureProgressByUserId();

  useEffect(() => {
    if (!id) return;
    loadMemberDetail(id);
    loadWeighMeasureProgress(id);
  }, [id, loadMemberDetail, loadWeighMeasureProgress]);

  if (isPending && !data) return <LoadingView />;
  if (isPendingWeighMeasureProgress) {
    return <LoadingView />;
  }
  if (isError || !data) {
    return (
      <ContainerPage titleHeader="Detail Member" titleContent="Member">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 rounded-full bg-red-50 p-5">
            <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
          </View>
          <Text className="text-center text-lg font-bold text-gray-800 dark:text-white">
            Informasi member gagal dimuat
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Periksa koneksi Anda, lalu coba kembali.
          </Text>
          <TouchableOpacity
            onPress={() => id && loadMemberDetail(id)}
            className="mt-5 rounded-2xl bg-[#6F3FA0] px-6 py-3"
          >
            <Text className="font-bold text-white">Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </ContainerPage>
    );
  }

  const member = data as MemberDetail;
  const memberId = member.user_id || id;
  const weighMeasureProgress = weighMeasureProgressData as
    WeighMeasureProgress | null | undefined;
  const appointments = (
    Array.isArray(appointmentData)
      ? appointmentData
      : appointmentData
        ? [appointmentData]
        : []
  ) as MemberAppointment[];
  const sortedAppointments = [...appointments].sort(
    (first, second) =>
      dayjs(first.app_date).valueOf() - dayjs(second.app_date).valueOf(),
  );
  const today = dayjs().startOf("day");
  const appointment =
    sortedAppointments
      .filter(
        (item) =>
          dayjs(item.app_date).isValid() &&
          !dayjs(item.app_date).startOf("day").isAfter(today),
      )
      .at(-1) ??
    sortedAppointments.find(
      (item) =>
        dayjs(item.app_date).isValid() &&
        dayjs(item.app_date).startOf("day").isAfter(today),
    );
  const appointmentDate = appointment ? dayjs(appointment.app_date) : null;
  const canInputWM = Boolean(
    appointmentDate?.isValid() &&
    !appointmentDate.startOf("day").isAfter(today),
  );

  return (
    <ContainerPage titleHeader="Detail Member" titleContent={member.user.name}>
      <ScrollView
        contentContainerClassName="px-5 pb-32 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <MemberProfile
          member={member}
          challengeSummary={challengeSummary}
          isLoadingChallengeSummary={isLoadingChallengeSummary}
        />

        <MemberPersonalInfo member={member} />

        <MemberAppointmentCard
          appointment={appointment}
          isLoadingAppointment={isLoadingAppointment}
          canInputWM={canInputWM}
          onPress={() =>
            router.push({
              pathname: "/user/input-wm",
              params: { id: memberId },
            })
          }
        />

        <MemberProgressSummary
          progress={weighMeasureProgress}
          isPendingWeighMeasureProgress={isPendingWeighMeasureProgress}
          isWeighMeasureProgressError={isWeighMeasureProgressError}
          onPress={() =>
            router.push({
              pathname: "/list-member/wm/[id]",
              params: { id: memberId },
            })
          }
        />

        <MemberActivities memberId={memberId} memberName={member.user.name} />
      </ScrollView>
    </ContainerPage>
  );
}
