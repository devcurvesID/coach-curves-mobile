import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface QuickMessage {
  id: string;
  title: string;
  text: string;
}

interface QuickMessageModalProps {
  onCancel: () => void;
  onSelect: (message: string) => void;
  visible: boolean;
}

const QUICK_MESSAGES: QuickMessage[] = [
  {
    id: "workout-today",
    title: "Ajakan Workout Hari Ini",
    text: `Hai Member Curves! 👋
Yuk, sempatkan workout hari ini agar tubuh tetap sehat, bugar, dan target latihan bulan ini dapat tercapai.
Kami tunggu kedatangannya di Curves ya! 💪❤️`,
  },
  {
    id: "grand-prize-workout",
    title: "Grand Prize 12x Latihan",
    text: `Dear Member Curves yang kami cintai,
Penimbangan + 12x Latihan akan mendapatkan 1 kupon undian GRAND PRIZE OLAHRAGA SETAHUN GRATIS.
Anda juga mendapatkan kesempatan memenangkan hadiah harian senilai Rp2.500.000!
Mari kita terus berbahagia, bergembira dan bersyukur!
Sungguh menyenangkan berada di Curves ❤️`,
  },
  {
    id: "twelve-workouts",
    title: "Target 12 Kali Latihan",
    text: `Selamat Berlatih dan Capai 12 Kali Latihan Bulan Ini dan Dapatkan Tas Sepatu! Ayo Semangat :)
Jangan Lupa Ikuti Aktivitas Harian dan Menangkan Hadiah yang Kece-kece :)`,
  },
  {
    id: "sos-kinderdorf",
    title: "Donasi & Potluck Party",
    text: `Hallo Members!
Sudahkah memberikan donasi untuk SOS Kinderdorf? Bagi yang belum masih dapat diserahkan melalui coach kami ya :)
Jangan lupa ikuti KONTES MEMASAK dan POTLUCK PARTY tanggal 25 APRIL pk 18.00 - 19.30.
Semangat selalu dan jangan lupa selalu mengkonsumsi makanan sehat ya! :)`,
  },
  {
    id: "back-to-school",
    title: "Poin & Back to School",
    text: `Hai Members!
Ayo kumpulkan minimal 750 poin untuk mendapatkan undian hadiah Grand Prize Choose Exercise Bag, Visor, Note Book, Sock, Shoe Lace dan hadiah menarik lainnya untuk ranking 2 sampai 5.
Jangan lupa datang di Back to School Party tanggal 16 September pk 18.30 dengan outfit sekolah ala kamu ya.`,
  },
  {
    id: "daily-prize",
    title: "Daily Prize & Grand Prize",
    text: `Ada banyak hadiah yang menanti!
Teruslah berolahraga dan dapatkan kesempatan mendapatkan Hadiah Utama 1 tahun perpanjangan keanggotaan untuk Anda dan 1 tahun keanggotaan GRATIS untuk teman-teman Anda.
Dapatkan 2 kupon daily prize jika Anda berlatih mulai di hari Senin 2 Desember! 🎉
Mari kita terus berbahagia, bergembira dan bersyukur!
Sungguh menyenangkan berada di Curves ❤️`,
  },
  {
    id: "monthly-promo",
    title: "Promo Bulanan & Donasi",
    text: `Yuk ikuti promo kita di bulan ini. Dengan melakukan donasi, Anda akan mendapatkan 20 entries.

Dapatkan hadiah mingguan dengan cara berlatih 3x dalam seminggu dan extra workout yang akan diundi.`,
  },
  {
    id: "weekly-entries",
    title: "Weekly Entries",
    text: `Dapatkan weekly entries setiap minggu dengan cara:
• Latihan minimal 3x seminggu
• Dapatkan tambahan extra workout
• Yuk berdonasi untuk mendapatkan 20 entries`,
  },
  {
    id: "member-referral",
    title: "Undian Referral Teman",
    text: `Berikan nama dan nomor telepon teman Anda untuk dimasukkan ke kotak undian dan Anda akan berkesempatan mendapatkan 2 bulan keanggotaan GRATIS!`,
  },
];

export const QuickMessageModal = ({
  onCancel,
  onSelect,
  visible,
}: QuickMessageModalProps) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onCancel}
  >
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center border-b border-slate-200 bg-white px-5 py-4">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-purple-100">
          <Ionicons name="flash-outline" size={22} color="#6F3FA0" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-black text-slate-900">Pesan Cepat</Text>
          <Text className="mt-0.5 text-xs text-slate-500">
            Pilih template, lalu periksa sebelum mengirim
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutup pesan cepat"
          onPress={onCancel}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
        >
          <Ionicons name="close" size={21} color="#475569" />
        </Pressable>
      </View>

      <FlatList
        data={QUICK_MESSAGES}
        keyExtractor={(message) => message.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Gunakan template ${item.title}`}
            onPress={() => onSelect(item.text)}
            className="mb-4 overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm active:bg-purple-50"
          >
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-purple-100">
                <Text className="font-black text-purple-700">{index + 1}</Text>
              </View>
              <Text className="ml-3 flex-1 text-base font-black text-slate-900">
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
            </View>
            <Text
              numberOfLines={4}
              className="mt-3 text-sm leading-5 text-slate-600"
            >
              {item.text}
            </Text>
            <View className="mt-4 flex-row items-center">
              <Ionicons name="create-outline" size={15} color="#6F3FA0" />
              <Text className="ml-1.5 text-xs font-bold text-purple-700">
                Gunakan template
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  </Modal>
);
