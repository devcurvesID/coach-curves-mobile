import ContainerPage from "@/components/ui/container-page";
import FormInput from "@/components/ui/form-input";
import Section from "@/components/ui/section";
import { useAuth } from "@/context/auth";
import { userSchema } from "@/schemas/userSchema";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Item from "@/components/ui/item";
import { LoadingView } from "@/components/ui/loading";
import { SelectItemView } from "@/components/ui/select-item";
import {
  useDistricts,
  useProvinces,
  useRegencies,
  useVillages,
} from "@/hooks/useRegions";
import { useUpdateUser } from "@/hooks/useUsers";
import { api } from "@/lib/axios";
import { imageProfileURL } from "@/services/image";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface RegionProps {
  data: any[];
  onSelect: (data: any) => void;
  errors?: any;
  control?: any;
  values?: any;
}
function RegionsDropdown({
  data,
  errors,
  control,
  values,
  onSelect,
}: RegionProps) {
  const [region, setRegion] = useState<any>({
    province_name: "",
    regency_name: "",
    district_name: "",
    village_name: "",
  });
  const {
    mutate: regenciesByProvIdFn,
    data: regencies,
    isPending: isPendingRegency,
  } = useRegencies();
  const {
    mutate: districtByRegIdFn,
    data: districts,
    isPending: isPendingDistrict,
  } = useDistricts();

  const {
    mutate: villagesByDiscIdFn,
    data: villages,
    isPending: isPendingVillage,
  } = useVillages();
  const onSelectProv = async (data: any) => {
    console.log("data ==>", data);
    setRegion({
      ...region,
      province_name: data.name,
      province_id: data._id,
    });
    await regenciesByProvIdFn(data._id);
  };

  const onSelectKab = async (data: any) => {
    console.log("kab :", data);
    setRegion({
      ...region,
      regency_name: data.name,
      regency_id: data._id,
    });
    onSelect({
      ...region,
      regency_name: data.name,
      regency_id: data._id,
    });
    await districtByRegIdFn(data._id);
    // onSelect(region);
  };
  const onSelectKec = async (data: any) => {
    console.log("kec :", data);
    setRegion({
      ...region,
      district_name: data.name,
      district_id: data._id,
    });
    onSelect({
      ...region,
      district_name: data.name,
      district_id: data._id,
    });
    await villagesByDiscIdFn(data._id);
  };

  const onSelectKelDesa = (data: any) => {
    setRegion({
      ...region,
      village_name: data.name,
      village_id: data._id,
    });
    onSelect({
      ...region,
      village_name: data.name,
      village_id: data._id,
    });
  };
  return (
    <>
      <Controller
        control={control}
        name="province_name"
        render={({ field: { onChange, value } }) => (
          <SelectItemView
            label={"Propinsi :"}
            data={data}
            placeholder={
              values.province_name
                ? values.province_name
                : "-- Pilih Propinsi --"
            }
            searchPlaceholder="Cari Propinsi"
            emptyMessage="data tidak ditemukan"
            onSelect={(data) => {
              onChange(data.name);
              onSelectProv(data);
            }}
            error={errors.province_name?.message}
          />
        )}
      />

      {!isPendingRegency && (
        <Controller
          control={control}
          name="regency_name"
          render={({ field: { onChange, value } }) => (
            <SelectItemView
              label={"Kabupaten / Kota :"}
              data={regencies}
              placeholder={
                values.regency_name
                  ? values.regency_name
                  : "-- Pilih Kabupaten / Kota --"
              }
              searchPlaceholder="Cari Kabupaten / Kota"
              emptyMessage="data tidak ditemukan / Kota"
              onSelect={(data) => {
                onChange(data.name);
                onSelectKab(data);
              }}
              error={errors.regency_name?.message}
            />
          )}
        />
      )}

      {!isPendingDistrict && (
        <Controller
          control={control}
          name="district_name"
          render={({ field: { onChange, value } }) => (
            <SelectItemView
              label={"Kecamatan :"}
              data={districts}
              placeholder={
                values.district_name
                  ? values.district_name
                  : "-- Pilih Kecamatan --"
              }
              searchPlaceholder="Cari Kecamatan"
              emptyMessage="data tidak ditemukan"
              onSelect={(data) => {
                onChange(data.name);
                onSelectKec(data);
              }}
              error={errors.district_name?.message}
            />
          )}
        />
      )}

      {!isPendingVillage && (
        <Controller
          control={control}
          name="village_name"
          render={({ field: { onChange, value } }) => (
            <SelectItemView
              label={"Kelurahan / Desa :"}
              data={villages}
              placeholder={
                values.village_name
                  ? values.village_name
                  : "-- Pilih Kelurahan / Desa --"
              }
              searchPlaceholder="Cari Kelurahan / Desa"
              emptyMessage="data tidak ditemukan"
              onSelect={(data) => {
                onChange(data.name);
                onSelectKelDesa(data);
              }}
              error={errors.village_name?.message}
            />
          )}
        />
      )}
    </>
  );
}

export default function EditProfileScreen() {
  const { data: provinces, isLoading: isLoadingProv } = useProvinces();
  const [imageLoading, setImageLoading] = useState(false);
  const router = useRouter();
  const {
    user,
    signOut,
    isLoading: isLoadingUser,
    onReloadUserMobile,
  } = useAuth();
  const user_personal = user.user_personal;
  console.log("user_personal", user_personal);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const {
    address,
    tshirt_size,
    nik,
    province_name,
    regency_name,
    district_name,
    village_name,
  } = user_personal;
  console.log("user_personal", user_personal);
  const {
    mutate: updateUserIdFn,
    data: userUpdate,
    isPending: isPendingUpdateUser,
  } = useUpdateUser();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      // email: user.email,
      // phone: `${String(user_personal.phone)}`,
      province_name: province_name ? province_name : "",
      regency_name: regency_name ? regency_name : "",
      district_name: district_name ? district_name : "",
      village_name: village_name ? village_name : "",
      address: address ? address : "",
      tshirt_size: tshirt_size ? tshirt_size.toString() : "",
      nik: nik ? nik.toString() : "",
    },
  });
  console.log("errors", errors);

  const onSubmit = async (data: any) => {
    try {
      setImageLoading(true);
      console.log("errors", errors);
      let body_req = {
        ...data,
        tshirt_size: Number(data.tshirt_size),
        nik: Number(data.nik),
      };
      await updateUserIdFn(body_req);
      await onReloadUserMobile();

      // await signOut();
      alert("data berhasil diupdate, silahkan login kembali");
      router.back();

      // 🔥 call API di sini
    } catch (error) {
      console.log("error", error);
    } finally {
      setImageLoading(false);
    }
  };
  if (isPendingUpdateUser || isLoadingUser) {
    return <LoadingView />;
  }
  const onSelectRegion = (data: any) => {
    console.log("regggg", data);
  };
  const uploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();
    // const imageResponse = await fetch(asset.uri);
    // const blob = await imageResponse.blob();
    formData.append("photo", {
      uri: asset.uri,
      name: asset.fileName || "photo.jpg",
      type: asset.mimeType || "image/jpeg",
    } as any);
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-platform-os": Platform.OS,
      },
    });
    return response.data;
  };
  const pickImage = async () => {
    try {
      setImageLoading(true);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Izin Ditolak", "Aplikasi memerlukan akses galeri.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        console.log(JSON.stringify(asset, null, 2));
        setPhotoUri(asset.uri);
        console.log(result.assets[0]);
        await uploadPhoto(asset);
        await onReloadUserMobile();
        router.back();
      }
    } catch (error: any) {
      alert(JSON.stringify(error));
      console.log("error", error);
    } finally {
      setImageLoading(false);
    }
  };

  if (imageLoading) {
    return <LoadingView />;
  }

  return (
    <ContainerPage
      titleHeader="Edit Profil"
      titleContent="Edit Profil Pengguna"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-2 pt-5 pb-32"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <View className="relative">
              <LinearGradient
                colors={["#6F3FA0", "#BB86FC"]}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{
                    uri: imageProfileURL(user_personal.photo),
                  }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                  }}
                />
              </LinearGradient>

              {/* BUTTON CAMERA */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={pickImage}
                className="absolute bottom-0 right-0 bg-[#6F3FA0] w-10 h-10 rounded-full items-center justify-center border-2 border-white"
                style={{
                  elevation: 5,
                }}
              >
                <Ionicons name="camera" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          {/* ACCOUNT */}
          <Section title="Account Info">
            <Item label="Nama" value={user.name} iconKey="name" />

            {/* <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Nama"
                  value={value}
                  onChangeText={onChange}
                  icon={<Ionicons name="person" size={18} color="#6366F1" />}
                  error={errors.name?.message}
                />
              )}
            /> */}
            <Controller
              control={control}
              name="nik"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="NIK"
                  value={value}
                  onChangeText={onChange}
                  icon={<Ionicons name="person" size={18} color="#6366F1" />}
                  error={errors.nik?.message}
                />
              )}
            />
          </Section>

          {/* PERSONAL */}
          <Section title="Personal Info">
            <Controller
              control={control}
              name="tshirt_size"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Ukuran Kaos"
                  value={value}
                  onChangeText={onChange}
                  icon={
                    <MaterialCommunityIcons
                      name="tshirt-crew"
                      size={18}
                      color="#8B5CF6"
                    />
                  }
                  error={errors.tshirt_size?.message}
                />
              )}
            />
          </Section>

          {/* CONTACT */}
          {/* <Section title="Contact">
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Phone"
                  value={value}
                  onChangeText={onChange}
                  icon={<Ionicons name="call" size={18} color="#22C55E" />}
                  error={errors.phone?.message}
                />
              )}
            />
          </Section> */}

          {/* ADDRESS */}
          <Section title="Alamat">
            {!isLoadingProv && !isLoadingUser && (
              <RegionsDropdown
                data={provinces}
                control={control}
                errors={errors}
                values={user_personal}
                onSelect={onSelectRegion}
              />
            )}

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Alamat"
                  value={value}
                  onChangeText={onChange}
                  icon={<Ionicons name="location" size={18} color="#F97316" />}
                  error={errors.address?.message}
                />
              )}
            />
          </Section>

          {/* BUTTON */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="bg-purple-700 py-4 rounded-xl mt-4"
          >
            <Text className="text-white text-center font-bold">
              Simpan Perubahan
            </Text>
          </TouchableOpacity>

          <View className="h-10" />
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </ContainerPage>
  );
}
