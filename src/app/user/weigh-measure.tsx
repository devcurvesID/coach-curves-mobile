import ContainerPage from "@/components/ui/container-page";
import DateMonthPickerModal from "@/components/ui/date-month-picker-modal";
import { FlatListItem } from "@/components/ui/flat-list-item";
import Item from "@/components/ui/item";
import { LoadingView } from "@/components/ui/loading";
import MenuItem from "@/components/ui/menu-item";
import Section from "@/components/ui/section";
import { useAuth } from "@/context/auth";
import {
  useLastWeighMeasure,
  useWeighMeasureHistory,
} from "@/hooks/useWeighMeasure";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WeighMeasureScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    data: lastWeighMeasure,
    error,
    isLoading,
    refetch,
  } = useLastWeighMeasure();
  const {
    mutate: weighMeasureHistoryFn,
    data: weighMeasureHistory,
    isPending,
  } = useWeighMeasureHistory();

  const [visible, setVisible] = React.useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectDateMonth, setSelectDateMonth] = React.useState<any>({
    year: currentYear,
    month: currentMonth,
    month_value: new Date(0, currentMonth - 1).toLocaleString("id-ID", {
      month: "long",
    }),
  });
  const user_personal = user.user_personal;
  const curr_workout_date = user_personal.joined;
  const joined_year = new Date(curr_workout_date).getFullYear();

  // 🔥 generate bulan (dinamis)

  React.useEffect(() => {
    async function getWeighMeasure() {
      let joined_year = new Date().getFullYear();
      let joined_month = new Date().getMonth() - 1;
      console.log("joined_month", joined_month);

      await weighMeasureHistoryFn({ year: joined_year, month: joined_month });
    }
    getWeighMeasure();
  }, []);

  if (isLoading) {
    return <LoadingView />;
  }

  const onSelectPicker = async (data: any) => {
    console.log("data", data);

    setSelectDateMonth(data);
    await weighMeasureHistoryFn({ year: data.year, month: data.month - 1 });
    setVisible(false);
  };

  const onDetail = (wm: any) => {
    router.push({
      pathname: "/user/weigh-measure-printout",
      params: { data: JSON.stringify(wm) },
    });
  };

  const onDetailProgress = () => {
    router.push("/user/weigh-measure-progress");
    // router.push({
    //   pathname: "/user/weigh-measure-progress",
    //   params: { data: JSON.stringify(wm) },
    // });
  };

  return (
    <>
      <ContainerPage titleHeader="Weigh Measure" titleContent={user.name}>
        <View className="flex-row items-start">
          <View className="flex-1 mr-3">
            <MenuItem
              icon="calendar-outline"
              title={`${selectDateMonth.month_value} - ${selectDateMonth.year}`}
              isBottom
              // onPress={onOpenPicker}
              onPress={() => setVisible(true)}
            />
          </View>
          {lastWeighMeasure && (
            <Pressable className="mt-2 mr-2" onPress={onDetailProgress}>
              <View className="w-14 h-14 rounded-full bg-[#6F3FA0] dark:bg-[#BB86FC] border border-white/10 items-center justify-center">
                <Ionicons name="print" size={32} color="#F8BBD0" />
              </View>
            </Pressable>
          )}
        </View>

        {weighMeasureHistory && (
          <FlatListItem
            nestedScrollEnabled
            scrollEnabled={true}
            data={weighMeasureHistory.response}
            keyExtractor={(item: any, index) =>
              item._id ? `${item._id}-${index}` : index.toString()
            }
            CustomComponent={DataWeighMeasureHistoryView}
            ListFooterComponent={() =>
              isPending ? <ActivityIndicator /> : null
            }
          />
        )}
        {weighMeasureHistory && weighMeasureHistory.response.length > 0 && (
          <TouchableOpacity
            onPress={() => onDetail(weighMeasureHistory.response[0])}
            // onPress={handleSubmit(onSubmit)}
            className="bg-purple-700 py-4 rounded-xl mt-4"
          >
            <Text className="text-white text-center font-bold">
              Lihat Riwayat WM
            </Text>
          </TouchableOpacity>
        )}

        <View className="h-10" />
      </ContainerPage>

      <DateMonthPickerModal
        visible={visible}
        onSelect={onSelectPicker}
        joined_year={joined_year}
        onCancel={() => setVisible(false)}
      />
    </>
  );
}

const DataWeighMeasureHistoryView = React.memo(({ data }: any) => {
  return (
    <View key={data._id.toString()}>
      {/* BASIC */}
      <Section title="Basic Info">
        <Item label="Umur" value={`${data.age} tahun`} iconKey="age" />
        <Item label="Tinggi" value={`${data.height} cm`} iconKey="height" />
        <Item label="Berat" value={`${data.weight} kg`} iconKey="weight" />
      </Section>

      {/* BODY COMPOSITION */}
      <Section title="Body Composition">
        <Item label="BMI" value={data.bmi} iconKey="bmi" />
        <Item
          label="Body Fat"
          value={`${data.body_fat} %`}
          iconKey="body_fat"
        />
        <Item
          label="Muscle Mass"
          value={`${data.muscle_mass} kg`}
          iconKey="muscle_mass"
        />
        <Item
          label="Bone Mass"
          value={`${data.bone_mass} kg`}
          iconKey="bone_mass"
        />
        <Item
          label="Body Water"
          value={`${data.body_water} %`}
          iconKey="body_water"
        />
        <Item label="Visceral Fat" value={data.visceral} iconKey="visceral" />
      </Section>

      {/* VITAL SIGNS */}
      <Section title="Vital Signs">
        <Item
          label="Blood Pressure"
          value={`${data.bp_high}/${data.bp_low}`}
          iconKey="bp"
        />
        <Item
          label="Resting Heart Rate"
          value={`${data.rhr} bpm`}
          iconKey="rhr"
        />
      </Section>

      {/* BODY SIZE */}
      <Section title="Body Measurement">
        <Item label="Chest" value={`${data.chest} cm`} iconKey="chest" />
        <Item label="Waist" value={`${data.waist} cm`} iconKey="waist" />
        <Item label="Abdomen" value={`${data.abdomen} cm`} iconKey="abdomen" />
        <Item label="Hip" value={`${data.hip} cm`} iconKey="hip" />
        <Item label="Thigh" value={`${data.thigh} cm`} iconKey="thigh" />
        <Item label="Arm" value={`${data.arm} cm`} iconKey="arm" />
      </Section>
    </View>
  );
});
