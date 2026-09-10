import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const DEFAULT_NOTIFICATION_CHANNEL_ID = "default";

interface LocalNotificationInput {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

let permissionRequest: Promise<boolean> | null = null;

export const configureNotificationHandler = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

const configureAndroidNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(
    DEFAULT_NOTIFICATION_CHANNEL_ID,
    {
      name: "Notifikasi Curves",
      description: "Aktivitas workout, pembayaran, dan informasi member.",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6F3FA0",
      sound: "default",
    },
  );
};

const checkNotificationPermissionAsync = async (): Promise<boolean> => {
  if (Platform.OS === "web") return false;

  await configureAndroidNotificationChannel();
  const currentPermission = await Notifications.getPermissionsAsync();
  if (currentPermission.granted) return true;

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return requestedPermission.granted;
};

export const requestNotificationPermissionAsync = (): Promise<boolean> => {
  if (!permissionRequest) {
    permissionRequest = checkNotificationPermissionAsync().catch((error) => {
      permissionRequest = null;
      throw error;
    });
  }
  return permissionRequest;
};

export const registerForPushNotificationsAsync = async (): Promise<
  string | null
> => {
  if (!Device.isDevice || !(await requestNotificationPermissionAsync())) {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) {
    throw new Error("EAS project ID untuk push notification belum tersedia.");
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
};

export const scheduleLocalNotificationAsync = async ({
  title,
  body,
  data = {},
}: LocalNotificationInput): Promise<string | null> => {
  if (!(await requestNotificationPermissionAsync())) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: "default",
    },
    trigger: null,
  });
};
