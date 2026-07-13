import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

interface ContainerPageProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
  titleHeader?: string;
  titleContent?: string;
}
const ContainerPage = ({
  titleHeader,
  children,
  className,
  titleContent,
  ...props
}: ContainerPageProps) => {
  return (
    <KeyboardAvoidingView
      {...props}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className={["flex-1 bg-[#6F3FA0]", className].filter(Boolean).join(" ")}
    >
      {/* HEADER */}
      <View className="px-6 pt-20">
        <Text className="text-white text-2xl font-bold">{titleHeader}</Text>
        <Text className="text-purple-200 mt-2">{titleContent}</Text>
      </View>

      <View className="flex-1 bg-white rounded-t-[32px] mt-10 px-6 pt-8">
        {children}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ContainerPage;

const styles = StyleSheet.create({});
