import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useDetailMemberByUserId } from "@/hooks/useMember";
import {
  useCreateWeighMeasure,
  useUploadWeighMeasureResult,
} from "@/hooks/useWeighMeasure";
import type {
  CreatedWeighMeasure,
  MeasurementKey,
} from "@/types/weigh-measure";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Image,
  Modal,
  Pressable,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type MeasurementForm = Record<MeasurementKey, string>;
type SectionKey = "composition" | "measurement" | "workout" | "notes";

interface MeasurementField {
  key: MeasurementKey;
  label: string;
  unit?: string;
  placeholder: string;
  hint?: string;
}

interface MemberDetail {
  user: { name: string };
  key_tag_id?: string | null;
  flag?: string | null;
}

const INITIAL_FORM: MeasurementForm = {
  weight: "",
  body_fat: "",
  muscle_mass: "",
  bone_mass: "",
  bmi: "",
  bp_high: "",
  bp_low: "",
  rhr: "",
  dci: "",
  metabolic: "",
  body_water: "",
  visceral: "",
  chest: "",
  waist: "",
  abdomen: "",
  hip: "",
  thigh: "",
  arm: "",
};

const COMPOSITION_FIELDS: MeasurementField[] = [
  {
    key: "weight",
    label: "Berat Tubuh",
    unit: "kg",
    placeholder: "Contoh: 65.5",
  },
  {
    key: "body_fat",
    label: "Lemak Tubuh",
    unit: "%",
    placeholder: "Contoh: 28.5",
  },
  {
    key: "muscle_mass",
    label: "Massa Otot",
    unit: "kg",
    placeholder: "Contoh: 42.3",
  },
  {
    key: "bone_mass",
    label: "Massa Tulang",
    unit: "kg",
    placeholder: "Contoh: 2.8",
  },
  { key: "bmi", label: "BMI", placeholder: "Contoh: 24.2" },
  {
    key: "body_water",
    label: "Air Tubuh",
    unit: "%",
    placeholder: "Contoh: 48.5",
  },
  { key: "visceral", label: "Lemak Visceral", placeholder: "Contoh: 8" },
  {
    key: "dci",
    label: "Daily Calorie Intake",
    unit: "kcal",
    placeholder: "Contoh: 1650",
  },
  {
    key: "metabolic",
    label: "Umur Metabolik",
    unit: "tahun",
    placeholder: "Contoh: 38",
  },
  {
    key: "bp_high",
    label: "Sistolik",
    unit: "mmHg",
    placeholder: "Contoh: 120",
  },
  {
    key: "bp_low",
    label: "Diastolik",
    unit: "mmHg",
    placeholder: "Contoh: 80",
  },
  {
    key: "rhr",
    label: "Resting Heart Rate",
    unit: "bpm",
    placeholder: "Contoh: 72",
  },
];

const BODY_MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: "chest", label: "Dada", unit: "cm", placeholder: "Contoh: 90" },
  { key: "waist", label: "Pinggang", unit: "cm", placeholder: "Contoh: 75" },
  { key: "abdomen", label: "Perut", unit: "cm", placeholder: "Contoh: 82" },
  { key: "hip", label: "Pinggul", unit: "cm", placeholder: "Contoh: 95" },
  { key: "thigh", label: "Paha", unit: "cm", placeholder: "Contoh: 52" },
  { key: "arm", label: "Lengan", unit: "cm", placeholder: "Contoh: 28" },
];

const REQUIRED_FIELDS = [...COMPOSITION_FIELDS, ...BODY_MEASUREMENT_FIELDS];

const sanitizeNumericInput = (value: string): string => {
  const sanitized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  const [integerPart, ...decimalParts] = sanitized.split(".");
  return decimalParts.length > 0
    ? `${integerPart}.${decimalParts.join("")}`
    : integerPart;
};

function NumericInput({
  field,
  value,
  error,
  fullWidth,
  onChange,
}: {
  field: MeasurementField;
  value: string;
  error?: string;
  fullWidth: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <View className={fullWidth ? "mb-4 w-full" : "mb-4 w-[48%]"}>
      <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {field.label} <Text className="text-red-500">*</Text>
      </Text>
      <View
        className={`flex-row overflow-hidden rounded-2xl border bg-gray-50 dark:bg-zinc-800 ${
          error ? "border-red-400" : "border-gray-200 dark:border-zinc-700"
        }`}
      >
        <TextInput
          value={value}
          onChangeText={(text) => onChange(sanitizeNumericInput(text))}
          placeholder={field.placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          returnKeyType="next"
          className="min-h-14 flex-1 px-4 text-base text-gray-900 dark:text-white"
        />
        {field.unit && (
          <View className="items-center justify-center border-l border-gray-200 bg-gray-100 px-3 dark:border-zinc-700 dark:bg-zinc-700">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-300">
              {field.unit}
            </Text>
          </View>
        )}
      </View>
      {error && <Text className="mt-1.5 text-xs text-red-500">{error}</Text>}
    </View>
  );
}

function FormSection({
  title,
  subtitle,
  icon,
  expanded,
  completed,
  total,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  expanded: boolean;
  completed?: number;
  total?: number;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        className="flex-row items-center p-5"
      >
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950">
          <Ionicons name={icon} size={24} color="#6F3FA0" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-bold text-gray-900 dark:text-white">
            {title}
          </Text>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </Text>
        </View>
        {total !== undefined && completed !== undefined && (
          <View className="mr-3 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950">
            <Text className="text-xs font-bold text-[#6F3FA0] dark:text-violet-300">
              {completed}/{total}
            </Text>
          </View>
        )}
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color="#6B7280"
        />
      </TouchableOpacity>
      {expanded && (
        <View className="border-t border-gray-100 px-5 pb-2 pt-5 dark:border-zinc-800">
          {children}
        </View>
      )}
    </View>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center border-b border-gray-100 py-4 last:border-b-0 dark:border-zinc-800">
      <View className="flex-1 pr-4">
        <Text className="font-semibold text-gray-800 dark:text-white">
          {title}
        </Text>
        <Text className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: "#C4B5FD" }}
        thumbColor={value ? "#6F3FA0" : "#F9FAFB"}
      />
    </View>
  );
}

export default function InputWeighMeasureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const useSingleColumn = width < 390;

  const [form, setForm] = useState<MeasurementForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<MeasurementKey, string>>>(
    {},
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<SectionKey, boolean>
  >({
    composition: true,
    measurement: false,
    workout: false,
    notes: false,
  });
  const [proWorkout, setProWorkout] = useState(false);
  const [threeTimesAWeek, setThreeTimesAWeek] = useState(false);
  const [notes, setNotes] = useState("");
  const [resultPhoto, setResultPhoto] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const { mutateAsync: createWeighMeasure, isPending: isSubmitting } =
    useCreateWeighMeasure();
  const { mutateAsync: uploadWeighMeasureResult, isPending: isUploadingPhoto } =
    useUploadWeighMeasureResult();
  const [createdMeasurement, setCreatedMeasurement] =
    useState<CreatedWeighMeasure | null>(null);
  const submissionInFlight = useRef(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const {
    mutate: loadMemberDetail,
    data: memberData,
    isPending: isLoadingMember,
  } = useDetailMemberByUserId();

  useEffect(() => {
    if (id) loadMemberDetail(id);
  }, [id, loadMemberDetail]);

  const member = memberData as MemberDetail | undefined;
  const completedFields = useMemo(
    () => REQUIRED_FIELDS.filter((field) => Number(form[field.key]) > 0).length,
    [form],
  );
  const compositionCompleted = COMPOSITION_FIELDS.filter(
    (field) => Number(form[field.key]) > 0,
  ).length;
  const measurementCompleted = BODY_MEASUREMENT_FIELDS.filter(
    (field) => Number(form[field.key]) > 0,
  ).length;
  const progress = Math.round((completedFields / REQUIRED_FIELDS.length) * 100);

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const updateField = (key: MeasurementKey, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<MeasurementKey, string>> = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (
        !form[field.key] ||
        !Number.isFinite(Number(form[field.key])) ||
        Number(form[field.key]) <= 0
      ) {
        nextErrors[field.key] =
          `${field.label} wajib diisi dengan nilai lebih dari 0`;
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const hasCompositionError = COMPOSITION_FIELDS.some(
        (field) => nextErrors[field.key],
      );
      const hasMeasurementError = BODY_MEASUREMENT_FIELDS.some(
        (field) => nextErrors[field.key],
      );
      setExpandedSections((current) => ({
        ...current,
        composition: hasCompositionError || current.composition,
        measurement: hasMeasurementError || current.measurement,
      }));
      Alert.alert(
        "Data belum lengkap",
        `${Object.keys(nextErrors).length} kolom wajib masih perlu dilengkapi.`,
      );
      return false;
    }

    return true;
  };

  const openGallery = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Izin galeri diperlukan",
        "Aktifkan akses galeri agar foto hasil latihan dapat dipilih.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled) setResultPhoto(result.assets[0]);
  };

  const openCamera = async (): Promise<void> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Izin kamera diperlukan",
        "Aktifkan akses kamera untuk mengambil foto hasil latihan.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled) setResultPhoto(result.assets[0]);
  };

  const selectPhotoSource = (): void => {
    Alert.alert(
      resultPhoto ? "Ganti Foto Hasil" : "Tambah Foto Hasil",
      "Pilih sumber foto yang akan diunggah.",
      [
        { text: "Kamera", onPress: () => void openCamera() },
        { text: "Galeri", onPress: () => void openGallery() },
        { text: "Batal", style: "cancel" },
      ],
    );
  };

  const submitMeasurement = async () => {
    Keyboard.dismiss();
    if (
      submissionInFlight.current ||
      isSubmitting ||
      isUploadingPhoto ||
      successVisible
    )
      return;
    if (!id) {
      Alert.alert(
        "Member belum dipilih",
        "Buka formulir WM dari detail member terlebih dahulu.",
      );
      return;
    }
    if (!validateForm()) return;

    let wasMeasurementCreated = Boolean(createdMeasurement);
    try {
      submissionInFlight.current = true;
      const numericMeasurements = (
        Object.keys(form) as MeasurementKey[]
      ).reduce(
        (result, key) => {
          result[key] = Number(form[key]);
          return result;
        },
        {} as Record<MeasurementKey, number>,
      );
      const payload = {
        user_id: id,
        ...numericMeasurements,
        pro_workout: proWorkout ? "Yes" : "No",
        three_times_a_week: threeTimesAWeek ? "Yes" : "No",
        recommendation: notes.trim() || null,
      } as const;

      let savedMeasurement = createdMeasurement;
      if (!savedMeasurement) {
        const createResponse = await createWeighMeasure(payload);
        wasMeasurementCreated = true;
        if (resultPhoto) {
          const createdData = createResponse.response ?? createResponse;
          if (!createdData?._id || !createdData.user_id) {
            throw new Error(
              "Data WM tersimpan, tetapi ID hasil WM tidak tersedia pada response API.",
            );
          }
          savedMeasurement = {
            _id: createdData._id,
            user_id: createdData.user_id,
          };
          setCreatedMeasurement(savedMeasurement);
        }
      }

      if (resultPhoto && savedMeasurement) {
        const extension = resultPhoto.mimeType?.split("/")[1] || "jpg";
        await uploadWeighMeasureResult({
          member_id: savedMeasurement.user_id,
          weigh_measure_id: savedMeasurement._id,
          photo: {
            uri: resultPhoto.uri,
            name:
              resultPhoto.fileName ||
              `hasil-wm-${savedMeasurement._id}.${extension}`,
            type: resultPhoto.mimeType || "image/jpeg",
          },
        });
      }
      setCreatedMeasurement(null);
      setSuccessVisible(true);
    } catch (error) {
      Alert.alert(
        wasMeasurementCreated
          ? "Foto belum berhasil diunggah"
          : "Gagal menyimpan hasil WM",
        wasMeasurementCreated
          ? "Data WM sudah tersimpan. Periksa koneksi lalu tekan Simpan Hasil WM untuk mencoba upload foto kembali."
          : error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan data WM.",
      );
    } finally {
      submissionInFlight.current = false;
    }
  };

  if (isLoadingMember && !memberData) return <LoadingView />;

  return (
    <>
      <ContainerPage titleHeader="Input WM" titleContent="Weigh & Measure">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={24}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 140,
            }}
          >
            <View className="mb-5 rounded-3xl bg-[#6F3FA0] p-5">
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <MaterialCommunityIcons
                    name="scale-bathroom"
                    size={26}
                    color="white"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-violet-200">
                    Input hasil latihan untuk
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="mt-1 text-lg font-bold text-white"
                  >
                    {member?.user.name ?? "Member"}
                  </Text>
                  <Text className="mt-1 text-xs text-violet-200">
                    Key Tag: {member?.key_tag_id || "-"}
                  </Text>
                </View>
                {member?.flag && (
                  <View className="rounded-full bg-white/15 px-3 py-1.5">
                    <Text className="text-xs font-bold text-white">
                      {member.flag}
                    </Text>
                  </View>
                )}
              </View>

              <View className="mt-5">
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-xs text-violet-200">
                    Kelengkapan data
                  </Text>
                  <Text className="text-xs font-bold text-white">
                    {progress}%
                  </Text>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-white/20">
                  <View
                    className="h-full rounded-full bg-white"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            </View>

            <View className="mb-4 flex-row items-start rounded-2xl bg-blue-50 p-4 dark:bg-blue-950">
              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#2563EB"
              />
              <Text className="ml-3 flex-1 text-sm leading-5 text-blue-700 dark:text-blue-200">
                Gunakan angka desimal bila diperlukan. Semua kolom bertanda *
                wajib diisi.
              </Text>
            </View>

            <FormSection
              title="Komposisi & Kondisi Tubuh"
              subtitle="Berat, lemak, tekanan darah, dan indikator tubuh"
              icon="body-outline"
              expanded={expandedSections.composition}
              completed={compositionCompleted}
              total={COMPOSITION_FIELDS.length}
              onToggle={() => toggleSection("composition")}
            >
              <View className="flex-row flex-wrap justify-between">
                {COMPOSITION_FIELDS.map((field) => (
                  <NumericInput
                    key={field.key}
                    field={field}
                    value={form[field.key]}
                    error={errors[field.key]}
                    fullWidth={useSingleColumn}
                    onChange={(value) => updateField(field.key, value)}
                  />
                ))}
              </View>
            </FormSection>

            <FormSection
              title="Ukuran Tubuh"
              subtitle="Dada, pinggang, perut, pinggul, paha, dan lengan"
              icon="resize-outline"
              expanded={expandedSections.measurement}
              completed={measurementCompleted}
              total={BODY_MEASUREMENT_FIELDS.length}
              onToggle={() => toggleSection("measurement")}
            >
              <View className="flex-row flex-wrap justify-between">
                {BODY_MEASUREMENT_FIELDS.map((field) => (
                  <NumericInput
                    key={field.key}
                    field={field}
                    value={form[field.key]}
                    error={errors[field.key]}
                    fullWidth={useSingleColumn}
                    onChange={(value) => updateField(field.key, value)}
                  />
                ))}
              </View>
            </FormSection>

            <FormSection
              title="Aktivitas Workout"
              subtitle="Catat program dan konsistensi latihan member"
              icon="barbell-outline"
              expanded={expandedSections.workout}
              onToggle={() => toggleSection("workout")}
            >
              <ToggleRow
                title="Pro Workout"
                description="Member mengikuti program latihan tingkat lanjut."
                value={proWorkout}
                onValueChange={setProWorkout}
              />
              <ToggleRow
                title="Latihan 3x Seminggu"
                description="Member berkomitmen berlatih tiga kali dalam seminggu."
                value={threeTimesAWeek}
                onValueChange={setThreeTimesAWeek}
              />
            </FormSection>

            <FormSection
              title="Catatan & Rekomendasi"
              subtitle="Opsional, tambahkan arahan untuk member"
              icon="document-text-outline"
              expanded={expandedSections.notes}
              onToggle={() => toggleSection("notes")}
            >
              <TextInput
                multiline
                value={notes}
                onChangeText={setNotes}
                placeholder="Contoh: Tingkatkan asupan air dan pertahankan latihan 3x seminggu..."
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
                maxLength={500}
                className="min-h-[140px] rounded-2xl border border-gray-200 bg-gray-50 p-4 text-base text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <Text className="mb-4 mt-2 text-right text-xs text-gray-400">
                {notes.length}/500
              </Text>
            </FormSection>

            <View className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 dark:bg-pink-950">
                  <Ionicons name="camera-outline" size={24} color="#DB2777" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-gray-900 dark:text-white">
                    Foto Hasil Latihan
                  </Text>
                  <Text className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Opsional • dokumentasikan kondisi atau progres member
                  </Text>
                </View>
              </View>

              {resultPhoto ? (
                <View className="mt-5 overflow-hidden rounded-3xl bg-slate-100 dark:bg-zinc-800">
                  <Image
                    source={{ uri: resultPhoto.uri }}
                    resizeMode="cover"
                    className="h-[300px] w-full"
                  />
                  <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 bg-black/55 p-4">
                    <TouchableOpacity
                      onPress={selectPhotoSource}
                      className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-white"
                    >
                      <Ionicons
                        name="camera-reverse-outline"
                        size={19}
                        color="#6F3FA0"
                      />
                      <Text className="ml-2 font-bold text-[#6F3FA0]">
                        Ganti
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setResultPhoto(null)}
                      className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-red-500"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text className="ml-2 font-bold text-white">Hapus</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={selectPhotoSource}
                  activeOpacity={0.8}
                  className="mt-5 items-center justify-center rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50 px-5 py-9 dark:border-violet-800 dark:bg-violet-950"
                >
                  <View className="h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                    <Ionicons name="images-outline" size={30} color="#6F3FA0" />
                  </View>
                  <Text className="mt-4 font-bold text-[#6F3FA0] dark:text-violet-300">
                    Tambahkan Foto Hasil
                  </Text>
                  <Text className="mt-2 text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Ambil langsung dari kamera atau pilih foto dari galeri
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={submitMeasurement}
              disabled={isSubmitting || isUploadingPhoto}
              activeOpacity={0.85}
              className={`mt-2 min-h-14 flex-row items-center justify-center rounded-2xl ${
                isSubmitting || isUploadingPhoto
                  ? "bg-violet-400"
                  : "bg-[#6F3FA0]"
              }`}
            >
              {isSubmitting || isUploadingPhoto ? (
                <>
                  <ActivityIndicator color="white" />
                  <Text className="ml-3 text-base font-bold text-white">
                    {isUploadingPhoto ? "Mengunggah foto..." : "Menyimpan..."}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="save-outline" size={21} color="white" />
                  <Text className="ml-2 text-base font-bold text-white">
                    Simpan Hasil WM
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </ContainerPage>

      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-[380px] rounded-[30px] bg-white p-6 dark:bg-zinc-900">
            <View className="items-center">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
                <Ionicons name="checkmark-circle" size={56} color="#22C55E" />
              </View>
              <Text className="mt-5 text-center text-xl font-bold text-gray-900 dark:text-white">
                Hasil WM Tersimpan
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-gray-500 dark:text-gray-400">
                Data terbaru {member?.user.name ?? "member"} berhasil disimpan
                dan siap dipantau.
              </Text>
            </View>

            <Pressable
              onPress={() => {
                setSuccessVisible(false);
                router.back();
              }}
              className="mt-6 h-14 items-center justify-center rounded-2xl bg-[#6F3FA0]"
            >
              <Text className="font-bold text-white">Selesai</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setSuccessVisible(false);
                router.push({
                  pathname: "/member-history/wm-history",
                  params: { id },
                });
              }}
              className="mt-3 h-14 flex-row items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950"
            >
              <Ionicons name="time-outline" size={20} color="#6F3FA0" />
              <Text className="ml-2 font-bold text-[#6F3FA0] dark:text-violet-300">
                Lihat Riwayat WM
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
