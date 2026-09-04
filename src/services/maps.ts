import { Alert, Linking } from "react-native";

interface OpenGoogleMapsOptions {
  address?: string | null;
  placeName?: string | null;
}

export const openGoogleMaps = async ({
  address,
  placeName,
}: OpenGoogleMapsOptions): Promise<void> => {
  const location = [placeName?.trim(), address?.trim()]
    .filter(Boolean)
    .join(" ");
  if (!location) {
    Alert.alert("Lokasi Tidak Tersedia", "Informasi lokasi belum tersedia.");
    return;
  }
  try {
    await Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
    );
  } catch {
    Alert.alert(
      "Google Maps Tidak Dapat Dibuka",
      "Silakan coba kembali beberapa saat lagi.",
    );
  }
};
