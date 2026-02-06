"use client";

import React, { useRef, useState, useCallback } from "react";
import { Costume, createCostume, DEFAULT_SPRITE_COSTUME_URL, DEFAULT_STAGE_COSTUME_URL } from "@/types/projectTypes";
import { InputModal, Tooltip } from "./ui";
import { useTranslation } from "@/i18n";
import { ToolboxCommand } from "@/lib/codeEditorConfig";

interface CostumeSidebarProps {
    costumes: Costume[];
    currentCostume: number;
    onCostumesChange: (costumes: Costume[], currentIndex: number) => void;
    onClose: () => void;
    width: number;
    spriteName: string;  // Name of the sprite (for display purposes)
    isStage: boolean;    // Whether this is the stage
    onDragStart?: (command: ToolboxCommand, rect: DOMRect) => void;
    onDragEnd?: () => void;
}

export default function CostumeSidebar({
    costumes,
    currentCostume,
    onCostumesChange,
    onClose,
    width,
    spriteName,
    isStage,
    onDragStart,
    onDragEnd,
}: CostumeSidebarProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [renameModal, setRenameModal] = useState<{
        isOpen: boolean;
        costumeIndex: number;
        currentName: string;
    }>({ isOpen: false, costumeIndex: -1, currentName: "" });
    
    // Local selection state - separate from sprite's actual currentCostume
    // This allows viewing/editing costumes without changing the sprite's displayed costume
    const [selectedCostume, setSelectedCostume] = useState<number>(currentCostume);

    // Get the default costume URL based on sprite type
    const getDefaultCostumeUrl = () => isStage ? DEFAULT_STAGE_COSTUME_URL : DEFAULT_SPRITE_COSTUME_URL;

    // Build a drag command for a costume
    const buildCostumeCommand = useCallback((costumeName: string): ToolboxCommand => {
        const keyword = isStage ? "backdrop" : "costume";
        return {
            label: `switch ${keyword} to "${costumeName}"`,
            code: `switch ${keyword} to "${costumeName}"`,
            description: `Switch ${keyword} to ${costumeName}`,
            blockType: "statement",
        };
    }, [isStage]);

    // Handle costume drag start
    const handleCostumeDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, costume: Costume) => {
        const command = buildCostumeCommand(costume.name);
        e.dataTransfer.setData("application/x-scratch-block", JSON.stringify({
            code: command.code,
            blockType: command.blockType,
            needsIndent: false,
        }));
        e.dataTransfer.setData("text/plain", command.code);
        e.dataTransfer.effectAllowed = "copy";

        const target = e.currentTarget;
        if (target && onDragStart) {
            onDragStart(command, target.getBoundingClientRect());
        }
    }, [buildCostumeCommand, onDragStart]);

    const handleCostumeDragEnd = useCallback(() => {
        onDragEnd?.();
    }, [onDragEnd]);

    // Handle file upload
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newCostumes: Costume[] = [];
        
        // Filter valid image files first
        const imageFiles = Array.from(files).filter((file) => {
            if (!file.type.startsWith("image/")) {
                alert(`"${file.name}" ${t.playground.costumeSidebar.notAnImage}`);
                return false;
            }
            return true;
        });
        
        if (imageFiles.length === 0) return;
        
        let processedCount = 0;

        imageFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                
                // Create an image to get dimensions
                const img = new Image();
                img.onload = () => {
                    // Extract name from filename (without extension)
                    const name = file.name.replace(/\.[^/.]+$/, "");
                    
                    const newCostume = createCostume(name, dataUrl, file.type);
                    newCostume.width = img.width;
                    newCostume.height = img.height;
                    newCostume.rotationCenterX = Math.floor(img.width / 2);
                    newCostume.rotationCenterY = Math.floor(img.height / 2);
                    
                    newCostumes.push(newCostume);
                    processedCount++;
                    
                    // Once all valid files are processed, update
                    // Keep the current costume index unchanged when adding new costumes
                    if (processedCount === imageFiles.length) {
                        onCostumesChange([...costumes, ...newCostumes], currentCostume);
                    }
                };
                img.onerror = () => {
                    processedCount++;
                    // Still check if all files processed even on error
                    if (processedCount === imageFiles.length && newCostumes.length > 0) {
                        onCostumesChange([...costumes, ...newCostumes], currentCostume);
                    }
                };
                img.src = dataUrl;
            };
            reader.onerror = () => {
                processedCount++;
                if (processedCount === imageFiles.length && newCostumes.length > 0) {
                    onCostumesChange([...costumes, ...newCostumes], currentCostume);
                }
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [costumes, onCostumesChange]);

    // Handle costume selection - only updates local UI selection, not the sprite's actual costume
    const handleSelectCostume = (index: number) => {
        setSelectedCostume(index);
    };

    // Handle costume rename
    const handleRename = (index: number) => {
        setRenameModal({
            isOpen: true,
            costumeIndex: index,
            currentName: costumes[index].name,
        });
    };

    const handleRenameConfirm = (newName: string) => {
        if (newName.trim() && renameModal.costumeIndex >= 0) {
            const trimmedName = newName.trim();
            // Check for duplicate costume names
            const isDuplicate = costumes.some(
                (costume, idx) => idx !== renameModal.costumeIndex && costume.name.toLowerCase() === trimmedName.toLowerCase()
            );
            if (isDuplicate) {
                alert(`A costume named "${trimmedName}" already exists. Please choose a different name.`);
                return;
            }
            const updatedCostumes = costumes.map((costume, idx) =>
                idx === renameModal.costumeIndex
                    ? { ...costume, name: trimmedName }
                    : costume
            );
            onCostumesChange(updatedCostumes, currentCostume);
        }
        setRenameModal({ isOpen: false, costumeIndex: -1, currentName: "" });
    };

    // Handle costume delete
    const handleDelete = (index: number) => {
        // Don't allow deleting the last costume
        if (costumes.length <= 1) {
            alert(t.playground.costumeSidebar.cannotDeleteLast);
            return;
        }

        const updatedCostumes = costumes.filter((_, idx) => idx !== index);
        // Adjust current costume index if needed (only if deleting it or an earlier costume)
        let newCurrentIndex = currentCostume;
        if (currentCostume >= updatedCostumes.length) {
            newCurrentIndex = updatedCostumes.length - 1;
        } else if (currentCostume > index) {
            newCurrentIndex = currentCostume - 1;
        }
        
        // Also adjust local selection
        let newSelectedIndex = selectedCostume;
        if (selectedCostume >= updatedCostumes.length) {
            newSelectedIndex = updatedCostumes.length - 1;
        } else if (selectedCostume > index) {
            newSelectedIndex = selectedCostume - 1;
        }
        setSelectedCostume(newSelectedIndex);
        
        onCostumesChange(updatedCostumes, newCurrentIndex);
    };

    // Handle costume reorder (move up/down)
    const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        const newCostumes = [...costumes];
        [newCostumes[index - 1], newCostumes[index]] = [newCostumes[index], newCostumes[index - 1]];
        
        // Adjust current index to follow the same costume
        let newCurrentIndex = currentCostume;
        if (currentCostume === index) {
            newCurrentIndex = index - 1;
        } else if (currentCostume === index - 1) {
            newCurrentIndex = index;
        }
        
        // Also adjust local selection to follow the same costume
        let newSelectedIndex = selectedCostume;
        if (selectedCostume === index) {
            newSelectedIndex = index - 1;
        } else if (selectedCostume === index - 1) {
            newSelectedIndex = index;
        }
        setSelectedCostume(newSelectedIndex);
        
        onCostumesChange(newCostumes, newCurrentIndex);
    };

    const handleMoveDown = (index: number) => {
        if (index >= costumes.length - 1) return;
        const newCostumes = [...costumes];
        [newCostumes[index], newCostumes[index + 1]] = [newCostumes[index + 1], newCostumes[index]];
        
        // Adjust current index to follow the same costume
        let newCurrentIndex = currentCostume;
        if (currentCostume === index) {
            newCurrentIndex = index + 1;
        } else if (currentCostume === index + 1) {
            newCurrentIndex = index;
        }
        
        // Also adjust local selection to follow the same costume
        let newSelectedIndex = selectedCostume;
        if (selectedCostume === index) {
            newSelectedIndex = index + 1;
        } else if (selectedCostume === index + 1) {
            newSelectedIndex = index;
        }
        setSelectedCostume(newSelectedIndex);
        
        onCostumesChange(newCostumes, newCurrentIndex);
    };

    // Get costume thumbnail URL
    const getCostumeSrc = (costume: Costume): string => {
        return costume.data || getDefaultCostumeUrl();
    };

    return (
        <>
            {/* Scrollbar styles */}
            <style>{`
                .costume-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .costume-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .costume-scroll::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 3px;
                }
                .costume-scroll::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                }
                .costume-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #4b5563 transparent;
                }
            `}</style>

            {/* Upload Button */}
            <div className="p-2 border-b border-gray-800">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors flex items-center justify-center gap-2"
                >
                    <span>+</span>
                    <span>{t.playground.costumeSidebar.uploadCostume}</span>
                </button>
            </div>

            {/* Costume List */}
            <div className="costume-scroll flex-1 overflow-y-auto p-2 space-y-2">
                {costumes.map((costume, index) => (
                    <div
                        key={costume.id}
                        draggable
                        onDragStart={(e) => handleCostumeDragStart(e, costume)}
                        onDragEnd={handleCostumeDragEnd}
                        className={`relative group rounded border-2 transition-colors cursor-grab active:cursor-grabbing ${
                            index === selectedCostume
                                ? "border-purple-500 bg-purple-900/30"
                                : "border-gray-700 hover:border-gray-600 bg-gray-800"
                        }`}
                        onClick={() => handleSelectCostume(index)}
                        title={`Drag to editor: switch ${isStage ? "backdrop" : "costume"} to "${costume.name}"`}
                    >
                        {/* Costume Preview */}
                        <div className="aspect-square bg-gray-900/50 flex items-center justify-center p-2">
                            <img
                                src={getCostumeSrc(costume)}
                                alt={costume.name}
                                className="max-w-full max-h-full object-contain"
                                style={{ imageRendering: "pixelated" }}
                            />
                        </div>

                        {/* Costume Info */}
                        <div className="p-2 border-t border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300 text-xs truncate flex-1">
                                    {index + 1}. {costume.name}
                                </span>
                            </div>
                            <div className="text-gray-500 text-[10px] mt-0.5">
                                {costume.width}×{costume.height}
                            </div>
                        </div>

                        {/* Action Buttons (visible on hover) */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip content={t.playground.costumeSidebar.moveUp}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveUp(index);
                                    }}
                                    disabled={index === 0}
                                    className={`p-1 rounded text-xs ${
                                        index === 0
                                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    }`}
                                >
                                    ↑
                                </button>
                            </Tooltip>
                            <Tooltip content={t.playground.costumeSidebar.moveDown}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveDown(index);
                                    }}
                                    disabled={index === costumes.length - 1}
                                    className={`p-1 rounded text-xs ${
                                        index === costumes.length - 1
                                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    }`}
                                >
                                    ↓
                                </button>
                            </Tooltip>
                            <Tooltip content={t.playground.costumeSidebar.rename}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRename(index);
                                    }}
                                    className="p-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-300"
                                >
                                    ✏️
                                </button>
                            </Tooltip>
                            <Tooltip content={costumes.length <= 1 ? t.playground.costumeSidebar.cannotDeleteLast : t.playground.costumeSidebar.delete}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(index);
                                    }}
                                    disabled={costumes.length <= 1}
                                    className={`p-1 rounded text-xs ${
                                        costumes.length <= 1
                                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                            : "bg-red-900 hover:bg-red-800 text-red-300"
                                    }`}
                                >
                                    🗑️
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rename Modal */}
            <InputModal
                isOpen={renameModal.isOpen}
                title={t.playground.costumeSidebar.renameCostumeTitle}
                message={t.playground.costumeSidebar.renameCostumeMessage}
                defaultValue={renameModal.currentName}
                placeholder={t.playground.costumeSidebar.costumePlaceholder}
                confirmText={t.playground.costumeSidebar.renameButton}
                onConfirm={handleRenameConfirm}
                onCancel={() => setRenameModal({ isOpen: false, costumeIndex: -1, currentName: "" })}
            />
        </>
    );
}
