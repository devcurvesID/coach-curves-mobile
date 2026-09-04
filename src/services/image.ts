import {
  PATH_PUBLIC_IMAGE_CLUB,
  PATH_PUBLIC_IMAGE_MEMBER,
  PATH_PUBLIC_IMAGE_PUBLICITY,
} from "@/utils/constants";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL; //"http://127.0.0.1:3000";
const DEFAULT_PUBLIC_IMAGE_URL = "https://placehold.co/600x400/png";

export const clubImageURL = (filename?: string): string =>
  filename ? `${PATH_PUBLIC_IMAGE_CLUB}/${filename}` : DEFAULT_PUBLIC_IMAGE_URL;
export const publicityImageURL = (filename?: string): string =>
  filename
    ? `${PATH_PUBLIC_IMAGE_PUBLICITY}/${filename}`
    : DEFAULT_PUBLIC_IMAGE_URL;

export function imageProfileURL(
  memberNameOrFilename?: string,
  profileFilename?: string,
): string {
  const hasMemberName = arguments.length > 1;
  const filename = hasMemberName ? profileFilename : memberNameOrFilename;
  if (!filename) {
    const memberName = hasMemberName ? memberNameOrFilename : "Member Curves";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName || "Member Curves")}&background=E879A8&color=fff`;
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
}
