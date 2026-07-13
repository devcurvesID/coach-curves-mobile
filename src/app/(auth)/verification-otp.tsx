import { useAuth } from "@/context/auth";
import { validatePhoneNumber } from "@/helpers";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const VerificationOTPScreen = () => {
  const {
    userPhone,
    onCreateNewUser,
    checkNumberPhoneUser,
    checkUserNumberPhoneSignIn,
    codeverification,
  } = useAuth();
  console.log("otp =>", codeverification);

  const cek_phone_valid = validatePhoneNumber(userPhone.phone);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // pindah ke next
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  const handleSubmit = async () => {
    const code = otp.join("");
    try {
      if (code != codeverification) {
        throw new Error("kode verifikasi tidak sesuai");
      }
      if (!cek_phone_valid) {
        await onCreateNewUser({ ...userPhone, phone: userPhone.new_phone });
      } else {
        await checkUserNumberPhoneSignIn();
      }
    } catch (error: any) {
      alert(error?.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#6F3FA0]"
    >
      {/* HEADER */}
      <View className="px-6 pt-20">
        <Text className="text-white text-2xl font-bold">Verifikasi OTP</Text>
        <Text className="text-purple-200 mt-2">
          Masukkan kode yang dikirim ke nomor kamu
        </Text>
      </View>

      {/* FORM */}
      <View className="flex-1 bg-white rounded-t-[32px] mt-10 px-6 pt-8">
        {/* OTP INPUT */}
        <View className="flex-row justify-between mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleBackspace(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-xl"
            />
          ))}
        </View>

        {/* BUTTON */}
        <Pressable
          disabled={!isComplete}
          onPress={handleSubmit}
          className={`py-4 rounded-2xl items-center ${
            isComplete ? "bg-[#5E2E91]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white font-semibold text-lg">Verifikasi</Text>
        </Pressable>

        {/* RESEND */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Tidak menerima kode?</Text>
          <Pressable className="ml-2">
            <Text className="text-[#5E2E91] font-semibold">Kirim ulang</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerificationOTPScreen;
