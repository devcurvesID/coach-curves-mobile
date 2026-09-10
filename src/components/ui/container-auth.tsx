import React from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
  type ViewProps,
  useWindowDimensions,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import AdaptiveContent, { TABLET_FORM_MAX_WIDTH } from "./adaptive-content";
import NavigationHeader from "./navigation-header";

interface ContainerAuthProps extends ViewProps {
  children?: React.ReactNode;
  className?: string;
  titleHeader?: string;
  titleContent?: string;
  showBackButton?: boolean;
}
const ContainerAuth = ({
  titleHeader,
  children,
  className,
  titleContent,
  showBackButton = false,
  ...props
}: ContainerAuthProps) => {
  const { width, height } = useWindowDimensions();
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const logoSize = Math.min(width * 0.62, 260);

  return (
    <KeyboardAvoidingView
      {...props}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
      className={["flex-1 bg-[#6F3FA0]", className].filter(Boolean).join(" ")}
    >
      {showBackButton && (
        <NavigationHeader fallbackHref="/(auth)" label="Batal" />
      )}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1">
          <View
            className="justify-center items-center"
            style={{
              height: keyboardVisible
                ? showBackButton
                  ? 70
                  : 130
                : Math.min(height * (showBackButton ? 0.29 : 0.38), 400),
            }}
          >
            <SafeAreaView>
              {!keyboardVisible && (
                <Image
                  source={require("@/assets/images/logocurves.png")}
                  style={{ width: logoSize, height: logoSize }}
                  resizeMode="contain"
                />
              )}
            </SafeAreaView>
          </View>

          <View
            className="flex-1 items-center bg-white"
            style={{ borderTopLeftRadius: 45, borderTopRightRadius: 45 }}
          >
            <AdaptiveContent
              maxWidth={TABLET_FORM_MAX_WIDTH}
              className="flex-1 px-8 pt-8"
            >
              <KeyboardAwareScrollView
                enableOnAndroid
                enableAutomaticScroll
                extraScrollHeight={Platform.OS === "ios" ? 20 : 80}
                keyboardOpeningTime={0}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
              >
                {children}
              </KeyboardAwareScrollView>
            </AdaptiveContent>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ContainerAuth;
