import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import { registerForPushNotificationsAsync } from "@/services/push-notification";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const notifications = [
  {
    id: "2",
    title: "Welcome To Curves",
    message: "Selamat datang di Curves Indonesia.",
    date: "Kemarin",
    unread: false,
    type: "general",
  },
  {
    id: "1",
    title: "Membership Renewal",
    message: "Masa aktif member Anda akan berakhir 5 hari lagi.",
    date: "2 menit yang lalu",
    unread: true,
    type: "membership",
  },

  {
    id: "3",
    title: "New Workout Program",
    message: "Program latihan baru tersedia untuk Anda.",
    date: "2 hari lalu",
    unread: false,
    type: "workout",
  },
];
export default function NotificationScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
  const openNotification = (item: any) => {
    setSelectedNotification(item);
    setVisible(true);
  };
  async function sendPushNotification(expoPushToken: string) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Original Title",
      body: "And here is the body!",
      data: { someData: "goes here" },
    };

    //   await fetch('https://exp.host/--/api/v2/push/send', {
    //     method: 'POST',
    //     headers: {
    //       Accept: 'application/json',
    //       'Accept-encoding': 'gzip, deflate',
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(message),
    //   });
  }
  const closeNotification = () => {
    setVisible(false);
  };
  const user_personal = user.user_personal;

  // 🔥 generate bulan (dinamis)

  return (
    <>
      <ContainerPage titleHeader="Notification" titleContent="Notification">
        <View
          className="bg-white rounded-3xl px-4 py-4 flex-row items-center"
          style={{
            shadowColor: "#6F3FA0",
            shadowOpacity: 0.08,
            shadowRadius: 15,
            elevation: 4,
          }}
        >
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />

          <TextInput
            placeholder="Search notifications..."
            className="flex-1 ml-3 text-base"
          />
        </View>

        <View className="flex-row mt-4 mb-4">
          <TouchableOpacity
            onPress={async () => {
              await sendPushNotification(expoPushToken);
            }}
            className="bg-[#6F3FA0] px-4 py-2 rounded-full mr-2"
          >
            <Text className="text-white font-semibold">All</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white px-4 py-2 rounded-full mr-2">
            <Text className="text-gray-600">Unread</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white px-4 py-2 rounded-full">
            <Text className="text-gray-600">Promotion</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-2 pt-5 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((item, index) => {
            return <NotificationCard item={item} />;
          })}
        </ScrollView>
      </ContainerPage>
    </>
  );
}

function NotificationCard({ item }: any) {
  const renderIcon = () => {
    switch (item.type) {
      case "membership":
        return <Ionicons name="card-outline" size={24} color="#6F3FA0" />;

      case "workout":
        return (
          <MaterialCommunityIcons name="dumbbell" size={24} color="#6F3FA0" />
        );

      case "promotion":
        return <Ionicons name="gift-outline" size={24} color="#6F3FA0" />;

      default:
        return (
          <Ionicons name="notifications-outline" size={24} color="#6F3FA0" />
        );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="bg-white rounded-3xl p-4 mb-3"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View className="flex-row">
        <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center">
          {renderIcon()}
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-base text-gray-800 flex-1">
              {item.title}
            </Text>

            {item.unread && (
              <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
            )}
          </View>

          <Text className="text-gray-500 mt-1" numberOfLines={2}>
            {item.message}
          </Text>

          <Text className="text-xs text-gray-400 mt-2">{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
