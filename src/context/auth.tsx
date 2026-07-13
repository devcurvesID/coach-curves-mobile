import { validatePhoneNumber } from "@/helpers";
import { api } from "@/lib/axios";
import { socket } from "@/services/socket";
import { tokenCache } from "@/utils/cache";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React from "react";

interface AuthContextType {
  user: any;
  userPhone: any;
  setUserPhone: (data: any) => void;
  isLoading: boolean;
  signInWithUsernamePassword: (
    username: string,
    password: string,
  ) => Promise<void>;
  checkNumberPhoneUser: (phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUserNumberPhoneSignIn: () => Promise<void>;
  onCreateNewUser: (data: any) => Promise<void>;
  codeverification: any;
  onReloadUserMobile: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
  const [userPhone, setUserPhone] = React.useState<any | null>(null);
  const [codeverification, setCodeverification] = React.useState<any | null>(
    null,
  );

  const onReloadUserMobile = async () => {
    try {
      setIsLoading(true);
      const req_user_pengguna = await api.get("/auth/me");
      const data_user = req_user_pengguna.data;
      setUser({ ...user, ...data_user });
      socket.emit("user-curves", `${data_user._id}_${data_user.source_id}`);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const cek_usertoken = async () => {
      setIsLoading(true);
      const token = await tokenCache?.getToken("accessToken");
      if (token) {
        await onReloadUserMobile();
      }
      setIsLoading(false);
    };
    cek_usertoken();
  }, []);
  const sendCodeverificationWA = async (phone: any) => {
    try {
      const send_otp = await api.post("/whatsapp/verification-account", {
        phone: "628979971180",
        // phone_testing: "628979971180",
      });
      const {
        data: { response },
      } = send_otp;
      setCodeverification(response.codeverification);
    } catch (error: any) {
      throw error;
    }
  };
  const signInWithUsernamePassword = async (
    username: string,
    password: string,
  ) => {
    try {
      if (!username) {
        throw new Error("email / username tidak boleh kosong");
      }
      if (!password) {
        throw new Error("password tidak boleh kosong");
      }
      setIsLoading(true);
      const login_user = await api.post("/auth/login/coach", {
        username,
        password,
      });
      const {
        data: { response },
      } = login_user;

      if (!response.token) {
        setUserPhone(response);
        let cek_phone_valid = validatePhoneNumber(response.phone);
        if (cek_phone_valid) {
          await sendCodeverificationWA(response.phone);
          router.push("/(auth)/verification-otp");
          return;
        }
        router.push("/(auth)/setting-password");
        return;
      }
      setAccessToken(response.token);
      setRefreshToken(response.token);
      await tokenCache?.saveToken("accessToken", response.token);
      await tokenCache?.saveToken("refreshToken", response.token);
      await onReloadUserMobile();
    } catch (error: any) {
      console.log("error :", error.error);
      alert(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);

    await tokenCache?.deleteToken("accessToken");
    await tokenCache?.deleteToken("refreshToken");
    socket.disconnect();
    // Clear state
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsLoading(false);
  };

  const checkNumberPhoneUser = async (inputphone: string) => {
    try {
      if (!inputphone) {
        throw new Error("nomor ponsel tidak boleh kosong");
      }
      setIsLoading(true);
      const check_staff = await api.get(
        `/auth/check-staff-byphone?phone=${inputphone}`,
      );
      const {
        response: { phone },
      } = check_staff.data;
      const cek_user = await api.get(`/user?phone=${phone}`);
      const {
        data: { response },
      } = cek_user;
      await sendCodeverificationWA(phone);
      setUserPhone({ ...response, phone });
      router.push("/(auth)/verification-otp");
    } catch (error: any) {
      alert(error?.message);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithNumberPhone = async (phone: string) => {
    try {
      const login_user = await api.post("/auth/login/phone", {
        phone: phone,
      });
      const {
        data: { response },
      } = login_user;
      setAccessToken(response.token);
      setRefreshToken(response.token);
      await tokenCache?.saveToken("accessToken", response.token);
      await tokenCache?.saveToken("refreshToken", response.token);
      await onReloadUserMobile();
    } catch (error: any) {
      alert(error?.message);
    }
  };
  const checkUserNumberPhoneSignIn = async () => {
    try {
      setIsLoading(true);
      if (userPhone._id) {
        await signInWithNumberPhone(userPhone.phone);
        return;
      }
      router.push("/(auth)/setting-password");
    } catch (error: any) {
      alert(error?.message);
    } finally {
      setIsLoading(false);
    }
  };
  const verifyNotification = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Verifikasi Member",
        body: "Terimakasih sudah melakukan verifikasi member",
        data: {},
      },
      trigger: null,
    });
  };
  const onCreateNewUser = async (data: any) => {
    try {
      setIsLoading(true);
      let body_req = {
        ...userPhone,
        ...data,
      };
      const req_user_pengguna = await api.post("/user/verification", body_req);
      const {
        data: { response },
      } = req_user_pengguna;
      const { source_id } = response;
      await api.get(`/syncdata/member-status?user_id=${source_id}`);
      await api.get(`/syncdata/member-payment?user_id=${source_id}`);
      await api.get(`/syncdata/weigh-measure?user_id=${source_id}`);
      await api.get(`/syncdata/coach-member?user_id=${source_id}`);

      // await api.get(`/syncdata/workout?user_id=${source_id}`);
      await signInWithNumberPhone(body_req.phone);
      router.push("/(auth)");
      verifyNotification();
    } catch (error: any) {
      console.log("error", error);
      console.log("error :", error.error);
      alert(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userPhone,
        setUserPhone,
        user,
        isLoading,
        signInWithUsernamePassword,
        signOut,
        checkNumberPhoneUser,
        checkUserNumberPhoneSignIn,
        onCreateNewUser,
        codeverification,
        onReloadUserMobile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
