"use client";

import React, { useRef, useState } from "react";
import { BlockType, ToolboxCommand } from "@/lib/codeEditorConfig";

// Helper to escape HTML for SVG text
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Convert label to display with proper slot symbols
// ⬤ for reporter/value slots, ⯁ for boolean slots
function formatLabelWithSlots(label: string, code: string): string {
    // Check if this is a boolean-expecting slot based on common patterns
    const isBooleanContext = /\b(if|until|and|or|not)\s+_/.test(label);
    
    if (isBooleanContext) {
        return label.replace(/_/g, "⯁");
    }
    return label.replace(/_/g, "⬤");
}

// SVG path definitions for different block shapes
// Statement blocks have notch on top (female) and bump on bottom (male)
const BLOCK_SHAPES = {
    // Statement/Stack block - top notch (female), bottom bump (male)
    statement: {
        height: 38,
        path: (width: number) => `
            M 0 4
            C 0 2 2 0 4 0
            L 12 0
            L 14 4
            L 26 4
            L 28 0
            L ${width - 4} 0
            C ${width - 2} 0 ${width} 2 ${width} 4
            L ${width} 30
            C ${width} 32 ${width - 2} 34 ${width - 4} 34
            L 28 34
            L 26 38
            L 14 38
            L 12 34
            L 4 34
            C 2 34 0 32 0 30
            Z
        `,
    },
    // Hat block - rounded top (no connector), bottom bump (male)
    hat: {
        height: 44,
        path: (width: number) => `
            M 0 18
            C 0 6 12 0 30 0
            L ${width - 30} 0
            C ${width - 12} 0 ${width} 6 ${width} 18
            L ${width} 36
            C ${width} 38 ${width - 2} 40 ${width - 4} 40
            L 28 40
            L 26 44
            L 14 44
            L 12 40
            L 4 40
            C 2 40 0 38 0 36
            Z
        `,
    },
    // Cap block - top notch (female), flat bottom (no connector)
    cap: {
        height: 34,
        path: (width: number) => `
            M 0 4
            C 0 2 2 0 4 0
            L 12 0
            L 14 4
            L 26 4
            L 28 0
            L ${width - 4} 0
            C ${width - 2} 0 ${width} 2 ${width} 4
            L ${width} 30
            C ${width} 32 ${width - 2} 34 ${width - 4} 34
            L 4 34
            C 2 34 0 32 0 30
            Z
        `,
    },
    // Reporter block - rounded/pill shape (value blocks)
    reporter: {
        height: 26,
        path: (width: number) => `
            M 13 0
            L ${width - 13} 0
            C ${width - 5} 0 ${width} 5 ${width} 13
            C ${width} 21 ${width - 5} 26 ${width - 13} 26
            L 13 26
            C 5 26 0 21 0 13
            C 0 5 5 0 13 0
            Z
        `,
    },
    // Boolean block - hexagonal/pointed shape
    boolean: {
        height: 26,
        path: (width: number) => `
            M 13 0
            L ${width - 13} 0
            L ${width} 13
            L ${width - 13} 26
            L 13 26
            L 0 13
            Z
        `,
    },
    // C-block - top notch (female), mouth for nested blocks, bottom bump (male)
    "c-block": {
        height: 58,
        textOffsetY: -18, // Move text up from center
        path: (width: number) => `
            M 0 4
            C 0 2 2 0 4 0
            L 12 0
            L 14 4
            L 26 4
            L 28 0
            L ${width - 4} 0
            C ${width - 2} 0 ${width} 2 ${width} 4
            L ${width} 22
            L 46 22
            L 44 26
            L 32 26
            L 30 22
            L 22 22
            L 22 42
            L ${width} 42
            L ${width} 50
            C ${width} 52 ${width - 2} 54 ${width - 4} 54
            L 28 54
            L 26 58
            L 14 58
            L 12 54
            L 4 54
            C 2 54 0 52 0 50
            Z
        `,
    },
};

interface DraggableBlockProps {
    command: ToolboxCommand;
    categoryColor: string;
    onDragStart: (command: ToolboxCommand, rect: DOMRect) => void;
    onDragEnd: () => void;
}

export default function DraggableBlock({
    command,
    categoryColor,
    onDragStart,
    onDragEnd,
}: DraggableBlockProps) {
    const blockRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const blockType: BlockType = command.blockType || "statement";
    const shapeConfig = BLOCK_SHAPES[blockType];
    const textOffsetY = (shapeConfig as { textOffsetY?: number }).textOffsetY || 0;

    // Format label with slot symbols
    const displayLabel = formatLabelWithSlots(command.label, command.code);
    
    // Calculate block width based on label length
    const estimatedWidth = Math.max(110, displayLabel.length * 7.5 + 50);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        setIsDragging(true);
        
        // Set drag data - store as custom type with JSON, but also plain text as the code
        e.dataTransfer.setData("application/x-scratch-block", JSON.stringify({
            code: command.code,
            blockType: blockType,
            needsIndent: command.needsIndent,
        }));
        // Also set plain text as just the code for fallback
        e.dataTransfer.setData("text/plain", command.code);
        e.dataTransfer.effectAllowed = "copy";

        // Create a custom drag image
        const dragImage = document.createElement("div");
        dragImage.innerHTML = `
            <svg width="${estimatedWidth}" height="${shapeConfig.height}" style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">
                <path d="${shapeConfig.path(estimatedWidth)}" fill="${categoryColor}" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
                <text x="${estimatedWidth / 2}" y="${shapeConfig.height / 2 + 4}" 
                      fill="white" font-size="11" font-family="sans-serif" text-anchor="middle"
                      style="text-shadow: 0 1px 1px rgba(0,0,0,0.3);">
                    ${escapeHtml(displayLabel)}
                </text>
            </svg>
        `;
        dragImage.style.position = "absolute";
        dragImage.style.top = "-1000px";
        document.body.appendChild(dragImage);
        
        e.dataTransfer.setDragImage(dragImage, estimatedWidth / 2, shapeConfig.height / 2);
        
        // Clean up drag image after a frame
        requestAnimationFrame(() => {
            document.body.removeChild(dragImage);
        });

        if (blockRef.current) {
            onDragStart(command, blockRef.current.getBoundingClientRect());
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        onDragEnd();
    };

    return (
        <div
            ref={blockRef}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`relative cursor-grab active:cursor-grabbing select-none my-1 mx-2 transition-transform ${
                isDragging ? "opacity-50 scale-95" : "hover:scale-[1.02]"
            }`}
            title={command.description}
            style={{ minHeight: shapeConfig.height }}
        >
            <svg
                width={estimatedWidth}
                height={shapeConfig.height}
                className="block-shape"
                style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.2))" }}
            >
                <path
                    d={shapeConfig.path(estimatedWidth)}
                    fill={categoryColor}
                    stroke="rgba(0,0,0,0.15)"
                    strokeWidth="1"
                />
                <text
                    x={estimatedWidth / 2}
                    y={shapeConfig.height / 2 + 4 + textOffsetY}
                    fill="white"
                    fontSize="11"
                    fontFamily="system-ui, sans-serif"
                    textAnchor="middle"
                    style={{ textShadow: "0 1px 1px rgba(0,0,0,0.3)", pointerEvents: "none" }}
                >
                    {displayLabel}
                </text>
            </svg>
        </div>
    );
}

// Component for rendering a ghost block (drop preview)
export function GhostBlock({
    blockType,
    color,
    width = 120,
}: {
    blockType: BlockType;
    color: string;
    width?: number;
}) {
    const shapeConfig = BLOCK_SHAPES[blockType] || BLOCK_SHAPES.statement;

    return (
        <svg
            width={width}
            height={shapeConfig.height}
            style={{ opacity: 0.6, filter: "drop-shadow(0 0 4px rgba(255,255,255,0.5))" }}
        >
            <path
                d={shapeConfig.path(width)}
                fill={color}
                stroke="white"
                strokeWidth="2"
                strokeDasharray="4 2"
            />
        </svg>
    );
}
