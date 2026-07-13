import Text from "@/components/ui/text";
import React from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type ViewProps,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

interface ContainerAuthProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
  titleHeader?: string;
  titleContent?: string;
}
const ContainerAuth = ({
  titleHeader,
  children,
  className,
  titleContent,
  ...props
}: ContainerAuthProps) => {
  return (
    <KeyboardAvoidingView
      {...props}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={["flex-1 bg-[#6F3FA0]", className].filter(Boolean).join(" ")}
    >
      <SafeAreaView className="flex">
        <View className="flex-row justify-center">
          <Text
            variant="title"
            weight="bold"
            className="text-3xl font-bold ml-2 mt-5"
          >
            Coach
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
            extraScrollHeight={10}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ContainerAuth;

const styles = StyleSheet.create({});
