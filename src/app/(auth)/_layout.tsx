import { LoadingView } from "@/components/ui/loading";
import { useAuth } from "@/context/auth";
import { Redirect, Stack } from "expo-router";

const AuthLayout = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingView />;

  // if (!isLoaded) return null;
  // const { user, isLoading } = useAuth();

  if (user) return <Redirect href={"/(tabs)"} />;

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
