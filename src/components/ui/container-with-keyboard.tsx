import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  type ViewProps,
} from "react-native";

interface ContainerProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
  onDetail?: boolean;
  titleHeader?: string;
}
const ContainerWithKeyBoard = ({
  onDetail,
  titleHeader,
  children,
  className,
  ...props
}: ContainerProps) => {
  return (
    <KeyboardAvoidingView
      {...props}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={["flex-1  bg-[#6F3FA0] dark:bg-[#BB86FC]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ContainerWithKeyBoard;
