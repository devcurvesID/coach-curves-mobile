import Text from "@/components/ui/text";
// import { LinearGradient } from "expo-linear-gradient";
import ContainerAuth from "@/components/ui/container-auth";
import {
  EmailAndUsernameInput,
  PasswordInput,
} from "@/components/ui/text-input";
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

const LoginScreen = () => {
  const { signInWithUsernamePassword } = useAuth();
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [secure, setSecure] = React.useState(true);
  const [email, setEmail] = React.useState("");
  // useEffect(() => {
  //   const testNetwork = async () => {
  //     try {
  //       const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  //       const data = await res.json();
  //       console.log("SUCCESS", data);
  //       alert(JSON.stringify(data));
  //     } catch (e) {
  //       console.log("ERROR", e);
  //       alert(JSON.stringify(e));
  //     }
  //   };
  //   testNetwork();
  // }, []);

  const loginUser = async () => {
    try {
      await signInWithUsernamePassword(email, password);
    } catch (error: any) {
      console.log("error:", error?.message);
    }
  };
  return (
    <ContainerAuth>
      {/* Email */}
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
      <Pressable
        className="bg-[#5E2E91]  py-4 rounded-xl items-center mb-6"
        onPress={loginUser}
      >
        <Text className="text-white font-semibold text-lg">Login</Text>
      </Pressable>
      <View className="mt-10">
        {/* Register */}
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/(auth)/login-phone")}
        >
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
      </View>
    </ContainerAuth>
  );
};

export default LoginScreen;

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
