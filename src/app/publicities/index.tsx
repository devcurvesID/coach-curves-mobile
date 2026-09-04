import PartnerPromoCard from "@/components/publicities/partner-promo-card";
import { PublicityCard } from "@/components/publicities/publicity-card";
import ContainerPage from "@/components/ui/container-page";
import { LoadingView } from "@/components/ui/loading";
import { useCommunityPartners, usePublicities } from "@/hooks/usePublicities";
import type { Publicity } from "@/types/publicity";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

type PromoType = "monthly" | "partner";

const PROMO_TABS = [
  { key: "monthly", label: "Promo Bulan Ini" },
  { key: "partner", label: "Promo Mitra" },
] as const satisfies ReadonlyArray<{ key: PromoType; label: string }>;

const LIST_CONTENT_STYLE = { paddingTop: 15, paddingBottom: 120 } as const;
const PARTNER_LIST_CONTENT_STYLE = { paddingBottom: 40 } as const;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Gagal memuat data promo.";

const EmptyPromo = ({ message }: { message: string }) => (
  <View className="items-center px-6 py-16">
    <Ionicons name="pricetag-outline" size={44} color="#94A3B8" />
    <Text className="mt-4 text-center text-base text-slate-500">{message}</Text>
  </View>
);

export default function PublicityScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [promoType, setPromoType] = useState<PromoType>("monthly");

  const {
    data: promos = [],
    error: publicityError,
    isLoading: isLoadingPublicities,
  } = usePublicities();
  const {
    data: partnerPromos = [],
    error: partnerError,
    isLoading: isLoadingPartners,
  } = useCommunityPartners();

  const filteredPromos = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return promos;

    return promos.filter((promo) =>
      [promo.headline, promo.note, promo.status, promo.challenge, promo.type]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [promos, search]);

  const handleDetail = useCallback(
    (promo: Publicity): void => {
      router.push({
        pathname: "/publicities/detail",
        params: { data: JSON.stringify(promo) },
      });
    },
    [router],
  );

  const clearSearch = useCallback((): void => setSearch(""), []);
  const isMonthlyPromo = promoType === "monthly";
  const isLoading = isMonthlyPromo ? isLoadingPublicities : isLoadingPartners;
  const activeError = isMonthlyPromo ? publicityError : partnerError;

  if (isLoading) return <LoadingView />;

  return (
    <ContainerPage titleHeader="Promo" titleContent="Promo">
      <View className="mb-5 flex-row items-center rounded-3xl border border-gray-200 bg-white px-5 py-4">
        <Ionicons name="search-outline" size={26} color="#94A3B8" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari promo..."
          placeholderTextColor="#94A3B8"
          className="ml-3 flex-1 text-base text-slate-800"
        />
        {search.length > 0 && (
          <Pressable
            accessibilityLabel="Hapus pencarian"
            hitSlop={8}
            onPress={clearSearch}
          >
            <Ionicons name="close-circle" size={21} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      <View className="mb-7 rounded-3xl bg-[#F3F0F7] p-1.5">
        <View className="flex-row">
          {PROMO_TABS.map((tab) => {
            const isActive = promoType === tab.key;

            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => setPromoType(tab.key)}
                className={[
                  "min-h-[52px] flex-1 items-center justify-center rounded-[20px] px-3",
                  tab.key === "partner" ? "ml-1" : "",
                  isActive ? "bg-[#8F2DEA]" : "bg-transparent",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  isActive
                    ? {
                        shadowColor: "#6F3FA0",
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 4,
                      }
                    : undefined
                }
              >
                <Text
                  numberOfLines={1}
                  className={[
                    "text-[15px] font-bold",
                    isActive ? "text-white" : "text-slate-500",
                  ].join(" ")}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {activeError ? (
        <EmptyPromo message={getErrorMessage(activeError)} />
      ) : isMonthlyPromo ? (
        <FlatList
          data={filteredPromos}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PublicityCard item={item} onPress={() => handleDetail(item)} />
          )}
          ListEmptyComponent={
            <EmptyPromo
              message={
                search
                  ? "Promo yang dicari tidak ditemukan."
                  : "Belum ada promo bulan ini."
              }
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={LIST_CONTENT_STYLE}
        />
      ) : (
        <FlatList
          data={partnerPromos}
          keyExtractor={(item) => `partner-${item.id}`}
          renderItem={({ item }) => <PartnerPromoCard item={item} />}
          ListEmptyComponent={
            <EmptyPromo message="Belum ada promo mitra saat ini." />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={PARTNER_LIST_CONTENT_STYLE}
        />
      )}
    </ContainerPage>
  );
}
