"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { languageDef, languageSelector } from "@/lib/codeEditorConfig";
import FileTabs from "./FileTabs";
import ProjectToolbar from "./ProjectToolbar";
import {
    ScratchProject,
    SpriteFile,
    createProject,
    createSprite,
    PROJECT_STORAGE_KEY,
    LEGACY_CODE_KEY,
    DEFAULT_SPRITE_CODE,
} from "@/types/projectTypes";

type monacoType = typeof monaco;

// Helper to generate unique sprite names
function generateSpriteName(sprites: SpriteFile[]): string {
    const existingNames = new Set(sprites.map((s) => s.name));
    let num = sprites.length + 1;
    while (existingNames.has(`Sprite${num}`)) {
        num++;
    }
    return `Sprite${num}`;
}

export default function CodeEditor() {
    // Project state
    const [project, setProject] = useState<ScratchProject | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Compilation state
    const [compiledJsCode, setCompiledJsCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [compiled, setCompiled] = useState(false);
    const [running, setRunning] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showCode, setShowCode] = useState(false);

    // UI state for future toolbox (reserved)
    const [showToolbox, setShowToolbox] = useState(false);
    
    // Save notification state
    const [showSaveNotification, setShowSaveNotification] = useState(false);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoInstance = useMonaco();

    // Load project from localStorage on mount
    useEffect(() => {
        const loadProject = () => {
            try {
                const savedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
                if (savedProject) {
                    const parsed = JSON.parse(savedProject) as ScratchProject;
                    setProject(parsed);
                } else {
                    // Check for legacy code and migrate
                    const legacyCode = localStorage.getItem(LEGACY_CODE_KEY);
                    const newProject = createProject("My Project");
                    if (legacyCode && legacyCode.trim()) {
                        newProject.sprites[0].code = legacyCode;
                    }
                    setProject(newProject);
                    // Clean up legacy storage
                    localStorage.removeItem(LEGACY_CODE_KEY);
                }
            } catch (error) {
                console.error("Error loading project:", error);
                setProject(createProject("My Project"));
            }
            setIsLoaded(true);
        };
        loadProject();
    }, []);

    // Save project to localStorage whenever it changes
    useEffect(() => {
        if (project && isLoaded) {
            localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
        }
    }, [project, isLoaded]);

    // Handle Ctrl+S to show save notification instead of browser save dialog
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                // Project is already auto-saved, just show notification
                setShowSaveNotification(true);
                // Hide notification after 2 seconds
                setTimeout(() => {
                    setShowSaveNotification(false);
                }, 2000);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Setup Monaco language
    useEffect(() => {
        if (monacoInstance) {
            monacoInstance.languages.register({ id: "scratchSyntax" });
            monacoInstance.languages.setMonarchTokensProvider("scratchSyntax", languageDef);
            monacoInstance.languages.registerCompletionItemProvider("scratchSyntax", languageSelector(monacoInstance));
            monacoInstance.languages.register({ id: "javascript" });
            monacoInstance.languages.register({ id: "html" });
        }
    }, [monacoInstance]);

    // Get active sprite
    const activeSprite = project?.sprites.find((s) => s.id === project.activeSprite);
    const currentCode = activeSprite?.code || DEFAULT_SPRITE_CODE;

    // Handle editor mount
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: monacoType) => {
        editorRef.current = editor;
        if (monacoInstance) {
            monaco.editor.setModelLanguage(editor.getModel()!, "scratchSyntax");
        }
    };

    // Update code for active sprite
    const updateCode = useCallback((newCode: string) => {
        if (!project) return;
        
        setProject((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                updatedAt: Date.now(),
                sprites: prev.sprites.map((sprite) =>
                    sprite.id === prev.activeSprite
                        ? { ...sprite, code: newCode, updatedAt: Date.now() }
                        : sprite
                ),
            };
        });
        setCompiled(false);
    }, [project]);

    // Sprite management functions
    const handleSelectSprite = (id: string) => {
        setProject((prev) => prev ? { ...prev, activeSprite: id } : prev);
    };

    const handleAddSprite = () => {
        if (!project) return;
        const newSprite = createSprite(generateSpriteName(project.sprites));
        setProject((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                sprites: [...prev.sprites, newSprite],
                activeSprite: newSprite.id,
                updatedAt: Date.now(),
            };
        });
    };

    const handleRenameSprite = (id: string, newName: string) => {
        setProject((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                updatedAt: Date.now(),
                sprites: prev.sprites.map((sprite) =>
                    sprite.id === id
                        ? { ...sprite, name: newName, updatedAt: Date.now() }
                        : sprite
                ),
            };
        });
    };

    const handleDeleteSprite = (id: string) => {
        setProject((prev) => {
            if (!prev || prev.sprites.length <= 1) return prev;
            const newSprites = prev.sprites.filter((s) => s.id !== id);
            const newActiveSprite =
                prev.activeSprite === id ? newSprites[0].id : prev.activeSprite;
            return {
                ...prev,
                sprites: newSprites,
                activeSprite: newActiveSprite,
                updatedAt: Date.now(),
            };
        });
    };

    const handleDuplicateSprite = (id: string) => {
        if (!project) return;
        const sprite = project.sprites.find((s) => s.id === id);
        if (!sprite) return;

        const newSprite = createSprite(`${sprite.name} copy`);
        newSprite.code = sprite.code;

        setProject((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                sprites: [...prev.sprites, newSprite],
                activeSprite: newSprite.id,
                updatedAt: Date.now(),
            };
        });
    };

    // Import handlers
    const handleImportProject = (importedProject: ScratchProject) => {
        setProject(importedProject);
        setCompiled(false);
    };

    const handleImportSprite = (sprite: SpriteFile) => {
        setProject((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                sprites: [...prev.sprites, sprite],
                activeSprite: sprite.id,
                updatedAt: Date.now(),
            };
        });
    };

    // Compile all sprites
    const handleCompile = async (): Promise<{ js: string; html: string }> => {
        if (!project) return { js: "", html: "" };

        setLoading(true);
        setCompiledJsCode(null);
        setErrorMessage(null);
        setHtmlContent(null);

        let retValue = { js: "", html: "" };

        try {
            // Send all sprites to the compiler
            const response = await fetch("/api/compile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sprites: project.sprites.map((s) => ({
                        name: s.name,
                        code: s.code,
                        isStage: s.isStage,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to compile");
            }

            const data = await response.json();
            setCompiledJsCode(data.js);
            setHtmlContent(data.html || null);
            retValue = data;
        } catch (error) {
            console.error("Error compiling:", error);
            setCompiledJsCode("Compilation failed.");
            setErrorMessage(String(error));
        } finally {
            setLoading(false);
            setCompiled(true);
        }

        return retValue;
    };

    const handleRun = async () => {
        setRunning(true);
        setErrorMessage(null);

        const result = await handleCompile();

        if (!result || !result.js || !result.html) {
            setRunning(false);
            return;
        }
        setShowPreview(true);
        setRunning(false);
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    // Loading state
    if (!isLoaded || !project) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <h1 className="text-white font-bold text-lg">🐱 Scratch Compiler</h1>
                    <span className="text-gray-400 text-sm">|</span>
                    <span className="text-gray-300 text-sm">{project.name}</span>
                    {/* Save notification */}
                    {showSaveNotification && (
                        <span className="text-green-400 text-sm animate-pulse transition-opacity">
                            ✓ Saved to your local computer
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <ProjectToolbar
                        project={project}
                        onImportProject={handleImportProject}
                        onImportSprite={handleImportSprite}
                    />
                    <div className="w-px h-6 bg-gray-600" />
                    <button
                        onClick={handleRun}
                        disabled={running || loading}
                        className={`px-5 py-2 rounded font-medium text-sm transition-colors ${
                            running || loading
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                    >
                        {loading ? "⚙ Compiling..." : running ? "▶ Running..." : "▶ Run"}
                    </button>
                    {compiled && (
                        <button
                            onClick={() => setShowCode(!showCode)}
                            className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                                showCode
                                    ? "bg-purple-700 text-white"
                                    : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
                        >
                            {showCode ? "Hide JS" : "Show JS"}
                        </button>
                    )}
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left sidebar - Reserved for future Toolbox */}
                {showToolbox && (
                    <div className="w-64 bg-gray-850 border-r border-gray-700 flex flex-col">
                        <div className="bg-gray-800 px-3 py-2 text-gray-400 text-sm border-b border-gray-700">
                            🧰 Toolbox
                        </div>
                        <div className="flex-1 p-2 text-gray-500 text-sm">
                            {/* Future: Draggable block hints will go here */}
                            <p className="text-center py-4">Coming soon...</p>
                        </div>
                    </div>
                )}

                {/* Code Editor Panel */}
                <div className={`flex flex-col ${showPreview ? "w-1/2" : "flex-1"} transition-all`}>
                    {/* File Tabs */}
                    <FileTabs
                        sprites={project.sprites}
                        activeSprite={project.activeSprite}
                        onSelectSprite={handleSelectSprite}
                        onAddSprite={handleAddSprite}
                        onRenameSprite={handleRenameSprite}
                        onDeleteSprite={handleDeleteSprite}
                        onDuplicateSprite={handleDuplicateSprite}
                    />
                    
                    {/* Editor Label */}
                    <div className="bg-gray-800 px-3 py-2 text-gray-400 text-sm border-b border-gray-700 flex justify-between items-center">
                        <span>📝 {activeSprite?.name || "Scratch Code"}</span>
                        <button
                            onClick={() => setShowToolbox(!showToolbox)}
                            className={`text-xs px-2 py-1 rounded ${
                                showToolbox ? "bg-gray-600 text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                            title="Toggle Toolbox (Coming Soon)"
                        >
                            🧰
                        </button>
                    </div>
                    
                    {/* Monaco Editor */}
                    <div className="flex-1">
                        <Editor
                            width="100%"
                            height="100%"
                            language="scratchSyntax"
                            theme="vs-dark"
                            value={currentCode}
                            options={{
                                selectOnLineNumbers: true,
                                roundedSelection: false,
                                readOnly: false,
                                cursorStyle: "line",
                                automaticLayout: true,
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 10 },
                            }}
                            onChange={(value) => updateCode(value || "")}
                            onMount={handleEditorDidMount}
                        />
                    </div>
                </div>

                {/* Preview Panel */}
                {showPreview && htmlContent && (
                    <div className="w-1/2 flex flex-col border-l border-gray-700">
                        <div className="bg-gray-800 px-3 py-2 flex justify-between items-center border-b border-gray-700">
                            <span className="text-gray-400 text-sm">🎮 Preview</span>
                            <button
                                onClick={closePreview}
                                className="text-gray-400 hover:text-white text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100">
                            <iframe
                                srcDoc={htmlContent}
                                className="w-full h-full border-0"
                                title="Preview"
                                sandbox="allow-scripts"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Error message bar */}
            {errorMessage && (
                <div className="bg-red-900 border-t border-red-700 px-4 py-2 flex justify-between items-center">
                    <span className="text-red-200 text-sm">⚠ {errorMessage}</span>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="text-red-400 hover:text-red-200"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Generated JS Code Panel (collapsible) */}
            {showCode && compiledJsCode && (
                <div className="h-64 border-t border-gray-700 flex flex-col">
                    <div className="bg-gray-800 px-3 py-2 flex justify-between items-center border-b border-gray-700">
                        <span className="text-gray-400 text-sm">📄 Generated JavaScript</span>
                        <button
                            onClick={() => setShowCode(false)}
                            className="text-gray-400 hover:text-white text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>
                    <div className="flex-1">
                        <Editor
                            width="100%"
                            height="100%"
                            language="javascript"
                            theme="vs-dark"
                            value={compiledJsCode}
                            options={{
                                readOnly: true,
                                automaticLayout: true,
                                minimap: { enabled: false },
                                fontSize: 12,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
