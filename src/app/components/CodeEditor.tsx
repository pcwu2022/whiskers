"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { languageDef, languageSelector, registerScratchTheme, toolboxCategories, ToolboxCategory, ToolboxCommand } from "@/lib/codeEditorConfig";
import FileTabs from "./FileTabs";
import ProjectToolbar from "./ProjectToolbar";
import { Notification, useNotifications, Tooltip } from "./ui";
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

// Project Name Modal Component
function ProjectNameModal({
    isOpen,
    title,
    message,
    defaultValue,
    onConfirm,
    onCancel,
}: {
    isOpen: boolean;
    title: string;
    message?: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}) {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
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
                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                {message && <p className="text-gray-300 mb-4">{message}</p>}
                
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
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!value.trim()}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            OK
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CodeEditor() {
    // Project state
    const [project, setProject] = useState<ScratchProject | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Compilation state
    const [compiledJsCode, setCompiledJsCode] = useState<string | null>(null);
    const [_loading, setLoading] = useState(false);
    const [compiled, setCompiled] = useState(false);
    const [_running, setRunning] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(true);
    const [showCode, setShowCode] = useState(false);
    const [autoStart, setAutoStart] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const previewIframeRef = useRef<HTMLIFrameElement>(null);

    // UI state for toolbox sidebar
    const [showToolbox, setShowToolbox] = useState(true); // Default open on page load
    const [expandedCategory, setExpandedCategory] = useState<string | null>("Events"); // Default expanded
    
    // Project name editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);
    
    // First load name prompt
    const [showFirstLoadNameModal, setShowFirstLoadNameModal] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(false);

    // Notifications
    const { notifications, dismissNotification, notify } = useNotifications();

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const handleRunRef = useRef<() => void>(() => {});
    const monacoInstance = useMonaco();

    // Load project from localStorage on mount
    useEffect(() => {
        const loadProject = () => {
            try {
                const savedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
                if (savedProject) {
                    const parsed = JSON.parse(savedProject) as ScratchProject;
                    
                    // Migration: Ensure project has a backdrop/stage
                    const hasBackdrop = parsed.sprites.some(s => s.isStage || s.type === 'backdrop');
                    if (!hasBackdrop) {
                        const backdrop = createSprite('Stage', 'backdrop');
                        parsed.sprites.unshift(backdrop); // Add backdrop at beginning
                    }
                    
                    setProject(parsed);
                } else {
                    // Check for legacy code and migrate
                    const legacyCode = localStorage.getItem(LEGACY_CODE_KEY);
                    const newProject = createProject("My Project");
                    if (legacyCode && legacyCode.trim()) {
                        // Put legacy code in the first sprite (not backdrop)
                        const firstSprite = newProject.sprites.find(s => !s.isStage);
                        if (firstSprite) {
                            firstSprite.code = legacyCode;
                        }
                    }
                    setProject(newProject);
                    // Clean up legacy storage
                    localStorage.removeItem(LEGACY_CODE_KEY);
                    
                    // This is a fresh start - prompt for project name
                    setIsFirstLoad(true);
                    setShowFirstLoadNameModal(true);
                }
            } catch (error) {
                console.error("Error loading project:", error);
                const newProject = createProject("My Project");
                setProject(newProject);
                setIsFirstLoad(true);
                setShowFirstLoadNameModal(true);
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

    // Auto-compile on first load to show preview immediately
    useEffect(() => {
        if (project && isLoaded && !compiled) {
            // Small delay to ensure everything is ready
            const timer = setTimeout(() => {
                handleRunRef.current();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [project, isLoaded, compiled]);

    // Handle auto-start after recompile - send message to iframe when new content is loaded
    useEffect(() => {
        if (autoStart && htmlContent && previewIframeRef.current) {
            // Small delay to ensure iframe has loaded the new content
            const timer = setTimeout(() => {
                previewIframeRef.current?.contentWindow?.postMessage({ type: 'scratch-autostart' }, '*');
                setAutoStart(false);
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [autoStart, htmlContent]);

    // Handle Ctrl+S to show save notification instead of browser save dialog
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                // Project is already auto-saved, just show notification
                notify.success("Project auto-saved to browser storage");
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [notify]);

    // Listen for messages from the preview iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'scratch-recompile') {
                // Set autoStart so the new iframe will auto-run
                setAutoStart(true);
                // Trigger recompile using ref to get latest function
                handleRunRef.current();
            } else if (event.data && event.data.type === 'scratch-fullscreen') {
                setIsFullscreen(event.data.enabled);
                // Try to use browser fullscreen API
                if (event.data.enabled) {
                    document.documentElement.requestFullscreen?.().catch(() => {});
                } else {
                    document.exitFullscreen?.().catch(() => {});
                }
            }
        };

        // Listen for exiting fullscreen via ESC key
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        window.addEventListener('message', handleMessage);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            window.removeEventListener('message', handleMessage);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [isFullscreen]); // Include isFullscreen to get latest value

    // Setup Monaco language and theme before mount
    const handleEditorWillMount = (monacoRef: monacoType) => {
        // Register language
        monacoRef.languages.register({ id: "scratchSyntax" });
        monacoRef.languages.setMonarchTokensProvider("scratchSyntax", languageDef);
        monacoRef.languages.registerCompletionItemProvider("scratchSyntax", languageSelector(monacoRef));
        
        // Register the custom Scratch theme with official colors
        registerScratchTheme(monacoRef);
    };

    // Setup Monaco language (backup for when monacoInstance becomes available)
    useEffect(() => {
        if (monacoInstance) {
            // Re-register to ensure everything is set up
            monacoInstance.languages.register({ id: "scratchSyntax" });
            monacoInstance.languages.setMonarchTokensProvider("scratchSyntax", languageDef);
            monacoInstance.languages.registerCompletionItemProvider("scratchSyntax", languageSelector(monacoInstance));
            monacoInstance.languages.register({ id: "javascript" });
            monacoInstance.languages.register({ id: "html" });
            // Register the custom Scratch theme with official colors
            registerScratchTheme(monacoInstance);
        }
    }, [monacoInstance]);

    // Focus name input when editing starts
    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    // Get active sprite
    const activeSprite = project?.sprites.find((s) => s.id === project.activeSprite);
    const currentCode = activeSprite?.code || DEFAULT_SPRITE_CODE;

    // Handle editor mount
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoRef: monacoType) => {
        editorRef.current = editor;
        if (monacoInstance) {
            monacoRef.editor.setModelLanguage(editor.getModel()!, "scratchSyntax");
        }
    };

    // Insert code from toolbox into editor with smart indentation
    const insertToolboxCommand = useCallback((command: ToolboxCommand) => {
        const editor = editorRef.current;
        if (!editor) return;

        const position = editor.getPosition();
        if (!position) return;

        const model = editor.getModel();
        if (!model) return;

        // Get the current line content to check indentation
        const currentLineContent = model.getLineContent(position.lineNumber);
        const currentIndent = currentLineContent.match(/^(\s*)/)?.[1] || "";
        
        // Prepare the code to insert
        let codeToInsert = command.code;
        
        // If the command needs indent (like when/repeat/forever), add newline with indent
        if (command.needsIndent) {
            codeToInsert = command.code + "\n" + currentIndent + "    ";
        }
        
        // If we're inserting at the beginning of an empty line, use current indent
        const isEmptyLine = currentLineContent.trim() === "";
        
        // Build the full text to insert
        let fullInsert = "";
        if (isEmptyLine) {
            // Replace the line entirely
            fullInsert = currentIndent + codeToInsert;
        } else {
            // Insert at cursor with newline
            fullInsert = "\n" + currentIndent + codeToInsert;
        }
        
        // Calculate the range to replace
        const range = isEmptyLine
            ? {
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: currentLineContent.length + 1,
            }
            : {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
            };

        // Execute the edit
        editor.executeEdits("toolbox-insert", [
            {
                range: range,
                text: fullInsert,
                forceMoveMarkers: true,
            },
        ]);

        // Move cursor to end of inserted code
        const newLines = fullInsert.split("\n");
        const lastLineLength = newLines[newLines.length - 1].length;
        const newPosition = {
            lineNumber: position.lineNumber + newLines.length - (isEmptyLine ? 1 : 0),
            column: lastLineLength + 1,
        };
        editor.setPosition(newPosition);
        editor.focus();
    }, []);

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
        const newSprite = createSprite(generateSpriteName(project.sprites), "sprite", true);
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

    // New project handler
    const handleNewProject = (newProject: ScratchProject) => {
        setProject(newProject);
        setCompiled(false);
        setCompiledJsCode(null);
        setHtmlContent(null);
        setErrorMessage(null);
    };

    // Project name change handler
    const handleProjectNameChange = (newName: string) => {
        setProject((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                name: newName,
                updatedAt: Date.now(),
            };
        });
    };

    // Start editing project name
    const startEditingName = () => {
        if (project) {
            setEditingName(project.name);
            setIsEditingName(true);
        }
    };

    // Finish editing project name
    const finishEditingName = () => {
        if (editingName.trim()) {
            handleProjectNameChange(editingName.trim());
        }
        setIsEditingName(false);
    };

    // Handle name input key press
    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            finishEditingName();
        } else if (e.key === 'Escape') {
            setIsEditingName(false);
        }
    };

    // Handle first load name confirmation
    const handleFirstLoadNameConfirm = (name: string) => {
        handleProjectNameChange(name);
        setShowFirstLoadNameModal(false);
        setIsFirstLoad(false);
        notify.info(`Welcome to "${name}"!`);
    };

    // Handle first load name cancel (use default)
    const handleFirstLoadNameCancel = () => {
        setShowFirstLoadNameModal(false);
        setIsFirstLoad(false);
    };

    // Notification handler for ProjectToolbar
    const handleNotify = (message: string, type: "success" | "error" | "info" | "warning") => {
        switch (type) {
            case "success":
                notify.success(message);
                break;
            case "error":
                notify.error(message);
                break;
            case "warning":
                notify.warning(message);
                break;
            default:
                notify.info(message);
        }
    };

    // Compile all sprites
    const handleCompile = async (): Promise<{ js: string; html: string }> => {
        if (!project) return { js: "", html: "" };

        setLoading(true);
        setCompiledJsCode(null);
        setErrorMessage(null);
        // Don't clear htmlContent here - keep showing old preview until new one is ready

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

    // Keep ref updated with latest handleRun function
    handleRunRef.current = handleRun;

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
            {/* Notifications */}
            <Notification 
                notifications={notifications} 
                onDismiss={dismissNotification}
                duration={3000}
            />

            {/* First Load Name Modal */}
            <ProjectNameModal
                isOpen={showFirstLoadNameModal && isFirstLoad}
                title="Welcome to CatScript Playground!"
                message="Enter a name for your project:"
                defaultValue="My Project"
                onConfirm={handleFirstLoadNameConfirm}
                onCancel={handleFirstLoadNameCancel}
            />

            {/* Header */}
            <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img 
                            src="/logo.png" 
                            alt="CatScript" 
                            className="h-9 w-auto"
                        />
                        <div className="flex flex-col justify-center">
                            <h1 className="text-white font-bold text-lg leading-tight">CatScript Playground</h1>
                            <span className="text-gray-500 text-[10px] leading-tight">Program in Scratch like a pro</span>
                        </div>
                    </div>
                    <span className="text-gray-400 text-sm">|</span>
                    
                    {/* Editable Project Name */}
                    {isEditingName ? (
                        <input
                            ref={nameInputRef}
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={finishEditingName}
                            onKeyDown={handleNameKeyDown}
                            className="bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                            style={{ minWidth: '120px' }}
                        />
                    ) : (
                        <Tooltip content="Click to rename project">
                            <button
                                onClick={startEditingName}
                                className="text-gray-300 text-sm hover:text-white hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                            >
                                {project.name}
                            </button>
                        </Tooltip>
                    )}
                    
                    {/* GitHub Logo Link */}
                    <Tooltip content="View on GitHub">
                        <a
                            href="https://github.com/pcwu2022/scratch_compiler"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                            style={{ lineHeight: 0 }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22" height="22"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                                style={{ minWidth: 18, minHeight: 18, maxWidth: 22, maxHeight: 22 }}
                            >
                                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                            </svg>
                        </a>
                    </Tooltip>
                </div>
                <div className="flex items-center gap-3">
                    <ProjectToolbar
                        project={project}
                        onImportProject={handleImportProject}
                        onImportSprite={handleImportSprite}
                        onNewProject={handleNewProject}
                        onProjectNameChange={handleProjectNameChange}
                        onNotify={handleNotify}
                    />
                    <Tooltip content={showCode ? "Hide generated JavaScript" : "Show generated JavaScript"}>
                        <button
                            onClick={() => compiled ? setShowCode(!showCode) : (() => {})()}
                            className={`px-4 py-1.5 rounded font-medium text-sm transition-colors ${
                                showCode
                                ? "bg-purple-800 text-white"
                                : "bg-purple-900 hover:bg-purple-800 text-white"
                            }`}
                        >
                            {showCode ? "Hide Output" : "Show Output"}
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left sidebar - Toolbox with color-coded categories */}
                {showToolbox && (
                    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col overflow-hidden">
                        {/* Toolbox scrollbar styles */}
                        <style>{`
                            .toolbox-scroll::-webkit-scrollbar {
                                width: 6px;
                            }
                            .toolbox-scroll::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .toolbox-scroll::-webkit-scrollbar-thumb {
                                background: #4b5563;
                                border-radius: 3px;
                            }
                            .toolbox-scroll::-webkit-scrollbar-thumb:hover {
                                background: #6b7280;
                            }
                            .toolbox-scroll {
                                scrollbar-width: thin;
                                scrollbar-color: #4b5563 transparent;
                            }
                        `}</style>
                        <div className="bg-gray-800 px-3 py-2 text-gray-300 text-sm border-b border-gray-700 font-medium flex items-center justify-between">
                            <span>Toolbox</span>
                            <button
                                onClick={() => setShowToolbox(false)}
                                className="text-gray-500 hover:text-gray-300 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="toolbox-scroll flex-1 overflow-y-auto">
                            {toolboxCategories.map((category) => (
                                <div key={category.name} className="border-b border-gray-800">
                                    {/* Category Header */}
                                    <button
                                        onClick={() => setExpandedCategory(
                                            expandedCategory === category.name ? null : category.name
                                        )}
                                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-800 transition-colors"
                                        style={{ borderLeft: `4px solid ${category.color}` }}
                                    >
                                        <span className="text-sm font-medium" style={{ color: category.color }}>
                                            {category.name}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            {expandedCategory === category.name ? "▼" : "▶"}
                                        </span>
                                    </button>
                                    
                                    {/* Category Commands */}
                                    {expandedCategory === category.name && (
                                        <div className="bg-gray-850 py-1">
                                            {category.commands.map((command, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => insertToolboxCommand(command)}
                                                    className="w-full px-4 py-1.5 text-left text-xs hover:bg-gray-700 transition-colors flex items-center gap-2 group"
                                                    title={command.description}
                                                >
                                                    <span
                                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className="text-gray-300 group-hover:text-white truncate">
                                                        {command.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
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
                        showToolbox={showToolbox}
                        onToggleToolbox={() => setShowToolbox(!showToolbox)}
                    />
                    
                    {/* Editor Label */}
                    <div className="bg-gray-800 px-3 py-2 text-gray-400 text-sm border-b border-gray-700">
                        <span>📝 {activeSprite?.name || "Scratch Code"}</span>
                    </div>
                    
                    {/* Monaco Editor */}
                    <div className="flex-1">
                        <Editor
                            width="100%"
                            height="100%"
                            language="scratchSyntax"
                            theme="scratch-dark"
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
                            beforeMount={handleEditorWillMount}
                            onMount={handleEditorDidMount}
                        />
                    </div>
                </div>

                {/* Preview Panel */}
                {showPreview && !isFullscreen && (
                    <div className="w-1/2 flex flex-col border-l border-gray-700">
                        <div className="bg-gray-800 px-3 py-2 flex justify-between items-center border-b border-gray-700">
                            <span className="text-gray-400 text-sm">🎮 Preview</span>
                        </div>
                        <div className="flex-1 bg-gray-100">
                            {htmlContent && (
                                <iframe
                                    ref={previewIframeRef}
                                    srcDoc={htmlContent.replace('__IS_FULLSCREEN__', 'false')}
                                    className="w-full h-full border-0"
                                    title="Preview"
                                    sandbox="allow-scripts"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Fullscreen Preview Overlay */}
            {isFullscreen && htmlContent && (
                <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center">
                    <div className="w-full h-full max-w-[calc(100vh*4/3)] max-h-[calc(100vw*3/4)]">
                        <iframe
                            ref={previewIframeRef}
                            srcDoc={htmlContent.replace('__IS_FULLSCREEN__', 'true')}
                            className="w-full h-full border-0"
                            title="Preview Fullscreen"
                            sandbox="allow-scripts"
                        />
                    </div>
                </div>
            )}

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
                            theme="scratch-dark"
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
