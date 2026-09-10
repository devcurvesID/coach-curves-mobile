import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import Text from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { formatDate, formatDateString } from "@/helpers/dates";
import { useWeighMeasurePrintout } from "@/hooks/useWeighMeasure";
import { imageProfileURL } from "@/services/image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import moment from "moment";
import React from "react";
import { Image, ScrollView, View } from "react-native";

const InfoItem = ({ icon, label, value }: any) => (
  <View className="w-1/2 mb-4">
    <View className="flex-row items-center">
      <Ionicons name={icon} size={18} color="#6F3FA0" />

      <Text className="ml-2 text-gray-500">{label}</Text>
    </View>

    <Text className="font-bold text-gray-800 mt-1">{value}</Text>
  </View>
);

const BodyRow = ({ label, value }: any) => (
  <View className="flex-row justify-between py-3 border-b border-gray-100">
    <Text className="text-gray-600">{label}</Text>

    <Text className="font-bold text-gray-800">{value}</Text>
  </View>
);

const BodyRowItem = ({
  label,
  value,
  previous,
  unit = "",
  reverse = false,
}: any) => {
  const currentNumber = Number(value);
  const previousNumber = Number(previous);
  const hasPrevious =
    previous !== undefined && previous !== null && !isNaN(previousNumber);

  const diff = hasPrevious ? currentNumber - previousNumber : 0;

  const positive = diff > 0;
  const negative = diff < 0;

  // reverse=true untuk Massa Otot, Air Tubuh dll
  const good = reverse ? positive : negative;

  return (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-200 ">
      <Text className="text-gray-600 ">{label}</Text>

      <View className="items-end">
        <Text className="font-bold text-gray-800 ">
          {value}
          {unit}
        </Text>

        {hasPrevious && diff !== 0 && (
          <Text
            className={`text-xs font-semibold mt-1 ${
              good ? "text-green-500" : "text-red-500"
            }`}
          >
            {positive ? "▲" : "▼"} {positive ? "+" : ""}
            {diff.toFixed(1)}
            {unit}
          </Text>
        )}

        {hasPrevious && diff === 0 && (
          <Text className="text-xs text-gray-400 mt-1">● Tidak berubah</Text>
        )}
      </View>
    </View>
  );
};
export default function WeighMeasurePrintOutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const data = JSON.parse(params.data as string);
  console.log("wm_printout", data.wm_date);
  const { user, signOut } = useAuth();

  const {
    mutate: weighMeasurePrintoutFn,
    data: weighMeasurePrintout,
    isPending: isPendingPrintOut,
  } = useWeighMeasurePrintout();

  React.useEffect(() => {
    async function getWeighMeasure({ wm_date }: any) {
      let date_q = formatDateString(wm_date);
      let query = `?wm_date=${date_q}`;
      await weighMeasurePrintoutFn(query);
    }
    if (data) {
      getWeighMeasure(data);
    }
  }, []);

  const user_personal = user.user_personal;

  // 🔥 generate bulan (dinamis)

  if (isPendingPrintOut || !weighMeasurePrintout) {
    return <LoadingView />;
  }
  const { current, previous } = weighMeasurePrintout;

  return (
    <>
      <ContainerPage
        titleHeader="Penimbangan & Pengukuran"
        titleContent={user.name}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-2 pt-5 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {/* Detail */}
          <View className="bg-white rounded-3xl p-5 shadow">
            <View className="items-center">
              <Image
                source={{
                  uri: imageProfileURL(user_personal.photo),
                }}
                style={{
                  width: 85,
                  height: 85,
                  borderRadius: 50,
                }}
                //   className="w-24 h-24 rounded-full"
              />

              <Text className="text-2xl font-bold text-gray-800 mt-3">
                {user.name}
              </Text>

              <Text className="text-gray-500">
                {formatDate(current.wm_date)} - {formatDate(previous.wm_date)}
              </Text>

              <Text className="text-[#6F3FA0] font-semibold mt-1">
                Curves Summarecon Bekasi
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-4">
            <View className="flex-1 bg-[#BB86FC] rounded-2xl p-4 mr-1">
              <Text className="text-white/80 text-xs">Body Fat</Text>

              <Text className="text-white text-2xl font-bold mt-1">
                {data.body_fat}
              </Text>

              <Text className="text-white/80 text-xs">%</Text>
            </View>

            <View className="flex-1 bg-[#6F3FA0] rounded-2xl p-4 mx-1">
              <Text className="text-white/80 text-xs">BMI</Text>

              <Text className="text-white text-2xl font-bold mt-1">
                {data.bmi}
              </Text>

              <Text className="text-white/80 text-xs">Status</Text>
            </View>

            <View className="flex-1 bg-[#8E5CD9] rounded-2xl p-4 ml-1">
              <Text className="text-white/80 text-xs">Berat</Text>

              <Text className="text-white text-2xl font-bold mt-1">
                {data.weight}
              </Text>

              <Text className="text-white/80 text-xs">kg</Text>
            </View>
          </View>

          <View className="bg-white rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0] mb-4">
              Informasi Member
            </Text>

            <View className="flex-row flex-wrap">
              <InfoItem
                icon="calendar-outline"
                label="Umur"
                value={`${data.age} Tahun`}
              />

              <InfoItem
                icon="resize-outline"
                label="Tinggi"
                value={` ${data.height} cm`}
              />

              <InfoItem
                icon="heart-outline"
                label="Tekanan Darah"
                value={`${data.bp_high}/${data.bp_low}`}
              />

              <InfoItem
                icon="pulse-outline"
                label="RHR"
                value={`${data.rhr}`}
              />
            </View>
          </View>
          {/* Komposisi Tubuh */}
          <View className="bg-white  rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0]  mb-4">
              Komposisi Tubuh
            </Text>

            <BodyRowItem
              label="Berat Tubuh"
              value={current.weight}
              previous={previous.weight}
              unit=" kg"
            />

            <BodyRowItem
              label="BMI"
              value={current.bmi}
              previous={previous.bmi}
            />

            <BodyRowItem
              label="Lemak Tubuh"
              value={current.body_fat}
              previous={previous.body_fat}
              unit="%"
            />

            <BodyRowItem
              label="Air Tubuh"
              value={current.body_water}
              previous={previous.body_water}
              unit="%"
              reverse
            />

            <BodyRowItem
              label="Massa Otot"
              value={current.muscle_mass}
              previous={previous.muscle_mass}
              unit=" kg"
              reverse
            />

            <BodyRowItem
              label="Massa Tulang"
              value={current.bone_mass}
              previous={previous.bone_mass}
              unit=" kg"
              reverse
            />

            <BodyRowItem
              label="Lemak Visceral"
              value={current.visceral}
              previous={previous.visceral}
            />

            <BodyRowItem
              label="Metabolic Age"
              value={current.metabolic}
              previous={previous.metabolic}
              unit=" Tahun"
            />

            <BodyRowItem
              label="DCI"
              value={current.dci}
              previous={previous.dci}
              unit=" kcal"
            />
          </View>

          {/* Komposisi Tubuh */}
          {/* Ukuran Tubuh */}
          <View className="bg-white  rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0]  mb-4">
              Ukuran Tubuh
            </Text>

            <BodyRowItem
              label="Dada"
              value={current.chest}
              previous={previous.chest}
              unit=" cm"
            />

            <BodyRowItem
              label="Pinggang"
              value={current.waist}
              previous={previous.waist}
              unit=" cm"
            />

            <BodyRowItem
              label="Perut"
              value={current.abdomen}
              previous={previous.abdomen}
              unit=" cm"
            />

            <BodyRowItem
              label="Pinggul"
              value={current.hip}
              previous={previous.hip}
              unit=" cm"
            />

            <BodyRowItem
              label="Paha"
              value={current.thigh}
              previous={previous.thigh}
              unit=" cm"
            />

            <BodyRowItem
              label="Lengan"
              value={current.arm}
              previous={previous.arm}
              unit=" cm"
            />
            <View className="bg-purple-50  rounded-2xl p-4 mt-5">
              <Text className="text-[#6F3FA0]  font-semibold">
                Total Ukuran Tubuh
              </Text>

              <Text className="text-2xl font-bold text-[#6F3FA0] ">
                {current.total_measurement} cm
              </Text>

              <Text
                className={`mt-2 font-semibold ${
                  Number(current.total_measurement) >
                  Number(previous.total_measurement)
                    ? "text-red-500"
                    : Number(current.total_measurement) <
                        Number(previous.total_measurement)
                      ? "text-green-500"
                      : "text-gray-400"
                }`}
              >
                {Number(current.total_measurement) >
                Number(previous.total_measurement)
                  ? "▲"
                  : Number(current.total_measurement) <
                      Number(previous.total_measurement)
                    ? "▼"
                    : "●"}{" "}
                {Number(current.total_measurement) > 0
                  ? `${(
                      Number(current.total_measurement) -
                      Number(previous.total_measurement)
                    ).toFixed(1)} cm`
                  : ""}
              </Text>
            </View>
          </View>
          {/* Ukuran Tubuh */}

          {/* Aktivitas Latihan */}
          <View className="bg-white  rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0]  mb-4">
              Aktivitas Latihan
            </Text>

            <BodyRowItem
              label="Latihan / Bulan"
              value={current.total_wo_per_month}
              unit="x"
            />

            <BodyRowItem label="Program Workout" value={current.pro_workout} />

            <BodyRowItem
              label="3x Seminggu"
              value={current.three_times_a_week}
            />
          </View>
          {/* Aktivitas Latihan */}
          {/* Ringkasan Pengukuran */}
          <View className="bg-white  rounded-3xl p-5 shadow mt-4">
            <Text className="text-lg font-bold text-[#6F3FA0]  mb-4">
              Ringkasan Pengukuran
            </Text>

            <BodyRowItem
              label="Tanggal Pengukuran"
              value={moment(current.wm_date).format("DD MMMM YYYY")}
            />

            <BodyRowItem
              label="Total Body Fat"
              value={current.total_body_fat}
              previous={previous.total_body_fat}
              unit="%"
            />

            <BodyRowItem
              label="Total Hydration"
              value={current.total_hydration}
              previous={previous.total_hydration}
              unit="%"
              reverse
            />
          </View>
          {/* Ringkasan Pengukuran */}
        </ScrollView>
      </ContainerPage>
    </>
  );
}
