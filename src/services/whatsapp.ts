import { Alert, Linking } from "react-native";

const formatWhatsAppPhoneNumber = (phoneNumber: string): string => {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
};

interface OpenWhatsAppOptions {
  phoneNumber?: string | number | null;
  message: string;
  unavailableMessage?: string;
}

export const openWhatsApp = async ({
  phoneNumber,
  message,
  unavailableMessage = "Nomor WhatsApp belum tersedia.",
}: OpenWhatsAppOptions): Promise<void> => {
  if (!phoneNumber) {
    Alert.alert("Nomor Tidak Tersedia", unavailableMessage);
    return;
  }
  const phone = formatWhatsAppPhoneNumber(String(phoneNumber));
  const encodedMessage = encodeURIComponent(message);
  const appUrl = `whatsapp://send?phone=${phone}&text=${encodedMessage}`;
  const webUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
  try {
    await Linking.openURL((await Linking.canOpenURL(appUrl)) ? appUrl : webUrl);
  } catch {
    Alert.alert(
      "WhatsApp Tidak Dapat Dibuka",
      "Silakan coba kembali beberapa saat lagi.",
    );
  }
};
