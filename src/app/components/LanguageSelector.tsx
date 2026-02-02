// Language Selector Component
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, SUPPORTED_LOCALES, LOCALE_NAMES, SupportedLocale } from '@/i18n';

interface LanguageSelectorProps {
    variant?: 'dropdown' | 'inline';
    className?: string;
}

export default function LanguageSelector({ variant = 'dropdown', className = '' }: LanguageSelectorProps) {
    const { locale, setLocale } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (variant === 'inline') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {SUPPORTED_LOCALES.map((loc) => (
                    <button
                        key={loc}
                        onClick={() => setLocale(loc)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                            locale === loc
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {LOCALE_NAMES[loc]}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-200"
                aria-label="Select language"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>{LOCALE_NAMES[locale]}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 py-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                    {SUPPORTED_LOCALES.map((loc) => (
                        <button
                            key={loc}
                            onClick={() => {
                                setLocale(loc);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                locale === loc
                                    ? 'bg-orange-600/20 text-orange-400'
                                    : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {LOCALE_NAMES[loc]}
                            {locale === loc && (
                                <span className="float-right">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
