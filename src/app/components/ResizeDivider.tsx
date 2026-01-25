import React, { useState, useRef, useEffect } from "react";

export default function ResizeDivider({ 
    orientation = "vertical",
    onResize,
    onSnapClose,
    snapThreshold = 50
}: { 
    orientation?: "vertical" | "horizontal";
    onResize: (delta: number) => void;
    onSnapClose?: () => void;
    snapThreshold?: number;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef(0);
    const totalDelta = useRef(0);
    
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        startPos.current = orientation === "vertical" ? e.clientX : e.clientY;
        totalDelta.current = 0;
        document.body.style.cursor = orientation === "vertical" ? "col-resize" : "row-resize";
        document.body.style.userSelect = "none";
    };
    
    useEffect(() => {
        if (!isDragging) return;
        
        const handleMouseMove = (e: MouseEvent) => {
            const currentPos = orientation === "vertical" ? e.clientX : e.clientY;
            const delta = currentPos - startPos.current;
            totalDelta.current += delta;
            onResize(delta);
            startPos.current = currentPos;
        };
        
        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
        
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, onResize, orientation]);
    
    if (orientation === "horizontal") {
        return (
            <div
                className={`h-1 cursor-row-resize bg-gray-700 hover:bg-blue-500 transition-colors flex-shrink-0 ${isDragging ? "bg-blue-500" : ""}`}
                onMouseDown={handleMouseDown}
            />
        );
    }
    
    return (
        <div
            className={`w-1 cursor-col-resize bg-gray-700 hover:bg-blue-500 transition-colors flex-shrink-0 ${isDragging ? "bg-blue-500" : ""}`}
            onMouseDown={handleMouseDown}
        />
    );
}
