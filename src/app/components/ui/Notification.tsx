// Notification Component
// Displays temporary notification messages that auto-disappear

"use client";

import React, { useEffect, useState } from "react";

export interface NotificationItem {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
}

interface NotificationProps {
    notifications: NotificationItem[];
    onDismiss: (id: string) => void;
    duration?: number;
}

const typeStyles = {
    success: "bg-green-600 border-green-500",
    error: "bg-red-600 border-red-500",
    info: "bg-blue-600 border-blue-500",
    warning: "bg-yellow-600 border-yellow-500",
};

const typeIcons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
};

function NotificationToast({
    notification,
    onDismiss,
    duration = 3000,
}: {
    notification: NotificationItem;
    onDismiss: () => void;
    duration?: number;
}) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onDismiss, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    return (
        <div
            className={`
                flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border
                ${typeStyles[notification.type]}
                ${isExiting ? "opacity-0 translate-y-[-10px]" : "opacity-100 translate-y-0"}
                transition-all duration-300 ease-in-out
            `}
        >
            <span className="text-white font-bold">{typeIcons[notification.type]}</span>
            <span className="text-white text-sm">{notification.message}</span>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(onDismiss, 300);
                }}
                className="ml-2 text-white/70 hover:text-white transition-colors"
            >
                ×
            </button>
        </div>
    );
}

export default function Notification({ notifications, onDismiss, duration = 3000 }: NotificationProps) {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[200] flex flex-col gap-2">
            {notifications.map((notification) => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    onDismiss={() => onDismiss(notification.id)}
                    duration={duration}
                />
            ))}
        </div>
    );
}

// Hook for managing notifications
export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const addNotification = (message: string, type: NotificationItem["type"] = "info") => {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setNotifications((prev) => [...prev, { id, message, type }]);
    };

    const dismissNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return {
        notifications,
        addNotification,
        dismissNotification,
        notify: {
            success: (message: string) => addNotification(message, "success"),
            error: (message: string) => addNotification(message, "error"),
            info: (message: string) => addNotification(message, "info"),
            warning: (message: string) => addNotification(message, "warning"),
        },
    };
}
