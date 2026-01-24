// Tooltip Component
// Reusable tooltip wrapper for buttons and elements

"use client";

import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    delay?: number;
}

export default function Tooltip({ 
    content, 
    children, 
    position = "bottom",
    delay = 300 
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        if (isVisible && containerRef.current && tooltipRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            
            let top = 0;
            let left = 0;
            
            switch (position) {
                case "top":
                    top = -tooltipRect.height - 8;
                    left = (containerRect.width - tooltipRect.width) / 2;
                    break;
                case "bottom":
                    top = containerRect.height + 8;
                    left = (containerRect.width - tooltipRect.width) / 2;
                    break;
                case "left":
                    top = (containerRect.height - tooltipRect.height) / 2;
                    left = -tooltipRect.width - 8;
                    break;
                case "right":
                    top = (containerRect.height - tooltipRect.height) / 2;
                    left = containerRect.width + 8;
                    break;
            }
            
            setCoords({ top, left });
        }
    }, [isVisible, position]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className="absolute z-[150] px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap pointer-events-none"
                    style={{
                        top: coords.top,
                        left: coords.left,
                    }}
                >
                    {content}
                    <div 
                        className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                            position === "bottom" ? "-top-1 left-1/2 -translate-x-1/2" :
                            position === "top" ? "-bottom-1 left-1/2 -translate-x-1/2" :
                            position === "left" ? "-right-1 top-1/2 -translate-y-1/2" :
                            "-left-1 top-1/2 -translate-y-1/2"
                        }`}
                    />
                </div>
            )}
        </div>
    );
}
