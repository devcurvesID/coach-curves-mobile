import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import {
  MEMBER_FLAG_OPTIONS,
  type MemberFlag,
} from "@/helpers/member-flag-options";
import { useUserClub } from "@/hooks/useClubs";
import {
  fetchAllMembersGroupedByFlag,
  fetchMemberFlagResume,
  getMemberFlagClubId,
  type MemberByFlag,
  useMemberFlagResume,
  useMembersByFlag,
} from "@/hooks/useMembersByFlag";
import { imageProfileURL } from "@/services/image";
import { buildMemberFlagPdfHtml } from "@/utils/member-flag-pdf";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const getMemberName = (member: MemberByFlag): string =>
  member.name?.trim() || member.user?.name?.trim() || "Member";

const getMemberUserId = (member: MemberByFlag): string | undefined =>
  member.user_id?.trim() || member.user?._id?.trim() || undefined;

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toLocaleUpperCase("id-ID") || "M";

const createFlagPdfFileName = (clubName: string): string => {
  const safeClubName = clubName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  const savedAt = dayjs().format("DD-MM-YYYY_HH-mm-ss");

  return `FLAG-${safeClubName || "CLUB"}_${savedAt}.pdf`;
};

function MemberFlagAvatar({
  name,
  photo,
}: {
  name: string;
  photo?: string | null;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const filename = photo?.trim();

  if (filename && !hasImageError) {
    return (
      <Image
        accessibilityLabel={`Foto profil ${name}`}
        source={{ uri: imageProfileURL(filename) }}
        resizeMode="cover"
        onError={() => setHasImageError(true)}
        className="h-14 w-14 rounded-2xl bg-purple-50"
      />
    );
  }

  return (
    <View
      accessibilityLabel={`Inisial ${name}`}
      className="h-14 w-14 items-center justify-center rounded-2xl bg-purple-100"
    >
      <Text className="text-lg font-bold text-purple-700">
        {getInitials(name)}
      </Text>
    </View>
  );
}

export default function MemberFlagsScreen() {
  const { user } = useAuth();
  const clubId = getMemberFlagClubId(user?.user_personal?.member_club_id);
  const [flag, setFlag] = useState<MemberFlag["flag"]>("A");
  const [search, setSearch] = useState("");
  const [isResumeVisible, setIsResumeVisible] = useState(false);
  const [pdfAction, setPdfAction] = useState<"preview" | "download" | null>(
    null,
  );
  const { data: userClubs } = useUserClub();
  const resumeQuery = useMemberFlagResume(clubId, isResumeVisible);
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useMembersByFlag(clubId, flag);
  const loadedMembers = useMemo(
    () => data?.pages.flatMap((page) => page.members) ?? [],
    [data],
  );
  const total = data?.pages[0]?.total;
  const selectedFlag = MEMBER_FLAG_OPTIONS.find(
    (option) => option.flag === flag,
  )!;
  const members = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("id-ID");
    return loadedMembers.filter((member) =>
      getMemberName(member).toLocaleLowerCase("id-ID").includes(keyword),
    );
  }, [loadedMembers, search]);
  const hasClub = clubId !== undefined && clubId !== null && clubId !== "";
  const clubName = userClubs?.[0]?.club_name || "Curves";

  const createPdfHtml = async () => {
    if (!clubId) throw new Error("Club pengguna belum tersedia.");
    const resume = await fetchMemberFlagResume(clubId);
    const groups = await fetchAllMembersGroupedByFlag(clubId, resume);
    return buildMemberFlagPdfHtml({
      clubName,
      groups,
    });
  };

  const previewPdf = async () => {
    if (pdfAction) return;
    setPdfAction("preview");
    try {
      await Print.printAsync({ html: await createPdfHtml() });
    } catch (pdfError) {
      Alert.alert(
        "PDF Tidak Dapat Ditampilkan",
        pdfError instanceof Error
          ? pdfError.message
          : "Terjadi kendala saat membuat printout member.",
      );
    } finally {
      setPdfAction(null);
    }
  };

  const downloadPdf = async () => {
    if (pdfAction) return;
    setPdfAction("download");
    try {
      const { uri } = await Print.printToFileAsync({
        html: await createPdfHtml(),
      });
      const generatedFile = new File(uri);
      const namedFile = new File(
        Paths.cache,
        createFlagPdfFileName(clubName),
      );
      if (namedFile.exists) namedFile.delete();
      generatedFile.move(namedFile);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "PDF Berhasil Dibuat",
          "Fitur penyimpanan tidak tersedia pada perangkat ini.",
        );
        return;
      }
      await Sharing.shareAsync(namedFile.uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: `Simpan Printout Member Flag ${clubName}`,
      });
    } catch (pdfError) {
      Alert.alert(
        "PDF Tidak Dapat Disimpan",
        pdfError instanceof Error
          ? pdfError.message
          : "Terjadi kendala saat membuat printout member.",
      );
    } finally {
      setPdfAction(null);
    }
  };

  return (
    <ContainerPage
      titleHeader="Member Berdasarkan Flag"
      titleContent="Aktivitas member di club Anda"
    >
      <FlatList
        data={members}
        keyExtractor={(item, index) =>
          `${item._id ?? item.user?._id ?? item.source_id ?? "member"}-${index}`
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48, flexGrow: 1 }}
        refreshing={isFetching && !isLoading && !isFetchingNextPage}
        onRefresh={hasClub ? () => void refetch() : undefined}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchNextPageError)
            void fetchNextPage();
        }}
        ListHeaderComponent={
          <View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lihat resume semua status flag"
              onPress={() => setIsResumeVisible(true)}
              className="mb-5 flex-row items-center rounded-2xl bg-[#6F3FA0] p-4"
            >
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Ionicons name="pie-chart-outline" size={25} color="white" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold text-white">Resume Semua Flag</Text>
                <Text className="mt-1 text-xs text-violet-200">
                  Lihat jumlah member pada setiap status flag
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>

            <View className="mb-5 rounded-3xl border border-violet-100 bg-violet-50 p-4">
              <View className="flex-row items-start">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white ">
                  <Ionicons
                    name="document-text-outline"
                    size={23}
                    color="#6F3FA0"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-gray-900 ">
                    Printout Semua Member
                  </Text>
                  <Text className="mt-1 text-xs leading-5 text-gray-500 ">
                    Berisi seluruh member Flag A sampai E, termasuk data yang
                    belum dimuat pada layar.
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Lihat printout semua member berdasarkan flag"
                  disabled={pdfAction !== null || !hasClub}
                  onPress={() => void previewPdf()}
                  className={`flex-1 flex-row items-center justify-center rounded-2xl border border-violet-200 bg-white py-3.5   ${
                    pdfAction || !hasClub ? "opacity-60" : ""
                  }`}
                >
                  {pdfAction === "preview" ? (
                    <ActivityIndicator size="small" color="#6F3FA0" />
                  ) : (
                    <Ionicons name="eye-outline" size={19} color="#6F3FA0" />
                  )}
                  <Text className="ml-2 font-bold text-[#6F3FA0] ">
                    Lihat PDF
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Simpan printout semua member berdasarkan flag"
                  disabled={pdfAction !== null || !hasClub}
                  onPress={() => void downloadPdf()}
                  className={`flex-1 flex-row items-center justify-center rounded-2xl bg-[#6F3FA0] py-3.5 ${
                    pdfAction || !hasClub ? "opacity-60" : ""
                  }`}
                >
                  {pdfAction === "download" ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="download-outline" size={19} color="white" />
                  )}
                  <Text className="ml-2 font-bold text-white">Simpan PDF</Text>
                </Pressable>
              </View>
              {pdfAction ? (
                <Text className="mt-3 text-center text-xs text-violet-700 ">
                  Mengambil seluruh data member dan menyiapkan PDF...
                </Text>
              ) : null}
            </View>
            <View className="mb-5 flex-row gap-2">
              {MEMBER_FLAG_OPTIONS.map((option) => (
                <Pressable
                  key={option.flag}
                  accessibilityRole="tab"
                  accessibilityLabel={`Flag ${option.flag}, ${option.description}`}
                  accessibilityState={{ selected: flag === option.flag }}
                  onPress={() => {
                    setFlag(option.flag);
                    setSearch("");
                  }}
                  className="flex-1 items-center rounded-2xl border py-3"
                  style={{
                    backgroundColor:
                      flag === option.flag ? option.backgroundColor : "#FFFFFF",
                    borderColor:
                      flag === option.flag ? option.color : "#E2E8F0",
                  }}
                >
                  <Text className="text-xs text-slate-500">Flag</Text>
                  <Text
                    className="mt-1 text-xl font-bold"
                    style={{ color: option.color }}
                  >
                    {option.flag}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View
              className="mb-5 rounded-3xl p-5"
              style={{ backgroundColor: selectedFlag.backgroundColor }}
            >
              <View className="flex-row items-center">
                <Ionicons name="flag" size={26} color={selectedFlag.color} />
                <Text className="ml-3 text-lg font-bold text-slate-800">
                  Member Flag {flag}
                </Text>
              </View>
              <Text className="mt-2 text-sm text-slate-600">
                {selectedFlag.description}
              </Text>
              {!isLoading && !error && hasClub && (
                <Text className="mt-2 text-sm font-semibold text-slate-700">
                  {total !== undefined
                    ? `${loadedMembers.length} dari ${total} member dimuat`
                    : `${loadedMembers.length} member dimuat`}
                </Text>
              )}
            </View>
            <View className="mb-5 flex-row items-center rounded-2xl border border-slate-200 px-4">
              <Ionicons name="search-outline" size={20} color="#94A3B8" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari nama pada daftar dimuat..."
                className="ml-2 flex-1 py-4 text-slate-800"
              />
              {search.length > 0 && (
                <Pressable
                  accessibilityLabel="Hapus pencarian"
                  hitSlop={8}
                  onPress={() => setSearch("")}
                >
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </Pressable>
              )}
            </View>
            {search.trim() && hasNextPage ? (
              <Text className="mb-4 text-xs text-slate-500">
                Pencarian mencakup member yang sudah dimuat. Muat halaman
                berikutnya untuk mencari lebih banyak member.
              </Text>
            ) : null}
            {error && loadedMembers.length > 0 && !isFetchNextPageError ? (
              <Pressable
                onPress={() => void refetch()}
                className="mb-4 rounded-xl bg-red-50 p-3"
              >
                <Text className="text-sm text-red-700">
                  Pembaruan gagal. Ketuk untuk mencoba kembali.
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Lihat detail ${getMemberName(item)}`}
            accessibilityState={{ disabled: !getMemberUserId(item) }}
            disabled={!getMemberUserId(item)}
            onPress={() => {
              const userId = getMemberUserId(item);
              if (!userId) return;
              router.push({
                pathname: "/list-member/info/[id]",
                params: { id: userId },
              });
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4"
          >
            <MemberFlagAvatar
              key={item.photo ?? "no-photo"}
              name={getMemberName(item)}
              photo={item.photo}
            />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-slate-800">
                {getMemberName(item)}
              </Text>
              <View className="mt-2 flex-row items-center">
                <Ionicons name="key-outline" size={14} color="#6F3FA0" />
                <Text className="ml-1.5 flex-1 text-xs text-slate-500">
                  Key Tag: {String(item.key_tag_id ?? "").trim() || "-"}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center">
                <Ionicons name="fitness-outline" size={14} color="#6F3FA0" />
                <Text className="ml-1.5 text-xs font-semibold text-slate-600">
                  {item.total_wo ?? 0} workout bulan ini
                </Text>
              </View>
              <Text className="mt-2 text-xs text-purple-700">
                {getMemberUserId(item)
                  ? "Lihat detail member"
                  : "ID user member belum tersedia"}
              </Text>
            </View>
            <View
              className="ml-2 rounded-full px-3 py-2"
              style={{ backgroundColor: selectedFlag.backgroundColor }}
            >
              <Text className="text-xs font-bold text-slate-800">
                Flag {flag}
              </Text>
            </View>
            {getMemberUserId(item) ? (
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#6F3FA0"
                style={{ marginLeft: 8 }}
              />
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center px-5 py-10">
            {isLoading ? (
              <ActivityIndicator color="#6F3FA0" />
            ) : (
              <Ionicons
                name={error ? "alert-circle-outline" : "people-outline"}
                size={42}
                color="#9333EA"
              />
            )}
            <Text className="mt-4 text-center text-base font-semibold text-slate-700">
              {!hasClub
                ? "Club user belum tersedia."
                : isLoading
                  ? "Memuat daftar member..."
                  : error
                    ? error.message
                    : search.trim()
                      ? "Member tidak ditemukan pada daftar yang sudah dimuat."
                      : `Belum ada member dengan flag ${flag}.`}
            </Text>
            {error && hasClub && (
              <Pressable
                onPress={() => void refetch()}
                className="mt-4 rounded-xl bg-purple-600 px-5 py-3"
              >
                <Text className="font-semibold text-white">Coba Lagi</Text>
              </Pressable>
            )}
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator color="#6F3FA0" />
              <Text className="mt-2 text-xs text-slate-500">
                Memuat member berikutnya...
              </Text>
            </View>
          ) : hasNextPage || isFetchNextPageError ? (
            <Pressable
              accessibilityRole="button"
              disabled={isFetching}
              onPress={() => void fetchNextPage()}
              className="my-4 items-center rounded-xl bg-purple-50 px-4 py-4"
            >
              <Text className="font-semibold text-purple-700">
                {isFetchNextPageError
                  ? "Gagal memuat lanjutan. Coba lagi"
                  : "Muat Member Berikutnya"}
              </Text>
            </Pressable>
          ) : loadedMembers.length > 0 ? (
            <Text className="py-4 text-center text-xs text-slate-500">
              Semua member flag {flag} telah dimuat.
            </Text>
          ) : null
        }
      />
      <Modal
        visible={isResumeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsResumeVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/50 px-6">
          <Pressable
            accessibilityLabel="Tutup modal resume flag"
            className="absolute inset-0"
            onPress={() => setIsResumeVisible(false)}
          />
          <View accessibilityViewIsModal className="rounded-3xl bg-white p-5 ">
            <View className="flex-row items-start justify-between">
              <View className="mr-4 flex-1">
                <Text className="text-xl font-bold text-gray-900 ">
                  Resume Status Flag
                </Text>
                <Text className="mt-1 text-sm text-gray-500 ">
                  Ringkasan seluruh member berdasarkan flag
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup"
                onPress={() => setIsResumeVisible(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 "
              >
                <Ionicons name="close" size={21} color="#6F3FA0" />
              </Pressable>
            </View>

            {resumeQuery.isLoading ? (
              <View className="items-center py-12">
                <ActivityIndicator color="#6F3FA0" />
                <Text className="mt-3 text-sm text-gray-500">
                  Memuat resume flag...
                </Text>
              </View>
            ) : resumeQuery.isError || !clubId ? (
              <View className="items-center py-10">
                <View className="rounded-full bg-red-50 p-4">
                  <Ionicons
                    name="alert-circle-outline"
                    size={34}
                    color="#DC2626"
                  />
                </View>
                <Text className="mt-3 text-center font-bold text-gray-800 ">
                  Resume flag gagal dimuat
                </Text>
                <Text className="mt-1 text-center text-sm text-gray-500">
                  {!clubId
                    ? "Club pengguna belum tersedia."
                    : "Periksa koneksi lalu coba kembali."}
                </Text>
                {clubId ? (
                  <Pressable
                    onPress={() => void resumeQuery.refetch()}
                    className="mt-4 rounded-xl bg-[#6F3FA0] px-5 py-3"
                  >
                    <Text className="font-bold text-white">Coba Lagi</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <>
                <View className="mt-5 rounded-2xl bg-violet-50 p-4 ">
                  <Text className="text-xs text-gray-500 ">TOTAL MEMBER</Text>
                  <Text className="mt-1 text-3xl font-bold text-[#6F3FA0] ">
                    {resumeQuery.data?.reduce(
                      (sum, item) => sum + item.total,
                      0,
                    ) ?? 0}
                  </Text>
                </View>
                <View className="mt-4 gap-3">
                  {MEMBER_FLAG_OPTIONS.map((option) => {
                    const totalFlag =
                      resumeQuery.data?.find(
                        (item) => item.flag === option.flag,
                      )?.total ?? 0;
                    return (
                      <Pressable
                        key={option.flag}
                        accessibilityRole="button"
                        accessibilityLabel={`Flag ${option.flag}, ${totalFlag} member`}
                        onPress={() => {
                          setFlag(option.flag);
                          setSearch("");
                          setIsResumeVisible(false);
                        }}
                        className="flex-row items-center rounded-2xl border border-gray-100 p-3 "
                      >
                        <View
                          className="h-11 w-11 items-center justify-center rounded-xl"
                          style={{ backgroundColor: option.backgroundColor }}
                        >
                          <Text
                            className="text-lg font-bold"
                            style={{ color: option.color }}
                          >
                            {option.flag}
                          </Text>
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="font-semibold text-gray-800 ">
                            Member Flag {option.flag}
                          </Text>
                          <Text className="mt-0.5 text-xs text-gray-500">
                            Ketuk untuk melihat daftar member
                          </Text>
                        </View>
                        <Text
                          className="mr-2 text-xl font-bold"
                          style={{ color: option.color }}
                        >
                          {totalFlag}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#9CA3AF"
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ContainerPage>
  );
}
