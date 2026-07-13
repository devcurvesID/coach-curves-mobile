import { AuthProvider } from "@/context/auth";
import {
  pushNotification,
  registerForPushNotificationsAsync,
} from "@/services/push-notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import "../i18next/i18next";

pushNotification();
const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      console.log("notif =>", token);
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
        console.log("daaaa", data);

        // switch (data.type) {
        //   case "membership":
        //     router.push("/membership");
        //     break;

        //   case "workout":
        //     router.push(`/workout/${data.workoutId}`);
        //     break;

        //   case "club":
        //     router.push(`/club/${data.clubCode}`);
        //     break;
        // }

        // if (data.screen) {
        //   router.push({
        //     pathname: data.screen as any,
        //     params: {
        //       memberId: data.memberId,
        //     },
        //   });
        // }
      },
    );

    return () => subscription.remove();
  }, []);

  return null;
}
