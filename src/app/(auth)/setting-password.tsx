import ContainerPage from "@/components/ui/container-page";
import Item from "@/components/ui/item";
import Section from "@/components/ui/section";
import {
  NumberPhoneInput,
  PasswordInput,
  UsernameInput,
} from "@/components/ui/text-input";
import { useAuth } from "@/context/auth";
import { validatePhoneNumber } from "@/helpers";
import { formatDate } from "@/helpers/dates";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput } from "react-native";

const SettingPasswordScreen = () => {
  const { onCreateNewUser, setUserPhone, userPhone } = useAuth();
  const cek_phone_valid = validatePhoneNumber(userPhone.phone);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [verifPassword, setVerifPassword] = React.useState("");
  useEffect(() => {
    inputs.current[0]?.focus();
    setUsername(userPhone.username);
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

  const isComplete = username && password && verifPassword ? true : false; //otp.every((digit) => digit !== "");

  const handleSubmit = async () => {
    const code = otp.join("");
    console.log("OTP:", code);
    if (!cek_phone_valid) {
      setUserPhone({
        ...userPhone,
        username,
        password,
        new_phone: phone,
        verify_password: verifPassword,
      });
      router.push("/(auth)/verification-otp");
    } else {
      await onCreateNewUser({
        username,
        password,
        verify_password: verifPassword,
      });
    }
  };

  return (
    <ContainerPage
      titleHeader="Buat Password"
      titleContent="Masukkan password baru"
    >
      {/* FORM */}
      <ScrollView
        contentContainerClassName="px-2 pt-5 pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* ACCOUNT */}
        <Section title="Informasi Member">
          <Item label="Nama" value={userPhone.name} iconKey="name" />
          <Item
            label="Nama Club"
            value={userPhone.club_name}
            iconKey="joined"
          />
          {cek_phone_valid && (
            <Item label="Phone" value={userPhone.phone} iconKey="phone" />
          )}
          <Item
            label="Tanggal Daftar"
            value={formatDate(userPhone.created_at)}
            iconKey="joined"
          />
          <Item
            label="Tanggal Bergabung"
            value={formatDate(userPhone.joined)}
            iconKey="joined"
          />
          <Item label="Alamat" value={userPhone.address} iconKey="address" />
          <Item
            label="Status Member"
            value={userPhone.status}
            iconKey={
              userPhone.status == "Active"
                ? "person-active"
                : "person-non-active"
            }
          />
        </Section>
        {/* OTP INPUT */}
        {!cek_phone_valid && (
          <NumberPhoneInput
            label="Inputkan nomor ponsel"
            placeholder="81234567890"
            value={phone}
            onChangeText={setPhone}
          />
        )}
        <UsernameInput
          label="Buat Username"
          placeholder="inputkan username"
          value={username}
          onChangeText={setUsername}
        />
        <PasswordInput
          label="Password baru"
          placeholder="Inputkan password baru"
          value={password}
          onChangeText={setPassword}
        />
        <PasswordInput
          label="Verifikasi password baru"
          placeholder="Inputkan verifikasi password baru"
          value={verifPassword}
          onChangeText={setVerifPassword}
        />

        {/* BUTTON */}
        <Pressable
          disabled={!isComplete}
          onPress={handleSubmit}
          className={`py-4 rounded-2xl items-center ${
            isComplete ? "bg-[#5E2E91]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white font-semibold text-lg">Simpan</Text>
        </Pressable>
      </ScrollView>
    </ContainerPage>
  );
};

export default SettingPasswordScreen;
