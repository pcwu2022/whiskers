"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Sound, createSound } from "@/types/projectTypes";
import { InputModal, Tooltip } from "./ui";

interface SoundSidebarProps {
    sounds: Sound[];
    onSoundsChange: (sounds: Sound[]) => void;
    onClose: () => void;
    width: number;
    spriteName: string;  // Name of the sprite (for display purposes)
}

export default function SoundSidebar({
    sounds,
    onSoundsChange,
    onClose,
    width,
    spriteName,
}: SoundSidebarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [renameModal, setRenameModal] = useState<{
        isOpen: boolean;
        soundIndex: number;
        currentName: string;
    }>({ isOpen: false, soundIndex: -1, currentName: "" });

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Handle file upload
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newSounds: Sound[] = [];
        let processedCount = 0;

        Array.from(files).forEach((file) => {
            // Validate file type
            if (!file.type.startsWith("audio/")) {
                alert(`"${file.name}" is not an audio file.`);
                processedCount++;
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                
                // Create an audio element to get duration
                const audio = new Audio(dataUrl);
                audio.addEventListener("loadedmetadata", () => {
                    // Extract name from filename (without extension)
                    const name = file.name.replace(/\.[^/.]+$/, "");
                    
                    const newSound = createSound(name, dataUrl, file.type);
                    newSound.duration = audio.duration;
                    
                    newSounds.push(newSound);
                    processedCount++;
                    
                    // Once all files are processed, update
                    if (processedCount === files.length && newSounds.length > 0) {
                        onSoundsChange([...sounds, ...newSounds]);
                    }
                });
                
                audio.addEventListener("error", () => {
                    processedCount++;
                    // Check if all files processed
                    if (processedCount === files.length && newSounds.length > 0) {
                        onSoundsChange([...sounds, ...newSounds]);
                    }
                });
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [sounds, onSoundsChange]);

    // Play/pause sound
    const togglePlaySound = (sound: Sound) => {
        if (playingId === sound.id) {
            // Stop playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setPlayingId(null);
        } else {
            // Stop any currently playing
            if (audioRef.current) {
                audioRef.current.pause();
            }
            
            // Play new sound
            if (sound.data) {
                audioRef.current = new Audio(sound.data);
                audioRef.current.play();
                audioRef.current.addEventListener("ended", () => {
                    setPlayingId(null);
                    audioRef.current = null;
                });
                setPlayingId(sound.id);
            }
        }
    };

    // Handle sound rename
    const handleRename = (index: number) => {
        setRenameModal({
            isOpen: true,
            soundIndex: index,
            currentName: sounds[index].name,
        });
    };

    const handleRenameConfirm = (newName: string) => {
        if (newName.trim() && renameModal.soundIndex >= 0) {
            const trimmedName = newName.trim();
            // Check for duplicate sound names
            const isDuplicate = sounds.some(
                (sound, idx) => idx !== renameModal.soundIndex && sound.name.toLowerCase() === trimmedName.toLowerCase()
            );
            if (isDuplicate) {
                alert(`A sound named "${trimmedName}" already exists. Please choose a different name.`);
                return;
            }
            const updatedSounds = sounds.map((sound, idx) =>
                idx === renameModal.soundIndex
                    ? { ...sound, name: trimmedName }
                    : sound
            );
            onSoundsChange(updatedSounds);
        }
        setRenameModal({ isOpen: false, soundIndex: -1, currentName: "" });
    };

    // Handle sound delete (no restriction on deleting all sounds)
    const handleDelete = (index: number) => {
        // Stop if currently playing
        if (sounds[index].id === playingId) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setPlayingId(null);
        }
        
        const updatedSounds = sounds.filter((_, idx) => idx !== index);
        onSoundsChange(updatedSounds);
    };

    // Handle sound reorder
    const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        const newSounds = [...sounds];
        [newSounds[index - 1], newSounds[index]] = [newSounds[index], newSounds[index - 1]];
        onSoundsChange(newSounds);
    };

    const handleMoveDown = (index: number) => {
        if (index >= sounds.length - 1) return;
        const newSounds = [...sounds];
        [newSounds[index], newSounds[index + 1]] = [newSounds[index + 1], newSounds[index]];
        onSoundsChange(newSounds);
    };

    // Format duration as MM:SS
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <>
            {/* Scrollbar styles */}
            <style>{`
                .sound-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .sound-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sound-scroll::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 3px;
                }
                .sound-scroll::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                }
                .sound-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #4b5563 transparent;
                }
            `}</style>

            {/* Upload Button */}
            <div className="p-2 border-b border-gray-800">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded transition-colors flex items-center justify-center gap-2"
                >
                    <span>+</span>
                    <span>Upload Sound</span>
                </button>
            </div>

            {/* Sound List */}
            <div className="sound-scroll flex-1 overflow-y-auto p-2 space-y-2">
                {sounds.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                        <div className="text-3xl mb-2">🔇</div>
                        <div>No sounds yet</div>
                        <div className="text-xs mt-1">Upload audio files to add sounds</div>
                    </div>
                ) : (
                    sounds.map((sound, index) => (
                        <div
                            key={sound.id}
                            className={`relative group rounded border transition-colors ${
                                playingId === sound.id
                                    ? "border-pink-500 bg-pink-900/30"
                                    : "border-gray-700 hover:border-gray-600 bg-gray-800"
                            }`}
                        >
                            {/* Sound Info */}
                            <div className="p-3 flex items-center gap-3">
                                {/* Play Button */}
                                <button
                                    onClick={() => togglePlaySound(sound)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                        playingId === sound.id
                                            ? "bg-pink-600 hover:bg-pink-700 text-white"
                                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    }`}
                                >
                                    {playingId === sound.id ? "⏸" : "▶"}
                                </button>

                                {/* Sound Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-gray-300 text-sm truncate">
                                        {index + 1}. {sound.name}
                                    </div>
                                    <div className="text-gray-500 text-xs mt-0.5">
                                        {formatDuration(sound.duration)}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip content="Move Up">
                                        <button
                                            onClick={() => handleMoveUp(index)}
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
                                    <Tooltip content="Move Down">
                                        <button
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === sounds.length - 1}
                                            className={`p-1 rounded text-xs ${
                                                index === sounds.length - 1
                                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                            }`}
                                        >
                                            ↓
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Rename">
                                        <button
                                            onClick={() => handleRename(index)}
                                            className="p-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-300"
                                        >
                                            ✏️
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Delete">
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="p-1 rounded text-xs bg-red-900 hover:bg-red-800 text-red-300"
                                        >
                                            🗑️
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Rename Modal */}
            <InputModal
                isOpen={renameModal.isOpen}
                title="Rename Sound"
                message="Enter a new name for this sound:"
                defaultValue={renameModal.currentName}
                placeholder="Sound name"
                confirmText="Rename"
                onConfirm={handleRenameConfirm}
                onCancel={() => setRenameModal({ isOpen: false, soundIndex: -1, currentName: "" })}
            />
        </>
    );
}
