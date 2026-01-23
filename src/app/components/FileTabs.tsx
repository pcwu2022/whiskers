// File Tabs Component
// Provides a tabbed interface for managing multiple sprite files

"use client";

import React, { useState, useRef, useEffect } from "react";
import { SpriteFile } from "@/types/projectTypes";

interface FileTabsProps {
    sprites: SpriteFile[];
    activeSprite: string;
    onSelectSprite: (id: string) => void;
    onAddSprite: () => void;
    onRenameSprite: (id: string, newName: string) => void;
    onDeleteSprite: (id: string) => void;
    onDuplicateSprite: (id: string) => void;
}

export default function FileTabs({
    sprites,
    activeSprite,
    onSelectSprite,
    onAddSprite,
    onRenameSprite,
    onDeleteSprite,
    onDuplicateSprite,
}: FileTabsProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; spriteId: string } | null>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        if (contextMenu) {
            document.addEventListener("click", handleClickOutside);
            return () => document.removeEventListener("click", handleClickOutside);
        }
    }, [contextMenu]);

    const handleStartRename = (sprite: SpriteFile) => {
        setEditingId(sprite.id);
        setEditingName(sprite.name);
        setContextMenu(null);
    };

    const handleFinishRename = () => {
        if (editingId && editingName.trim()) {
            onRenameSprite(editingId, editingName.trim());
        }
        setEditingId(null);
        setEditingName("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleFinishRename();
        } else if (e.key === "Escape") {
            setEditingId(null);
            setEditingName("");
        }
    };

    const handleContextMenu = (e: React.MouseEvent, spriteId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, spriteId });
    };

    const handleDelete = (id: string) => {
        if (sprites.length <= 1) {
            alert("Cannot delete the last sprite!");
            return;
        }
        if (confirm("Are you sure you want to delete this sprite?")) {
            onDeleteSprite(id);
        }
        setContextMenu(null);
    };

    return (
        <div className="flex items-center bg-gray-800 border-b border-gray-700 overflow-x-auto">
            {/* Sprite Tabs */}
            <div className="flex items-center">
                {sprites.map((sprite) => (
                    <div
                        key={sprite.id}
                        className={`group flex items-center gap-1 px-3 py-2 border-r border-gray-700 cursor-pointer transition-colors ${
                            activeSprite === sprite.id
                                ? "bg-gray-700 text-white"
                                : "text-gray-400 hover:bg-gray-750 hover:text-gray-200"
                        }`}
                        onClick={() => onSelectSprite(sprite.id)}
                        onContextMenu={(e) => handleContextMenu(e, sprite.id)}
                        onDoubleClick={() => handleStartRename(sprite)}
                    >
                        <span className="text-sm">🐱</span>
                        {editingId === sprite.id ? (
                            <input
                                ref={editInputRef}
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={handleFinishRename}
                                onKeyDown={handleKeyDown}
                                className="w-20 px-1 py-0.5 text-sm bg-gray-600 text-white border border-gray-500 rounded focus:outline-none focus:border-blue-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span className="text-sm max-w-24 truncate">{sprite.name}</span>
                        )}
                        {activeSprite === sprite.id && sprites.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(sprite.id);
                                }}
                                className="ml-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete sprite"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Sprite Button */}
            <button
                onClick={onAddSprite}
                className="px-3 py-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-colors"
                title="Add new sprite"
            >
                <span className="text-lg">+</span>
            </button>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            const sprite = sprites.find((s) => s.id === contextMenu.spriteId);
                            if (sprite) handleStartRename(sprite);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
                    >
                        ✏️ Rename
                    </button>
                    <button
                        onClick={() => {
                            onDuplicateSprite(contextMenu.spriteId);
                            setContextMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
                    >
                        📋 Duplicate
                    </button>
                    <hr className="border-gray-600 my-1" />
                    <button
                        onClick={() => handleDelete(contextMenu.spriteId)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 ${
                            sprites.length <= 1 ? "text-gray-500 cursor-not-allowed" : "text-red-400"
                        }`}
                        disabled={sprites.length <= 1}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}
        </div>
    );
}
