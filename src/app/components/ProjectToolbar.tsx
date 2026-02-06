// Project Toolbar Component
// Provides upload/download functionality and project management

"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ScratchProject, SpriteFile, Costume, Sound, createSprite, createProject, createCostume, createSound } from "@/types/projectTypes";
import JSZip from "jszip";
import { Tooltip } from "./ui";
import { useTranslation } from "@/i18n";

// Helper to load default costume image as data URL
async function loadDefaultCostumeData(isStage: boolean = false): Promise<string | null> {
    const url = isStage ? "/stage.png" : "/costume1.png";
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Failed to load default costume:", error);
        return null;
    }
}

// Helper to load an image as a base64 data URL
async function loadImageAsBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Failed to load image ${url}:`, error);
        return null;
    }
}

// Helper to load default costumes for all sprites in a project
async function loadDefaultCostumesForProject(project: ScratchProject): Promise<ScratchProject> {
    const updatedSprites = await Promise.all(
        project.sprites.map(async (sprite) => {
            // Only update costumes that don't have data
            const updatedCostumes = await Promise.all(
                sprite.costumes.map(async (costume) => {
                    if (!costume.data) {
                        const data = await loadDefaultCostumeData(sprite.isStage);
                        return { ...costume, data };
                    }
                    return costume;
                })
            );
            return { ...sprite, costumes: updatedCostumes };
        })
    );
    return { ...project, sprites: updatedSprites };
}

interface ProjectToolbarProps {
    project: ScratchProject;
    onImportProject: (project: ScratchProject) => void;
    onImportSprite: (sprite: SpriteFile) => void;
    onNewProject: (project: ScratchProject) => void;
    onProjectNameChange: (name: string) => void;
    onNotify: (message: string, type: "success" | "error" | "info" | "warning") => void;
    // Show output toggle
    showOutput: boolean;
    onToggleOutput: () => void;
    canShowOutput: boolean;
}

// Confirmation Modal Component
function ConfirmModal({
    isOpen,
    title,
    message,
    onSave,
    onDiscard,
    onCancel,
    labels,
}: {
    isOpen: boolean;
    title: string;
    message: string;
    onSave: () => void;
    onDiscard: () => void;
    onCancel: () => void;
    labels: {
        cancel: string;
        discard: string;
        save: string;
        howSavingWorks: string;
    };
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-600">
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-300 mb-4">{message}</p>
                <Link 
                    href="/support" 
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 text-sm underline mb-4 inline-block"
                >
                    {labels.howSavingWorks} →
                </Link>
                <div className="flex gap-3 justify-end mt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                    >
                        {labels.cancel}
                    </button>
                    <button
                        onClick={onDiscard}
                        className="px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        {labels.discard}
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        {labels.save}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Input Modal for Project Name
function ProjectNameModal({
    isOpen,
    title,
    defaultValue,
    onConfirm,
    onCancel,
    labels,
}: {
    isOpen: boolean;
    title: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
    labels: {
        placeholder: string;
        cancel: string;
        create: string;
    };
}) {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-600">
                <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
                
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={labels.placeholder}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
                    />
                    
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                        >
                            {labels.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={!value.trim()}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {labels.create}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ProjectToolbar({
    project,
    onImportProject,
    onImportSprite,
    onNewProject,
    onProjectNameChange,
    onNotify,
    showOutput,
    onToggleOutput,
    canShowOutput,
}: ProjectToolbarProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const openProjectInputRef = useRef<HTMLInputElement>(null);
    
    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<"new" | "open" | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // Download current project as ZIP
    const downloadProject = async () => {
        const zip = new JSZip();
        
        // Add project metadata
        zip.file("project.json", JSON.stringify({
            id: project.id,
            name: project.name,
            version: project.version,
            activeSprite: project.activeSprite,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        }, null, 2));

        // Load flag and stop images as base64 for embedding in HTML
        const [flagBase64, stopBase64] = await Promise.all([
            loadImageAsBase64("/flag.png"),
            loadImageAsBase64("/stop.png"),
        ]);

        // Compile the project and add the HTML
        try {
            const response = await fetch("/api/compile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sprites: project.sprites.map(s => ({
                        name: s.name,
                        code: s.code,
                        isStage: s.isStage,
                        costumeNames: s.costumes.map(c => c.name),
                        costumeUrls: s.costumes.map(c => c.data),
                        currentCostume: s.currentCostume,
                        soundNames: s.sounds.map(snd => snd.name),
                        soundUrls: s.sounds.map(snd => snd.data),
                    })),
                }),
            });
            const data = await response.json();
            if (data.success && data.html) {
                // Replace image paths with base64 data URLs for standalone HTML
                let standaloneHtml = data.html;
                if (flagBase64) {
                    standaloneHtml = standaloneHtml.replace(/src="\/flag\.png"/g, `src="${flagBase64}"`);
                }
                if (stopBase64) {
                    standaloneHtml = standaloneHtml.replace(/src="\/stop\.png"/g, `src="${stopBase64}"`);
                }
                // Replace the default title with the project name
                standaloneHtml = standaloneHtml.replace(/<title>Whiskers Preview<\/title>/g, `<title>${project.name}</title>`);
                // Add compiled HTML that can run standalone in a browser
                zip.file(`${project.name}.html`, standaloneHtml);
            }
        } catch (error) {
            console.error("Failed to compile for download:", error);
            // Continue with download even if compilation fails
        }

        // Add each sprite as a .scratch file with its metadata and assets
        project.sprites.forEach((sprite) => {
            const spriteFolder = `sprites/${sprite.name}`;
            
            // Save code
            zip.file(`${spriteFolder}/code.scratch`, sprite.code);
            
            // Save sprite metadata (including costume and sound references)
            zip.file(`${spriteFolder}/sprite.json`, JSON.stringify({
                id: sprite.id,
                name: sprite.name,
                type: sprite.type,
                isStage: sprite.isStage,
                currentCostume: sprite.currentCostume,
                x: sprite.x,
                y: sprite.y,
                direction: sprite.direction,
                size: sprite.size,
                visible: sprite.visible,
                draggable: sprite.draggable,
                rotationStyle: sprite.rotationStyle,
                createdAt: sprite.createdAt,
                updatedAt: sprite.updatedAt,
            }, null, 2));
            
            // Save costumes with sprite prefix in filename
            sprite.costumes.forEach((costume, index) => {
                // Use sprite name prefix in the filename for organization
                const storageName = `${sprite.name}_${costume.name}`;
                
                // Save costume metadata
                zip.file(`${spriteFolder}/costumes/${index}_${storageName}.json`, JSON.stringify({
                    id: costume.id,
                    name: costume.name,  // Store display name (without prefix)
                    mimeType: costume.mimeType,
                    width: costume.width,
                    height: costume.height,
                    rotationCenterX: costume.rotationCenterX,
                    rotationCenterY: costume.rotationCenterY,
                }, null, 2));
                
                // Save costume image data if present
                if (costume.data) {
                    // Extract base64 data and save as binary
                    const base64Data = costume.data.split(',')[1];
                    const extension = costume.mimeType.split('/')[1] || 'png';
                    zip.file(`${spriteFolder}/costumes/${index}_${storageName}.${extension}`, base64Data, { base64: true });
                }
            });
            
            // Save sounds with sprite prefix in filename
            sprite.sounds.forEach((sound, index) => {
                // Use sprite name prefix in the filename for organization
                const storageName = `${sprite.name}_${sound.name}`;
                
                // Save sound metadata
                zip.file(`${spriteFolder}/sounds/${index}_${storageName}.json`, JSON.stringify({
                    id: sound.id,
                    name: sound.name,  // Store display name (without prefix)
                    mimeType: sound.mimeType,
                    duration: sound.duration,
                }, null, 2));
                
                // Save sound data if present
                if (sound.data) {
                    // Extract base64 data and save as binary
                    const base64Data = sound.data.split(',')[1];
                    const extension = sound.mimeType.split('/')[1] || 'mp3';
                    zip.file(`${spriteFolder}/sounds/${index}_${storageName}.${extension}`, base64Data, { base64: true });
                }
            });
        });

        // Generate and download - Changed from .scratch.zip to .zip
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.name}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        
        onNotify("Project saved successfully!", "success");
    };

    // Download single sprite as .scratch file
    const handleDownloadSprite = () => {
        const activeSprite = project.sprites.find((s) => s.id === project.activeSprite);
        if (!activeSprite) return;

        const blob = new Blob([activeSprite.code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeSprite.name}.scratch`;
        a.click();
        URL.revokeObjectURL(url);
        
        onNotify(`Sprite "${activeSprite.name}" saved!`, "success");
    };

    // Handle New Project button click
    const handleNewProject = () => {
        setPendingAction("new");
        setShowConfirmModal(true);
    };

    // Handle Open Project button click
    const handleOpenProjectClick = () => {
        openProjectInputRef.current?.click();
    };

    // Handle open project file selection
    const handleOpenProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        const file = files[0];
        if (file.name.endsWith(".zip")) {
            setPendingFile(file);
            setPendingAction("open");
            setShowConfirmModal(true);
        }
        
        // Reset input
        if (openProjectInputRef.current) {
            openProjectInputRef.current.value = "";
        }
    };

    // Execute new project after confirmation - now shows name modal
    const executeNewProject = () => {
        setShowConfirmModal(false);
        setShowNameModal(true);
    };

    // Handle project name confirmation
    const handleNameConfirm = async (name: string) => {
        let newProject = createProject(name);
        // Load default costume data for all sprites
        newProject = await loadDefaultCostumesForProject(newProject);
        onNewProject(newProject);
        setShowNameModal(false);
        setPendingAction(null);
        onNotify(`Project "${name}" created!`, "success");
    };

    // Handle name modal cancel
    const handleNameCancel = () => {
        setShowNameModal(false);
        setPendingAction(null);
    };

    // Execute open project after confirmation
    const executeOpenProject = async () => {
        if (pendingFile) {
            await handleZipImport(pendingFile);
        }
        setShowConfirmModal(false);
        setPendingAction(null);
        setPendingFile(null);
    };

    // Handle save and continue
    const handleSaveAndContinue = async () => {
        await downloadProject();
        // Small delay to ensure download starts
        setTimeout(() => {
            if (pendingAction === "new") {
                executeNewProject();
            } else if (pendingAction === "open") {
                executeOpenProject();
            }
        }, 500);
    };

    // Handle discard and continue
    const handleDiscardAndContinue = () => {
        if (pendingAction === "new") {
            executeNewProject();
        } else if (pendingAction === "open") {
            executeOpenProject();
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setShowConfirmModal(false);
        setPendingAction(null);
        setPendingFile(null);
    };

    // Handle file upload (for importing sprites)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (file.name.endsWith(".scratch.zip") || file.name.endsWith(".zip")) {
                // For zip files, treat as "Open Project" flow
                setPendingFile(file);
                setPendingAction("open");
                setShowConfirmModal(true);
                break; // Only handle one zip at a time
            } else if (file.name.endsWith(".scratch")) {
                // Handle single sprite file - add to current project
                await handleScratchImport(file);
            }
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Import a ZIP project
    const handleZipImport = async (file: File) => {
        try {
            const zip = await JSZip.loadAsync(file);
            
            // Check if it's a valid project
            const projectJsonFile = zip.file("project.json");
            if (!projectJsonFile) {
                // It might be a folder of .scratch files (legacy format)
                await handleFolderZip(zip, file.name);
                return;
            }

            // Parse project metadata
            const projectJson = await projectJsonFile.async("text");
            const projectMeta = JSON.parse(projectJson);

            // Load all sprites
            const sprites: SpriteFile[] = [];
            const spriteFolders = Object.keys(zip.files)
                .filter(path => path.startsWith("sprites/") && path.endsWith("/sprite.json"))
                .map(path => path.replace("/sprite.json", ""));
            
            // Check for legacy format (flat sprites folder)
            if (spriteFolders.length === 0) {
                await handleLegacyZipImport(zip, projectMeta, file.name);
                return;
            }

            // New format: sprites/SpriteName/sprite.json, code.scratch, costumes/, sounds/
            for (const spriteFolder of spriteFolders) {
                // Load sprite metadata
                const spriteJsonFile = zip.file(`${spriteFolder}/sprite.json`);
                if (!spriteJsonFile) continue;
                
                const spriteMeta = JSON.parse(await spriteJsonFile.async("text"));
                const spriteName = spriteMeta.name || spriteFolder.split("/").pop() || "Sprite";
                
                // Create sprite
                const sprite = createSprite(spriteName, spriteMeta.isStage ? "backdrop" : "sprite");
                sprite.id = spriteMeta.id || sprite.id;
                sprite.currentCostume = spriteMeta.currentCostume || 0;
                sprite.x = spriteMeta.x ?? 0;
                sprite.y = spriteMeta.y ?? 0;
                sprite.direction = spriteMeta.direction ?? 90;
                sprite.size = spriteMeta.size ?? 100;
                sprite.visible = spriteMeta.visible ?? true;
                sprite.draggable = spriteMeta.draggable ?? false;
                sprite.rotationStyle = spriteMeta.rotationStyle || "all around";
                sprite.createdAt = spriteMeta.createdAt || Date.now();
                sprite.updatedAt = spriteMeta.updatedAt || Date.now();
                
                // Load code
                const codeFile = zip.file(`${spriteFolder}/code.scratch`);
                if (codeFile) {
                    sprite.code = await codeFile.async("text");
                }
                
                // Load costumes
                const costumeFiles = Object.keys(zip.files)
                    .filter(path => path.startsWith(`${spriteFolder}/costumes/`) && path.endsWith(".json"));
                
                if (costumeFiles.length > 0) {
                    sprite.costumes = [];
                    for (const costumeJsonPath of costumeFiles) {
                        const costumeJson = JSON.parse(await zip.files[costumeJsonPath].async("text"));
                        
                        // Find the matching image file
                        const basePath = costumeJsonPath.replace(".json", "");
                        let costumeData: string | null = null;
                        
                        // Look for image file with various extensions
                        for (const ext of ["png", "jpg", "jpeg", "gif", "svg", "webp"]) {
                            const imgFile = zip.file(`${basePath}.${ext}`);
                            if (imgFile) {
                                const imgData = await imgFile.async("base64");
                                const mimeType = costumeJson.mimeType || `image/${ext === "svg" ? "svg+xml" : ext}`;
                                costumeData = `data:${mimeType};base64,${imgData}`;
                                break;
                            }
                        }
                        
                        const costume: Costume = {
                            id: costumeJson.id || `costume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            name: costumeJson.name || "costume",
                            data: costumeData,
                            mimeType: costumeJson.mimeType || "image/png",
                            width: costumeJson.width || 100,
                            height: costumeJson.height || 100,
                            rotationCenterX: costumeJson.rotationCenterX || 0,
                            rotationCenterY: costumeJson.rotationCenterY || 0,
                        };
                        sprite.costumes.push(costume);
                    }
                    
                    // Sort by filename index prefix
                    sprite.costumes.sort((a, b) => {
                        const aMatch = costumeFiles.find(f => f.includes(a.name));
                        const bMatch = costumeFiles.find(f => f.includes(b.name));
                        const aIndex = aMatch ? parseInt(aMatch.split("/").pop()?.split("_")[0] || "0") : 0;
                        const bIndex = bMatch ? parseInt(bMatch.split("/").pop()?.split("_")[0] || "0") : 0;
                        return aIndex - bIndex;
                    });
                }
                
                // Ensure at least one costume
                if (sprite.costumes.length === 0) {
                    sprite.costumes = [createCostume(sprite.isStage ? "backdrop1" : "costume1")];
                }
                
                // Load sounds
                const soundFiles = Object.keys(zip.files)
                    .filter(path => path.startsWith(`${spriteFolder}/sounds/`) && path.endsWith(".json"));
                
                if (soundFiles.length > 0) {
                    sprite.sounds = [];
                    for (const soundJsonPath of soundFiles) {
                        const soundJson = JSON.parse(await zip.files[soundJsonPath].async("text"));
                        
                        // Find the matching audio file
                        const basePath = soundJsonPath.replace(".json", "");
                        let soundData: string | null = null;
                        
                        // Look for audio file with various extensions
                        for (const ext of ["mp3", "wav", "ogg", "m4a", "mpeg"]) {
                            const audioFile = zip.file(`${basePath}.${ext}`);
                            if (audioFile) {
                                const audioData = await audioFile.async("base64");
                                const mimeType = soundJson.mimeType || `audio/${ext === "mp3" ? "mpeg" : ext}`;
                                soundData = `data:${mimeType};base64,${audioData}`;
                                break;
                            }
                        }
                        
                        const sound: Sound = {
                            id: soundJson.id || `sound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            name: soundJson.name || "sound",
                            data: soundData,
                            mimeType: soundJson.mimeType || "audio/mpeg",
                            duration: soundJson.duration || 0,
                        };
                        sprite.sounds.push(sound);
                    }
                    
                    // Sort by filename index prefix
                    sprite.sounds.sort((a, b) => {
                        const aMatch = soundFiles.find(f => f.includes(a.name));
                        const bMatch = soundFiles.find(f => f.includes(b.name));
                        const aIndex = aMatch ? parseInt(aMatch.split("/").pop()?.split("_")[0] || "0") : 0;
                        const bIndex = bMatch ? parseInt(bMatch.split("/").pop()?.split("_")[0] || "0") : 0;
                        return aIndex - bIndex;
                    });
                }
                
                sprites.push(sprite);
            }

            // Ensure Stage is first and we have one
            let finalSprites = sprites;
            const stageSprite = sprites.find(s => s.isStage);
            const nonStageSprites = sprites.filter(s => !s.isStage);
            
            if (stageSprite) {
                finalSprites = [stageSprite, ...nonStageSprites];
            } else if (sprites.length > 0) {
                const backdrop = createSprite("Stage", "backdrop");
                finalSprites = [backdrop, ...sprites];
            }

            // Create the imported project
            const importedProject: ScratchProject = {
                id: projectMeta.id || `project_${Date.now()}`,
                name: projectMeta.name || file.name.replace(".scratch.zip", "").replace(".zip", ""),
                version: projectMeta.version || "1.1.0",
                sprites: finalSprites.length > 0 ? finalSprites : project.sprites,
                activeSprite: finalSprites.length > 0 ? (finalSprites.find(s => !s.isStage)?.id || finalSprites[0].id) : project.activeSprite,
                createdAt: projectMeta.createdAt || Date.now(),
                updatedAt: Date.now(),
            };

            onImportProject(importedProject);
            onNotify(`Project "${importedProject.name}" loaded!`, "success");
        } catch (error) {
            console.error("Error importing ZIP:", error);
            onNotify("Failed to import project. Please check the file format.", "error");
        }
    };

    // Handle legacy ZIP format (flat sprites folder)
    const handleLegacyZipImport = async (zip: JSZip, projectMeta: { id?: string; name?: string; version?: string; activeSprite?: string; createdAt?: number }, fileName: string) => {
        const sprites: SpriteFile[] = [];
        const scratchFiles: { [key: string]: string } = {};
        const metaFiles: { [key: string]: { id?: string; createdAt?: number; updatedAt?: number; isStage?: boolean; type?: string } } = {};

        // First pass: collect all files
        await Promise.all(
            Object.keys(zip.files)
                .filter((path) => path.startsWith("sprites/"))
                .map(async (path) => {
                    const file = zip.files[path];
                    if (file.dir) return;
                    
                    const content = await file.async("text");
                    const fileName = path.replace("sprites/", "");
                    
                    if (fileName.endsWith(".scratch")) {
                        scratchFiles[fileName.replace(".scratch", "")] = content;
                    } else if (fileName.endsWith(".meta.json")) {
                        metaFiles[fileName.replace(".meta.json", "")] = JSON.parse(content);
                    }
                })
        );

        // Second pass: combine into sprites
        for (const name of Object.keys(scratchFiles)) {
            const meta = metaFiles[name];
            const isStage = name === "Stage" || meta?.isStage || meta?.type === "backdrop";
            const sprite = createSprite(name, isStage ? "backdrop" : "sprite");
            sprite.code = scratchFiles[name];
            if (meta?.id) sprite.id = meta.id;
            if (meta?.createdAt) sprite.createdAt = meta.createdAt;
            if (meta?.updatedAt) sprite.updatedAt = meta.updatedAt;
            sprites.push(sprite);
        }

        // Ensure Stage is first and we have one
        const stageSprite = sprites.find(s => s.isStage);
        const nonStageSprites = sprites.filter(s => !s.isStage);
        
        let finalSprites: SpriteFile[];
        if (stageSprite) {
            finalSprites = [stageSprite, ...nonStageSprites];
        } else if (sprites.length > 0) {
            const backdrop = createSprite("Stage", "backdrop");
            finalSprites = [backdrop, ...sprites];
        } else {
            finalSprites = project.sprites;
        }

        // Create the imported project
        const importedProject: ScratchProject = {
            id: projectMeta.id || `project_${Date.now()}`,
            name: projectMeta.name || fileName.replace(".scratch.zip", "").replace(".zip", ""),
            version: projectMeta.version || "1.1.0",
            sprites: finalSprites,
            activeSprite: finalSprites.find(s => !s.isStage)?.id || finalSprites[0].id,
            createdAt: projectMeta.createdAt || Date.now(),
            updatedAt: Date.now(),
        };

        onImportProject(importedProject);
        onNotify(`Project "${importedProject.name}" loaded!`, "success");
    };

    // Handle a ZIP that's just a folder of .scratch files
    const handleFolderZip = async (zip: JSZip, fileName: string) => {
        const sprites: SpriteFile[] = [];
        
        await Promise.all(
            Object.keys(zip.files)
                .filter((path) => path.endsWith(".scratch") && !zip.files[path].dir)
                .map(async (path) => {
                    const content = await zip.files[path].async("text");
                    const name = path.split("/").pop()?.replace(".scratch", "") || "Sprite";
                    const isStage = name === "Stage";
                    const sprite = createSprite(name, isStage ? "backdrop" : "sprite");
                    sprite.code = content;
                    sprites.push(sprite);
                })
        );

        if (sprites.length > 0) {
            // Ensure we have a backdrop if not present
            const stageSprite = sprites.find(s => s.isStage);
            const nonStageSprites = sprites.filter(s => !s.isStage);
            
            let finalSprites: SpriteFile[];
            if (stageSprite) {
                finalSprites = [stageSprite, ...nonStageSprites];
            } else {
                const backdrop = createSprite("Stage", "backdrop");
                finalSprites = [backdrop, ...sprites];
            }
            
            const projectName = fileName.replace(".zip", "").replace(".scratch", "") || "Imported Project";
            const importedProject: ScratchProject = {
                id: `project_${Date.now()}`,
                name: projectName,
                version: "1.1.0",
                sprites: finalSprites,
                activeSprite: finalSprites.find(s => !s.isStage)?.id || finalSprites[0].id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            onImportProject(importedProject);
            onNotify(`Project "${projectName}" loaded!`, "success");
        }
    };

    // Import a single .scratch file
    const handleScratchImport = async (file: File) => {
        try {
            const content = await file.text();
            const name = file.name.replace(".scratch", "");
            
            const sprite = createSprite(name, "sprite", true); // Empty template for imported
            sprite.code = content;
            
            onImportSprite(sprite);
            onNotify(`Sprite "${name}" imported!`, "success");
        } catch (error) {
            console.error("Error importing sprite:", error);
            onNotify("Failed to import sprite file.", "error");
        }
    };

    // State for dropdown menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-1 relative">
                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".scratch,.zip"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <input
                    ref={openProjectInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleOpenProjectFile}
                    className="hidden"
                />

                {/* Hamburger Menu Button */}
                <Tooltip content={t.playground.toolbar.menu}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                        aria-label={t.playground.toolbar.menu}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </Tooltip>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <>
                        {/* Backdrop to close menu when clicking outside */}
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 z-50 min-w-48">
                            {/* New Project */}
                            <button
                                onClick={() => { handleNewProject(); setIsMenuOpen(false); }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <span className="text-green-400">✨</span>
                                {t.playground.toolbar.newProject}
                            </button>

                            {/* Open Project */}
                            <button
                                onClick={() => { handleOpenProjectClick(); setIsMenuOpen(false); }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <span className="text-blue-400">📂</span>
                                {t.playground.toolbar.openProject}
                            </button>

                            {/* Save Project */}
                            <button
                                onClick={() => { downloadProject(); setIsMenuOpen(false); }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <span className="text-indigo-400">💾</span>
                                {t.playground.toolbar.saveProject}
                            </button>

                            {/* Divider */}
                            <div className="border-t border-gray-700 my-1" />

                            {/* Show/Hide Output */}
                            <button
                                onClick={() => { if (canShowOutput) { onToggleOutput(); setIsMenuOpen(false); } }}
                                disabled={!canShowOutput}
                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                                    canShowOutput 
                                        ? "text-gray-200 hover:bg-gray-700" 
                                        : "text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <span className={canShowOutput ? "text-purple-400" : "text-gray-500"}>📄</span>
                                {showOutput ? t.playground.toolbar.hideOutput : t.playground.toolbar.showOutput}
                            </button>

                            {/* Divider */}
                            <div className="border-t border-gray-700 my-1" />

                            {/* Help & Support */}
                            <Link
                                href="/support"
                                target="_blank"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <span className="text-yellow-400">❓</span>
                                {t.playground.toolbar.support}
                            </Link>

                            {/* Contact Us */}
                            <Link
                                href="/contact"
                                target="_blank"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <span className="text-cyan-400">✉️</span>
                                {t.playground.toolbar.contact}
                            </Link>
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title={pendingAction === "new" ? t.playground.modals.newProjectTitle : t.playground.modals.unsavedChangesTitle}
                message={t.playground.modals.unsavedChangesMessage}
                onSave={handleSaveAndContinue}
                onDiscard={handleDiscardAndContinue}
                onCancel={handleCancel}
                labels={{
                    cancel: t.common.cancel,
                    discard: t.common.discard,
                    save: t.playground.toolbar.saveProject,
                    howSavingWorks: t.playground.modals.howSavingWorks,
                }}
            />

            {/* Project Name Modal */}
            <ProjectNameModal
                isOpen={showNameModal}
                title={t.playground.modals.projectNameTitle}
                defaultValue={t.playground.toolbar.newProject}
                onConfirm={handleNameConfirm}
                onCancel={handleNameCancel}
                labels={{
                    placeholder: t.playground.modals.projectNamePlaceholder,
                    cancel: t.common.cancel,
                    create: t.common.confirm,
                }}
            />
        </>
    );
}
