import Text from "@/components/ui/text";
import {
  EmailAndUsernameInput,
  PasswordInput,
} from "@/components/ui/text-input";
import * as Notifications from "expo-notifications";
import React from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
export default function SettingScreen() {
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");

  const verifNotif = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Verification",
        body: "Terimakasih sudah melakukan verifikasi",
        data: {},
      },
      trigger: null,
    });
  };
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#6F3FA0]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView className="flex">
        <View className="flex-row justify-center">
          <Text
            variant="title"
            weight="bold"
            className="text-3xl font-bold ml-2 mt-5"
          >
            Welcome back!
          </Text>
        </View>
        <View className="flex-row justify-center">
          <Text weight="semibold" className="text-center text-base">
            You've been missed,{"\n"}
            Please sign in your account
          </Text>
        </View>
        <View className="flex-row justify-center">
          <Image
            source={require("@/assets/images/logocurves.png")}
            className="w-60 h-60 mt-8"
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
      <View
        className="flex-1 bg-white px-8 pt-8"
        style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={30}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-2">
              <EmailAndUsernameInput
                label="Email / Username"
                placeholder="curves@gmail.com"
                value={email}
                onChangeText={setEmail}
              />
              <PasswordInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-[#5E2E91] dark:bg-[#9A67EA] py-4 rounded-xl items-center mb-6"
              onPress={verifNotif}
            >
              <Text className="text-white font-semibold text-lg">Login</Text>
            </TouchableOpacity>
            {/* Register */}
            <TouchableOpacity className="items-center">
              <Text className="text-blue-600 font-medium">
                Login nomor ponsel ?
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <Text className="mx-3 text-gray-400">OR</Text>
              <View className="flex-1 h-[1px] bg-gray-300" />
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </View>
    </KeyboardAvoidingView>
  );
}
