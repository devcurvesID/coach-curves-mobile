import Text from "@/components/ui/text";
// import { LinearGradient } from "expo-linear-gradient";
import ContainerAuth from "@/components/ui/container-auth";
import { NumberPhoneInput } from "@/components/ui/text-input";
import { useAuth } from "@/context/auth";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const LoginPhoneScreen = () => {
  const { checkNumberPhoneUser } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = React.useState("");
  const checkNumberPhone = async () => {
    try {
      await checkNumberPhoneUser(phone);
    } catch (error: any) {
      console.log("error:", error?.message);
    }
  };
  return (
    <ContainerAuth>
      <View className="gap-2">
        <NumberPhoneInput
          label="Login Nomor Ponsel"
          placeholder="81234567890"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Login Button */}
      <Pressable
        className="bg-[#5E2E91] dark:bg-[#9A67EA] py-4 rounded-xl items-center mb-6"
        onPress={checkNumberPhone}
      >
        <Text className="text-white font-semibold text-lg">Login</Text>
      </Pressable>

      <View className="mt-10">
        {/* Register */}
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/(auth)")}
        >
          <Text className="text-blue-600 font-medium">
            Login Username & Password ?
          </Text>
        </TouchableOpacity>
        {/* Divider */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-3 text-gray-400">OR</Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>
      </View>
    </ContainerAuth>
  );
};

export default LoginPhoneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "orange",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  button: {
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  text: {
    backgroundColor: "transparent",
    fontSize: 15,
    color: "#fff",
  },
});
