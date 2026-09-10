import { useAuth } from "@/context/auth";
import { validatePhoneNumber } from "@/helpers";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const OTP_LENGTH = 6;
const EMPTY_OTP = Array.from({ length: OTP_LENGTH }, () => "");

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Verifikasi belum berhasil. Silakan coba kembali.";
};

const VerificationOTPScreen = () => {
  const {
    userPhone,
    onCreateNewUser,
    checkUserNumberPhoneSignIn,
    codeverification,
    isLoading: isAuthLoading,
  } = useAuth();
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const isPhoneValid = useMemo(
    () => validatePhoneNumber(userPhone?.phone ?? ""),
    [userPhone?.phone],
  );
  const verificationCode = otp.join("");
  const isComplete = verificationCode.length === OTP_LENGTH;
  const isFetching = isAuthLoading || isSubmitting;

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) {
      setOtp((currentOtp) => {
        const nextOtp = [...currentOtp];
        nextOtp[index] = "";
        return nextOtp;
      });
      return;
    }

    setOtp((currentOtp) => {
      const nextOtp = [...currentOtp];
      numbers
        .slice(0, OTP_LENGTH - index)
        .split("")
        .forEach((digit, digitIndex) => {
          nextOtp[index + digitIndex] = digit;
        });
      return nextOtp;
    });

    const nextInputIndex = Math.min(index + numbers.length, OTP_LENGTH - 1);
    inputs.current[nextInputIndex]?.focus();
  };

  const handleBackspace = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!isComplete || isFetching) return;

    if (!userPhone) {
      Alert.alert(
        "Data Tidak Tersedia",
        "Data verifikasi tidak ditemukan. Silakan ulangi proses login.",
      );
      return;
    }

    if (!codeverification) {
      Alert.alert(
        "Kode Belum Tersedia",
        "Kode verifikasi belum diterima. Silakan coba beberapa saat lagi.",
      );
      return;
    }

    if (verificationCode !== String(codeverification)) {
      Alert.alert(
        "Kode Tidak Sesuai",
        "Periksa kembali enam digit kode verifikasi Anda.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (!isPhoneValid) {
        await onCreateNewUser({ ...userPhone, phone: userPhone.new_phone });
      } else {
        await checkUserNumberPhoneSignIn();
      }
    } catch (error: unknown) {
      Alert.alert("Verifikasi Gagal", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#6F3FA0]"
    >
      <View className="px-6 pt-20">
        <Text className="text-2xl font-bold text-white">Verifikasi OTP</Text>
        <Text className="mt-2 text-purple-200">
          Masukkan kode yang dikirim ke nomor kamu
        </Text>
      </View>

      <View className="mt-10 flex-1 rounded-t-[32px] bg-white px-6 pt-8">
        <View className="mb-8 flex-row justify-between">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              value={digit}
              editable={!isFetching}
              selectTextOnFocus
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleBackspace(nativeEvent.key, index)
              }
              onSubmitEditing={() => void handleSubmit()}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={index === 0 ? OTP_LENGTH : 1}
              accessibilityLabel={`Digit OTP ${index + 1}`}
              className={`h-14 w-12 rounded-xl border text-center text-xl font-bold text-slate-900 ${
                digit ? "border-purple-500 bg-purple-50" : "border-gray-300"
              }`}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Verifikasi kode OTP"
          accessibilityState={{ disabled: !isComplete || isFetching }}
          disabled={!isComplete || isFetching}
          onPress={() => void handleSubmit()}
          className={`items-center rounded-2xl py-4 ${
            isComplete && !isFetching ? "bg-[#5E2E91]" : "bg-gray-300"
          }`}
        >
          {isFetching ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="ml-2 text-lg font-semibold text-white">
                Memverifikasi...
              </Text>
            </View>
          ) : (
            <Text className="text-lg font-semibold text-white">
              Verifikasi
            </Text>
          )}
        </Pressable>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-500">Tidak menerima kode?</Text>
          <Pressable className="ml-2">
            <Text className="font-semibold text-[#5E2E91]">Kirim ulang</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerificationOTPScreen;
