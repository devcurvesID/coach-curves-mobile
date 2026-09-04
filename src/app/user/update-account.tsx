import ContainerPage from "@/components/ui/container-page";
import { useAuth } from "@/context/auth";
import { useUpdateAccount } from "@/hooks/useUsers";
import {
  updateAccountSchema,
  type UpdateAccountFormData,
} from "@/schemas/updateAccountSchema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface AccountInputProps {
  error?: string;
  isPassword?: boolean;
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

const AccountInput = ({
  error,
  isPassword = false,
  label,
  onChangeText,
  placeholder,
  value,
}: AccountInputProps) => {
  const [isSecure, setIsSecure] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-slate-700">{label}</Text>
      <View
        className={`flex-row items-center rounded-2xl border bg-white px-4 ${
          error
            ? "border-red-400"
            : isFocused
              ? "border-purple-600"
              : "border-slate-200"
        }`}
      >
        <Ionicons
          name={isPassword ? "lock-closed-outline" : "person-outline"}
          size={20}
          color={error ? "#EF4444" : "#7C3AED"}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword && isSecure}
          value={value}
          className="ml-3 flex-1 py-4 text-base text-slate-800"
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isSecure ? "Tampilkan password" : "Sembunyikan password"
            }
            hitSlop={8}
            onPress={() => setIsSecure((current) => !current)}
          >
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={21}
              color="#64748B"
            />
          </Pressable>
        )}
      </View>
      {error && <Text className="mt-1.5 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

const RequirementItem = ({
  isComplete,
  label,
}: {
  isComplete: boolean;
  label: string;
}) => (
  <View className="mt-2 flex-row items-center">
    <Ionicons
      name={isComplete ? "checkmark-circle" : "ellipse-outline"}
      size={17}
      color={isComplete ? "#059669" : "#94A3B8"}
    />
    <Text
      className={`ml-2 flex-1 text-xs ${
        isComplete ? "font-medium text-emerald-700" : "text-slate-500"
      }`}
    >
      {label}
    </Text>
  </View>
);

export default function UpdateAccountScreen() {
  const { user, signOut } = useAuth();

  const { mutateAsync: updateAccount, isPending } = useUpdateAccount();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
    mode: "onChange",
    defaultValues: {
      username: user.username ?? "",
      password: "",
      verify_password: "",
    },
  });
  const username = watch("username");
  const password = watch("password");
  const verifiedPassword = watch("verify_password");

  useEffect(() => {
    reset({
      username: user?.username ?? "",
      password: "",
      verify_password: "",
    });
  }, [reset, user?.username]);

  const submitAccountUpdate = async (formData: UpdateAccountFormData) => {
    try {
      setRequestError(null);
      await updateAccount({
        username: formData.username.trim(),
        password: formData.password,
        verify_password: formData.verify_password,
      });
      setIsSuccessVisible(true);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Username dan password gagal diperbarui.",
      );
    }
  };

  const logoutAfterUpdate = async () => {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <ContainerPage
        titleHeader="Ubah Akun"
        titleContent="Perbarui username dan password"
      >
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={24}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-32"
        >
          <LinearGradient
            colors={["#5B21B6", "#7C3AED", "#A855F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="mb-6 overflow-hidden rounded-3xl p-5"
          >
            <View className="flex-row items-center">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={29}
                  color="#FFFFFF"
                />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-white">
                  Lindungi Akun Anda
                </Text>
                <Text className="mt-1 text-sm leading-5 text-purple-100">
                  Gunakan informasi login yang kuat dan mudah Anda ingat.
                </Text>
              </View>
            </View>
            <View className="mt-5 flex-row items-center rounded-2xl bg-black/10 px-4 py-3">
              <Ionicons name="log-out-outline" size={18} color="#F3E8FF" />
              <Text className="ml-2 flex-1 text-xs leading-5 text-purple-100">
                Anda akan diminta login kembali setelah perubahan berhasil.
              </Text>
            </View>
          </LinearGradient>

          <View className="mb-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <Text className="text-lg font-bold text-slate-900">
              Informasi Login Baru
            </Text>
            <Text className="mb-5 mt-1 text-sm text-slate-500">
              Lengkapi semua informasi di bawah ini.
            </Text>

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <AccountInput
                  label="Username Baru"
                  placeholder="Masukkan username baru"
                  value={value}
                  onChangeText={onChange}
                  error={errors.username?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <AccountInput
                  isPassword
                  label="Password Baru"
                  placeholder="Masukkan password baru"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="verify_password"
              render={({ field: { onChange, value } }) => (
                <AccountInput
                  isPassword
                  label="Konfirmasi Password Baru"
                  placeholder="Ulangi password baru"
                  value={value}
                  onChangeText={onChange}
                  error={errors.verify_password?.message}
                />
              )}
            />
          </View>

          <View className="mb-5 rounded-2xl border border-purple-100 bg-purple-50/60 px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={20} color="#7C3AED" />
              <Text className="ml-2 text-sm font-bold text-purple-900">
                Ketentuan akun
              </Text>
            </View>
            <RequirementItem
              isComplete={/^[A-Za-z0-9._]{4,30}$/.test(username.trim())}
              label="Username 4–30 karakter tanpa spasi"
            />
            <RequirementItem
              isComplete={password.length >= 8}
              label="Password minimal 8 karakter"
            />
            <RequirementItem
              isComplete={
                /[a-z]/.test(password) &&
                /[A-Z]/.test(password) &&
                /[0-9]/.test(password)
              }
              label="Mengandung huruf besar, huruf kecil, dan angka"
            />
            <RequirementItem
              isComplete={password.length > 0 && password === verifiedPassword}
              label="Konfirmasi password sesuai"
            />
          </View>

          {requestError && (
            <View className="mb-5 flex-row items-start rounded-2xl bg-red-50 px-4 py-3">
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text className="ml-2 flex-1 text-sm leading-5 text-red-600">
                {requestError}
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={!isValid || isPending}
            onPress={handleSubmit(submitAccountUpdate)}
            className={`flex-row items-center justify-center rounded-2xl py-4 ${
              isValid && !isPending
                ? "bg-purple-700 active:bg-purple-800"
                : "bg-slate-300"
            }`}
          >
            {isPending ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="ml-2 text-base font-bold text-white">
                  Menyimpan...
                </Text>
              </>
            ) : (
              <Text className="text-base font-bold text-white">
                Simpan Perubahan
              </Text>
            )}
          </Pressable>
        </KeyboardAwareScrollView>
      </ContainerPage>

      <Modal
        visible={isSuccessVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => void logoutAfterUpdate()}
      >
        <View className="flex-1 items-center justify-center bg-black/55 px-6">
          <View className="w-full max-w-sm items-center rounded-[28px] bg-white px-6 pb-6 pt-8 shadow-2xl">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-emerald-500">
                <Ionicons name="checkmark" size={34} color="#FFFFFF" />
              </View>
            </View>
            <Text className="mt-5 text-center text-xl font-bold text-slate-900">
              Akun Berhasil Diperbarui
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
              Username dan password berhasil diubah. Silakan login kembali
              menggunakan akun baru Anda.
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={isSigningOut}
              onPress={() => void logoutAfterUpdate()}
              className="mt-6 w-full flex-row items-center justify-center rounded-2xl bg-purple-700 py-4"
            >
              {isSigningOut && (
                <ActivityIndicator size="small" color="#FFFFFF" />
              )}
              <Text
                className={`${isSigningOut ? "ml-2" : ""} font-bold text-white`}
              >
                {isSigningOut ? "Keluar..." : "Login Kembali"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
