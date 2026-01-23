// Project Toolbar Component
// Provides upload/download functionality and project management

"use client";

import React, { useRef } from "react";
import { ScratchProject, SpriteFile } from "@/types/projectTypes";
import JSZip from "jszip";

interface ProjectToolbarProps {
    project: ScratchProject;
    onImportProject: (project: ScratchProject) => void;
    onImportSprite: (sprite: SpriteFile) => void;
}

export default function ProjectToolbar({
    project,
    onImportProject,
    onImportSprite,
}: ProjectToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    // Download current project as ZIP
    const handleDownloadProject = async () => {
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
                createdAt: sprite.createdAt,
                updatedAt: sprite.updatedAt,
            }, null, 2));
        });

        // Generate and download
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.name}.scratch.zip`;
        a.click();
        URL.revokeObjectURL(url);
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
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (file.name.endsWith(".scratch.zip") || file.name.endsWith(".zip")) {
                // Handle ZIP file (full project)
                await handleZipImport(file);
            } else if (file.name.endsWith(".scratch")) {
                // Handle single sprite file
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
                await handleFolderZip(zip);
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
                    const meta = metaFiles[name] as { id?: string; createdAt?: number; updatedAt?: number } | undefined;
                    sprites.push({
                        id: meta?.id || `sprite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name,
                        code: scratchFiles[name],
                        createdAt: meta?.createdAt || Date.now(),
                        updatedAt: meta?.updatedAt || Date.now(),
                    });
                }
            }

            // Create the imported project
            const importedProject: ScratchProject = {
                id: projectMeta.id || `project_${Date.now()}`,
                name: projectMeta.name || file.name.replace(".scratch.zip", "").replace(".zip", ""),
                version: projectMeta.version || "1.0.0",
                sprites: sprites.length > 0 ? sprites : project.sprites,
                activeSprite: sprites.length > 0 ? sprites[0].id : project.activeSprite,
                createdAt: projectMeta.createdAt || Date.now(),
                updatedAt: Date.now(),
            };

            onImportProject(importedProject);
            alert(`Project "${importedProject.name}" imported successfully!`);
        } catch (error) {
            console.error("Error importing ZIP:", error);
            alert("Failed to import project. Please check the file format.");
        }
    };

    // Handle a ZIP that's just a folder of .scratch files
    const handleFolderZip = async (zip: JSZip) => {
        const sprites: SpriteFile[] = [];
        
        await Promise.all(
            Object.keys(zip.files)
                .filter((path) => path.endsWith(".scratch") && !zip.files[path].dir)
                .map(async (path) => {
                    const content = await zip.files[path].async("text");
                    const name = path.split("/").pop()?.replace(".scratch", "") || "Sprite";
                    sprites.push({
                        id: `sprite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name,
                        code: content,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    });
                })
        );

        if (sprites.length > 0) {
            const importedProject: ScratchProject = {
                id: `project_${Date.now()}`,
                name: "Imported Project",
                version: "1.0.0",
                sprites,
                activeSprite: sprites[0].id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            onImportProject(importedProject);
            alert(`Imported ${sprites.length} sprite(s) successfully!`);
        }
    };

    // Import a single .scratch file
    const handleScratchImport = async (file: File) => {
        try {
            const content = await file.text();
            const name = file.name.replace(".scratch", "");
            
            const sprite: SpriteFile = {
                id: `sprite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                code: content,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            
            onImportSprite(sprite);
            alert(`Sprite "${name}" imported successfully!`);
        } catch (error) {
            console.error("Error importing sprite:", error);
            alert("Failed to import sprite file.");
        }
    };

    return (
        <div className="flex items-center gap-2">
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
                ref={folderInputRef}
                type="file"
                // @ts-expect-error - webkitdirectory is not in the type definitions
                webkitdirectory="true"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Upload Button */}
            <div className="relative group">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
                    title="Upload .scratch file or .zip project"
                >
                    📤 Upload
                </button>
            </div>

            {/* Download Dropdown */}
            <div className="relative group">
                <button
                    className="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
                >
                    📥 Download ▾
                </button>
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 hidden group-hover:block z-50 min-w-40">
                    <button
                        onClick={handleDownloadProject}
                        className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
                    >
                        📦 Download Project (.zip)
                    </button>
                    <button
                        onClick={handleDownloadSprite}
                        className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
                    >
                        📄 Download Current Sprite
                    </button>
                </div>
            </div>
        </div>
    );
}
