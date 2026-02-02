// i18n - Internationalization System for Whiskers
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TranslationSchema, SupportedLocale, SUPPORTED_LOCALES, LOCALE_NAMES } from './types';
import { en } from './locales/en';
import { zhTW } from './locales/zh-TW';

// All available translations
const translations: Record<SupportedLocale, TranslationSchema> = {
    'en': en,
    'zh-TW': zhTW,
};

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'whiskers-language';

// Default locale
const DEFAULT_LOCALE: SupportedLocale = 'en';

// Detect browser language
function detectBrowserLanguage(): SupportedLocale {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;
    
    const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || '';
    
    // Check for exact match first
    if (SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)) {
        return browserLang as SupportedLocale;
    }
    
    // Check for partial match (e.g., 'zh' matches 'zh-TW')
    const langCode = browserLang.split('-')[0];
    const match = SUPPORTED_LOCALES.find(locale => locale.startsWith(langCode));
    
    return match || DEFAULT_LOCALE;
}

// Get stored language preference
function getStoredLanguage(): SupportedLocale | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
        return stored as SupportedLocale;
    }
    return null;
}

// Store language preference
function storeLanguage(locale: SupportedLocale): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
}

// Get nested value from object using dot notation path
function getNestedValue(obj: Record<string, unknown>, path: string): string {
    const keys = path.split('.');
    let current: unknown = obj;
    
    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return path; // Return the key path as fallback
        }
        current = (current as Record<string, unknown>)[key];
    }
    
    return typeof current === 'string' ? current : path;
}

// Context type
interface I18nContextType {
    locale: SupportedLocale;
    setLocale: (locale: SupportedLocale) => void;
    t: TranslationSchema;
    // Helper function for getting translations by path (useful for dynamic keys)
    translate: (path: string, fallback?: string) => string;
}

// Create context
const I18nContext = createContext<I18nContextType | null>(null);

// Provider component
interface I18nProviderProps {
    children: ReactNode;
    defaultLocale?: SupportedLocale;
}

export function I18nProvider({ children, defaultLocale }: I18nProviderProps) {
    const [locale, setLocaleState] = useState<SupportedLocale>(defaultLocale || DEFAULT_LOCALE);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize locale from storage or browser detection
    useEffect(() => {
        const stored = getStoredLanguage();
        if (stored) {
            setLocaleState(stored);
        } else {
            const detected = detectBrowserLanguage();
            setLocaleState(detected);
        }
        setIsInitialized(true);
    }, []);

    // Update document language attribute
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    const setLocale = useCallback((newLocale: SupportedLocale) => {
        if (SUPPORTED_LOCALES.includes(newLocale)) {
            setLocaleState(newLocale);
            storeLanguage(newLocale);
        }
    }, []);

    // Get translations with fallback to English
    const t = React.useMemo(() => {
        const currentTranslations = translations[locale];
        const englishTranslations = translations['en'];
        
        // Deep merge with English as fallback for empty strings
        function mergeWithFallback<T>(current: T, fallback: T): T {
            if (typeof current !== 'object' || current === null) {
                // If current is empty string, use fallback
                if (current === '' && typeof fallback === 'string') {
                    return fallback;
                }
                return current;
            }
            
            const result: Record<string, unknown> = {};
            const keys = new Set([
                ...Object.keys(current as object),
                ...Object.keys(fallback as object)
            ]);
            
            for (const key of keys) {
                const currentValue = (current as Record<string, unknown>)[key];
                const fallbackValue = (fallback as Record<string, unknown>)[key];
                result[key] = mergeWithFallback(currentValue, fallbackValue);
            }
            
            return result as T;
        }
        
        return mergeWithFallback(currentTranslations, englishTranslations);
    }, [locale]);

    const translate = useCallback((path: string, fallback?: string): string => {
        const value = getNestedValue(t as unknown as Record<string, unknown>, path);
        if (value === path && fallback) {
            return fallback;
        }
        return value;
    }, [t]);

    const contextValue: I18nContextType = {
        locale,
        setLocale,
        t,
        translate,
    };

    // Prevent flash of wrong language
    if (!isInitialized) {
        return null;
    }

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
}

// Hook to use translations
export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}

// Hook for components that only need the translation object
export function useT() {
    const { t } = useTranslation();
    return t;
}

// Export types and constants
export { SUPPORTED_LOCALES, LOCALE_NAMES };
export type { SupportedLocale, TranslationSchema };
