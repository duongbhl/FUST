"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";
import jaTranslations from "@/locales/ja.json";

type Language = "en" | "vi" | "ja";
type TranslationValue = string | { [key: string]: TranslationValue };
type TranslationTree = Record<string, TranslationValue>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, TranslationTree> = {
  en: enTranslations,
  vi: viTranslations,
  ja: jaTranslations,
};

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const savedLanguage = localStorage.getItem("language");
  return savedLanguage === "en" || savedLanguage === "vi" || savedLanguage === "ja" ? savedLanguage : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: TranslationValue | undefined = translations[language];

    for (const item of keys) {
      if (value && typeof value === "object" && item in value) {
        value = value[item];
      } else {
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
