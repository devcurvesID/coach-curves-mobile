import { AuthProvider } from "@/context/auth";
import {
  configureNotificationHandler,
  registerForPushNotificationsAsync,
} from "@/services/push-notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import "../i18next/i18next";

configureNotificationHandler();
const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    void registerForPushNotificationsAsync().catch(() => {
      // Push token dapat dicoba kembali saat aplikasi dibuka berikutnya.
    });
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
          <NotificationHandler />
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function NotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        const targetScreen = data?.screen;
        if (
          typeof targetScreen === "string" &&
          targetScreen.startsWith("/")
        ) {
          router.push(targetScreen as Href);
        }
      },
    );

    return () => subscription.remove();
  }, [router]);

  return null;
}
