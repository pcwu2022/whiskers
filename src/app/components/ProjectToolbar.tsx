// Project Toolbar Component
// Provides upload/download functionality and project management

"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ScratchProject, SpriteFile, createSprite, createProject } from "@/types/projectTypes";
import JSZip from "jszip";
import { Tooltip } from "./ui";

interface ProjectToolbarProps {
    project: ScratchProject;
    onImportProject: (project: ScratchProject) => void;
    onImportSprite: (sprite: SpriteFile) => void;
    onNewProject: (project: ScratchProject) => void;
    onProjectNameChange: (name: string) => void;
    onNotify: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

// Confirmation Modal Component
function ConfirmModal({
    isOpen,
    title,
    message,
    onSave,
    onDiscard,
    onCancel,
}: {
    isOpen: boolean;
    title: string;
    message: string;
    onSave: () => void;
    onDiscard: () => void;
    onCancel: () => void;
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
                    How does saving work? →
                </Link>
                <div className="flex gap-3 justify-end mt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDiscard}
                        className="px-4 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        Save Project
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
}: {
    isOpen: boolean;
    title: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
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
                        placeholder="Enter project name"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
                    />
                    
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!value.trim()}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Project
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
}: ProjectToolbarProps) {
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

        // Add each sprite as a .scratch file
        project.sprites.forEach((sprite) => {
            zip.file(`sprites/${sprite.name}.scratch`, sprite.code);
            // Also save sprite metadata
            zip.file(`sprites/${sprite.name}.meta.json`, JSON.stringify({
                id: sprite.id,
                name: sprite.name,
                type: sprite.type,
                isStage: sprite.isStage,
                createdAt: sprite.createdAt,
                updatedAt: sprite.updatedAt,
            }, null, 2));
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
    const handleNameConfirm = (name: string) => {
        const newProject = createProject(name);
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
                // It might be a folder of .scratch files
                await handleFolderZip(zip, file.name);
                return;
            }

            // Parse project metadata
            const projectJson = await projectJsonFile.async("text");
            const projectMeta = JSON.parse(projectJson);

            // Load all sprites
            const sprites: SpriteFile[] = [];
            const spriteFiles = zip.folder("sprites");
            
            if (spriteFiles) {
                const scratchFiles: { [key: string]: string } = {};
                const metaFiles: { [key: string]: unknown } = {};

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
                    const meta = metaFiles[name] as { id?: string; createdAt?: number; updatedAt?: number; isStage?: boolean; type?: string } | undefined;
                    const isStage = name === "Stage" || meta?.isStage || meta?.type === "backdrop";
                    const sprite = createSprite(name, isStage ? "backdrop" : "sprite");
                    sprite.code = scratchFiles[name];
                    if (meta?.id) sprite.id = meta.id;
                    if (meta?.createdAt) sprite.createdAt = meta.createdAt;
                    if (meta?.updatedAt) sprite.updatedAt = meta.updatedAt;
                    sprites.push(sprite);
                }
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

    return (
        <>
            <div className="flex items-center gap-1">
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

                {/* New Project Button */}
                <Tooltip content="Create a new project">
                    <button
                        onClick={handleNewProject}
                        className="px-3 py-1.5 text-sm bg-blue-700 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        New Project
                    </button>
                </Tooltip>

                {/* Open Project Button */}
                <Tooltip content="Open a project (.zip)">
                    <button
                        onClick={handleOpenProjectClick}
                        className="px-3 py-1.5 text-sm bg-green-700 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        Open Project
                    </button>
                </Tooltip>

                {/* Separator */}
                <span className="text-gray-600 mx-1">|</span>

                {/* Upload Button (Icon only) */}
                <Tooltip content="Import sprite (.scratch) or project (.zip)">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </button>
                </Tooltip>

                {/* Download Dropdown (Icon only) */}
                <div className="relative group">
                    <Tooltip content="Download project or sprite">
                        <button
                            className="p-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </button>
                    </Tooltip>
                    <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 hidden group-hover:block z-50 min-w-44">
                        <button
                            onClick={downloadProject}
                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2"
                        >
                            <span>📦</span> Save Project (.zip)
                        </button>
                        <button
                            onClick={handleDownloadSprite}
                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2"
                        >
                            <span>📄</span> Save Current Sprite
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title={pendingAction === "new" ? "Create New Project?" : "Open Another Project?"}
                message="Your current project will be lost unless you save it first. Would you like to save your project before continuing?"
                onSave={handleSaveAndContinue}
                onDiscard={handleDiscardAndContinue}
                onCancel={handleCancel}
            />

            {/* Project Name Modal */}
            <ProjectNameModal
                isOpen={showNameModal}
                title="Name Your Project"
                defaultValue="New Project"
                onConfirm={handleNameConfirm}
                onCancel={handleNameCancel}
            />
        </>
    );
}
