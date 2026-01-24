// Input Modal Component
// Custom prompt modal for getting user input

"use client";

import React, { useState, useEffect, useRef } from "react";

interface InputModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    defaultValue?: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

export default function InputModal({
    isOpen,
    title,
    message,
    defaultValue = "",
    placeholder = "",
    confirmText = "OK",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}: InputModalProps) {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            // Focus input after modal opens
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
        }
    }, [isOpen, defaultValue]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onConfirm(value.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onCancel();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
            onKeyDown={handleKeyDown}
        >
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-600">
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-300 mb-4">{message}</p>
                
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
                    />
                    
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            disabled={!value.trim()}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
