import { PATH_PUBLIC_IMAGE_MEMBER } from "@/utils/constants";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL; //"http://127.0.0.1:3000";
export const imageProfileURL = (filename?: string) => {
  if (!filename) {
    return "https://i.pravatar.cc/300";
  }
  // Mencari posisi indeks titik "." lalu ditambah 1 agar mulainya setelah titik
  const dotIndex = filename.indexOf(".") + 1;
  // Ekstrak dari posisi setelah titik sampai akhir
  const result = filename.substring(dotIndex);
  if (result === "webp") {
    let url = `${BASE_URL}/api/profile-image/${filename}`;
    return url;
  }
  return `${PATH_PUBLIC_IMAGE_MEMBER}/${filename}`;
};
