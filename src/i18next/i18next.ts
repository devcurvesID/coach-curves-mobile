import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import en from "./locales/en";
import ind from "./locales/ind";

export const lng = getLocales()[0].languageCode ?? "id";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en,
      id: ind,
    },
    lng, // if you're using a language detector, do not define the lng option
    fallbackLng: "en",
    supportedLngs: ["en", "id"],
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

export const isRTL = getLocales()[0].textDirection === "rtl";
I18nManager.allowRTL(isRTL);
I18nManager.forceRTL(isRTL);
export default i18n;
