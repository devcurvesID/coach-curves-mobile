export const JWT_EXPIRATION_TIME = "20s"; // 20 seconds
export const JWT_SECRET = process.env.JWT_SECRET!;
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;
export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/callback`;
export const REFRESH_TOKEN_EXPIRY = "60h"; // 30 days

export const API_KEY = "921ba5b747274facb0fa0541e919b455";
export const COOKIE_NAME = "auth_token";
export const COOKIE_MAX_AGE = 20; // 20 seconds
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};
export const REFRESH_COOKIE_NAME = "refresh_token";
export const PATH_PUBLIC_IMAGE_MEMBER =
  process.env.EXPO_PUBLIC_IMAGE_MEMBER_URL!;
export const PATH_PUBLIC_IMAGE_REWARD =
  process.env.EXPO_PUBLIC_IMAGE_REWARD_URL!;
export const PATH_PUBLIC_IMAGE_PUBLICITY =
  process.env.EXPO_PUBLIC_IMAGE_PUBLICITY_URL!;
export const PATH_PUBLIC_IMAGE_CLUB = process.env.EXPO_PUBLIC_IMAGE_CLUB_URL!;
