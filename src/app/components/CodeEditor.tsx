"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import Link from "next/link";
import { languageDef, languageConfiguration, languageSelector, registerScratchTheme, toolboxCategories, ToolboxCategory, ToolboxCommand, BlockType } from "@/lib/codeEditorConfig";
import { useTranslation } from "@/i18n";
import { useTranslatedToolbox } from "@/lib/editor/useTranslatedToolbox";
import { createErrorTranslator } from "@/lib/editor/useTranslatedErrors";
import FileTabs from "./FileTabs";
import ProjectToolbar from "./ProjectToolbar";
import ProjectNameModal from "./ProjectNameModal";
import ResizeDivider from "./ResizeDivider";
import CostumeSidebar from "./CostumeSidebar";
import SoundSidebar from "./SoundSidebar";
import DraggableBlock from "./DraggableBlock";
import { DropZoneManager, DropZone } from "./DropZoneManager";
import { Notification, useNotifications, Tooltip } from "./ui";
import {
    ScratchProject,
    SpriteFile,
    Costume,
    Sound,
    createProject,
    createSprite,
    PROJECT_STORAGE_KEY,
    LEGACY_CODE_KEY,
    DEFAULT_SPRITE_CODE,
} from "@/types/projectTypes";
import { CompilerError } from "@/types/compilerTypes";
import {
    initDB,
    saveProject as saveProjectToDB,
    loadCurrentProject,
    migrateFromLocalStorage,
    isIndexedDBAvailable,
} from "@/lib/storage";
import { generateEmptyPreviewTemplate } from "@/templates";

type monacoType = typeof monaco;

// Sidebar type - only one can be open at a time
type SidebarType = "toolbox" | "costumes" | "sounds" | null;

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

// Helper to generate unique sprite names
function generateSpriteName(sprites: SpriteFile[]): string {
    const existingNames = new Set(sprites.map((s) => s.name));
    // Start from 2 since the first sprite is "Cat"
    let num = 2;
    while (existingNames.has(`Sprite${num}`)) {
        num++;
    }
    return `Sprite${num}`;
}

// Helper to sanitize compiled code for display - replaces long data URLs with filenames
function sanitizeCodeForDisplay(code: string): string {
    // Replace data URLs in costumeUrls arrays with just the filename comment
    // Pattern: "data:image/..." or "data:audio/..." strings
    return code.replace(
        /"data:(image|audio)\/[^"]+"/g,
        (match) => {
            // Try to extract original filename from data URL if embedded, otherwise use placeholder
            // Data URLs don't contain filenames, so just indicate it's an embedded asset
            const type = match.includes('image') ? 'image' : 'audio';
            return `"[embedded ${type}]"`;
        }
    );
}

// Helper to extract variable and list names from code
function extractVariablesFromCode(code: string): { variables: string[], lists: string[] } {
    const variables: string[] = [];
    const lists: string[] = [];
    
    // Match variable declarations: var myVar = value
    const varRegex = /^\s*var\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm;
    let match;
    while ((match = varRegex.exec(code)) !== null) {
        if (!variables.includes(match[1])) {
            variables.push(match[1]);
        }
    }
    
    // Match list declarations: list myList = []
    const listRegex = /^\s*list\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm;
    while ((match = listRegex.exec(code)) !== null) {
        if (!lists.includes(match[1])) {
            lists.push(match[1]);
        }
    }
    
    return { variables, lists };
}

// Helper to create enhanced toolbox categories with user-defined variables
function createEnhancedToolboxCategories(
    baseCategories: ToolboxCategory[],
    variables: string[],
    lists: string[]
): ToolboxCategory[] {
    // If no variables or lists, return base categories unchanged
    if (variables.length === 0 && lists.length === 0) {
        return baseCategories;
    }
    
    // Create a copy of the categories
    return baseCategories.map(category => {
        if (category.name !== "Variables") {
            return category;
        }
        
        // Create variable reporter blocks
        const variableBlocks: ToolboxCommand[] = variables.map(varName => ({
            label: varName,
            code: varName,
            description: `Variable: ${varName}`,
            blockType: "reporter" as BlockType,
        }));
        
        // Create list reporter blocks
        const listBlocks: ToolboxCommand[] = lists.map(listName => ({
            label: listName,
            code: listName,
            description: `List: ${listName}`,
            blockType: "reporter" as BlockType,
        }));
        
        // Add user-defined blocks after the declaration blocks but before list operations
        const baseCommands = category.commands;
        const declarationBlocks = baseCommands.slice(0, 5); // var, set, change, show, hide
        const listDeclarationBlocks = baseCommands.slice(5, 6); // list declaration
        const listOperationBlocks = baseCommands.slice(6); // add, delete, etc.
        
        return {
            ...category,
            commands: [
                ...declarationBlocks,
                ...variableBlocks,
                ...listDeclarationBlocks,
                ...listBlocks,
                ...listOperationBlocks,
            ],
        };
    });
}

// ProjectNameModal and ResizeDivider have been moved to their own files

export default function CodeEditor() {
    // i18n
    const { t } = useTranslation();
    const translatedToolboxCategories = useTranslatedToolbox();
    const errorTranslator = useMemo(() => createErrorTranslator(t), [t]);

    // Project state
    const [project, setProject] = useState<ScratchProject | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Compilation state
    const [compiledJsCode, setCompiledJsCode] = useState<string | null>(null);
    const [_loading, setLoading] = useState(false);
    const [compiled, setCompiled] = useState(false);
    const [_running, setRunning] = useState(false);
    const [compileCounter, setCompileCounter] = useState(0); // Force iframe refresh;
    const [isRunning, setIsRunning] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [compilerErrors, setCompilerErrors] = useState<CompilerError[]>([]);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(true);
    const [showCode, setShowCode] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const previewIframeRef = useRef<HTMLIFrameElement>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);

    // UI state for toolbox sidebar
    const [activeSidebar, setActiveSidebar] = useState<SidebarType>("toolbox"); // Default open on page load
    const [expandedCategory, setExpandedCategory] = useState<string | null>("Events"); // Default expanded
    
    // Resizable panel widths
    const [toolboxWidth, setToolboxWidth] = useState(256); // 16rem = 256px default
    const [previewWidth, setPreviewWidth] = useState(50); // percentage
    const [outputHeight, setOutputHeight] = useState(256); // 16rem = 256px default
    
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
    
    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);
    const [draggedCommand, setDraggedCommand] = useState<ToolboxCommand | null>(null);
    const [draggedBlockType, setDraggedBlockType] = useState<BlockType | null>(null);
    const [activeDropZone, setActiveDropZone] = useState<DropZone | null>(null);
    const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
    const dropZoneManagerRef = useRef<DropZoneManager | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const monacoInstance = useMonaco();

    // Load project from IndexedDB on mount (with localStorage fallback/migration)
    useEffect(() => {
        const loadProjectData = async () => {
            try {
                // Initialize IndexedDB
                if (isIndexedDBAvailable()) {
                    await initDB();
                    
                    // Try to load from IndexedDB first
                    let loadedProject = await loadCurrentProject();
                    
                    // If no project in IndexedDB, try to migrate from localStorage
                    if (!loadedProject) {
                        loadedProject = await migrateFromLocalStorage();
                    }
                    
                    if (loadedProject) {
                        // Migration: Ensure project has a backdrop/stage
                        const hasBackdrop = loadedProject.sprites.some(s => s.isStage || s.type === 'backdrop');
                        if (!hasBackdrop) {
                            const backdrop = createSprite('Stage', 'backdrop');
                            loadedProject.sprites.unshift(backdrop);
                        }
                        // Load default costumes for any sprites missing costume data
                        loadedProject = await loadDefaultCostumesForProject(loadedProject);
                        setProject(loadedProject);
                        setIsLoaded(true);
                        return;
                    }
                }
                
                // Fallback to localStorage if IndexedDB unavailable
                const savedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
                if (savedProject) {
                    let parsed = JSON.parse(savedProject) as ScratchProject;
                    
                    // Migration: Ensure project has a backdrop/stage
                    const hasBackdrop = parsed.sprites.some(s => s.isStage || s.type === 'backdrop');
                    if (!hasBackdrop) {
                        const backdrop = createSprite('Stage', 'backdrop');
                        parsed.sprites.unshift(backdrop);
                    }
                    // Load default costumes for any sprites missing costume data
                    parsed = await loadDefaultCostumesForProject(parsed);
                    
                    setProject(parsed);
                } else {
                    // Check for legacy code and migrate
                    const legacyCode = localStorage.getItem(LEGACY_CODE_KEY);
                    let newProject = createProject("My Project");
                    // Load default costume data for all sprites
                    newProject = await loadDefaultCostumesForProject(newProject);
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
                let newProject = createProject("My Project");
                // Load default costume data for all sprites
                newProject = await loadDefaultCostumesForProject(newProject);
                setProject(newProject);
                setIsFirstLoad(true);
                setShowFirstLoadNameModal(true);
            }
            setIsLoaded(true);
        };
        loadProjectData();
    }, []);

    // Save project to IndexedDB whenever it changes (with localStorage backup)
    useEffect(() => {
        if (project && isLoaded) {
            // Save to IndexedDB
            if (isIndexedDBAvailable()) {
                saveProjectToDB(project).catch(err => {
                    console.error("Failed to save to IndexedDB:", err);
                });
            }
            // Also save to localStorage as backup
            localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
        }
    }, [project, isLoaded]);

    // Compile once on initial load to show preview
    useEffect(() => {
        if (project && isLoaded && !compiled) {
            // Small delay to ensure everything is ready
            const timer = setTimeout(() => {
                handleRunRef.current();
            }, 100);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, compiled]); // Also re-run when compiled changes (e.g., new project)

    // Handle auto-start after recompile - use both timer and message for reliability
    const pendingAutoStartRef = useRef(false);
    const autoStartTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Send autostart message to iframe
    const sendAutoStart = useCallback(() => {
        if (pendingAutoStartRef.current && previewIframeRef.current?.contentWindow) {
            pendingAutoStartRef.current = false;
            if (autoStartTimerRef.current) {
                clearTimeout(autoStartTimerRef.current);
                autoStartTimerRef.current = null;
            }
            previewIframeRef.current.contentWindow.postMessage({ type: 'scratch-autostart' }, '*');
        }
    }, []);

    // Handle Ctrl+S to show save notification instead of browser save dialog
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                // Project is already auto-saved, just show notification
                notify.success(t.playground.notifications.projectAutoSaved);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [notify, t]);

    // Listen for messages from the preview iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Ignore messages that don't have data.type (like Grammarly, etc.)
            if (!event.data || !event.data.type) return;
            if (event.data.type === 'scratch-recompile') {
                // Set pending flag - autostart will be sent when iframe reports ready
                pendingAutoStartRef.current = true;
                // Clear any existing timer
                if (autoStartTimerRef.current) {
                    clearTimeout(autoStartTimerRef.current);
                    autoStartTimerRef.current = null;
                }
                // Trigger recompile using ref to get latest function
                handleRunRef.current();
            } else if (event.data.type === 'scratch-ready') {
                // Iframe is ready - send autostart immediately if pending
                sendAutoStart();
            } else if (event.data.type === 'scratch-running') {
                setIsRunning(event.data.running);
            } else if (event.data && event.data.type === 'scratch-fullscreen') {
                setIsFullscreen(event.data.enabled);
                // Try to use browser fullscreen API
                if (event.data.enabled) {
                    document.documentElement.requestFullscreen?.().catch(() => {});
                } else {
                    document.exitFullscreen?.().catch(() => {});
                }
            } else if (event.data && event.data.type === 'scratch-runtime-error') {
                // Runtime error occurred in the generated code
                // This is likely a bug in our compiler, show a friendly message
                console.error('Runtime error from preview:', event.data.message, event.data.details);
                notify.error(t.playground.notifications.runtimeError);
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
            if (autoStartTimerRef.current) {
                clearTimeout(autoStartTimerRef.current);
            }
        };
    }, [isFullscreen, sendAutoStart]); // Include isFullscreen to get latest value

    // Setup Monaco language and theme before mount
    const handleEditorWillMount = (monacoRef: monacoType) => {
        // Register language
        monacoRef.languages.register({ id: "scratchSyntax" });
        monacoRef.languages.setMonarchTokensProvider("scratchSyntax", languageDef);
        monacoRef.languages.setLanguageConfiguration("scratchSyntax", languageConfiguration);
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
            monacoInstance.languages.setLanguageConfiguration("scratchSyntax", languageConfiguration);
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
    
    // Extract variables from ALL sprites in the project and create enhanced toolbox
    const enhancedToolboxCategories = useMemo(() => {
        if (!project) return translatedToolboxCategories;
        
        // Collect variables and lists from all sprites
        const allVariables = new Set<string>();
        const allLists = new Set<string>();
        
        for (const sprite of project.sprites) {
            const { variables, lists } = extractVariablesFromCode(sprite.code);
            variables.forEach(v => allVariables.add(v));
            lists.forEach(l => allLists.add(l));
        }
        
        return createEnhancedToolboxCategories(
            translatedToolboxCategories,
            Array.from(allVariables),
            Array.from(allLists)
        );
    }, [project, translatedToolboxCategories]);

    // Handle editor mount
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoRef: monacoType) => {
        editorRef.current = editor;
        dropZoneManagerRef.current = new DropZoneManager(editor);
        if (monacoInstance) {
            monacoRef.editor.setModelLanguage(editor.getModel()!, "scratchSyntax");
        }
    };

    // Insert code from toolbox into editor with smart indentation
    // Note: This function is kept for potential keyboard shortcut integration
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        
        // Helper to indent all lines of multi-line code
        const indentAllLines = (text: string, baseIndent: string): string => {
            const lines = text.split("\n");
            return lines.map((line, index) => {
                if (index === 0) {
                    return baseIndent + line;
                } else {
                    return baseIndent + line;
                }
            }).join("\n");
        };
        
        // Prepare the code to insert (already has proper relative indentation in template)
        const codeToInsert = command.code;
        
        // If we're inserting at the beginning of an empty line, use current indent
        const isEmptyLine = currentLineContent.trim() === "";
        
        // Build the full text to insert with proper indentation on all lines
        let fullInsert = "";
        if (isEmptyLine) {
            // Replace the line entirely - indent all lines
            fullInsert = indentAllLines(codeToInsert, currentIndent);
        } else {
            // Insert at cursor with newline - indent all lines
            fullInsert = "\n" + indentAllLines(codeToInsert, currentIndent);
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

    // Drag and drop handlers for toolbox blocks
    const handleBlockDragStart = useCallback((command: ToolboxCommand, _rect: DOMRect) => {
        setIsDragging(true);
        setDraggedCommand(command);
        setDraggedBlockType(command.blockType || "statement");
        
        // Initialize drop zone manager if needed
        if (editorRef.current && !dropZoneManagerRef.current) {
            dropZoneManagerRef.current = new DropZoneManager(editorRef.current);
        }
    }, []);

    const handleBlockDragEnd = useCallback(() => {
        setIsDragging(false);
        setDraggedCommand(null);
        setDraggedBlockType(null);
        setActiveDropZone(null);
        setDragPosition(null);
    }, []);

    // Handle drag over the editor area
    const handleEditorDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";

        if (!dropZoneManagerRef.current || !draggedBlockType) return;

        const x = e.clientX;
        const y = e.clientY;
        setDragPosition({ x, y });

        // Find nearest valid drop zone
        const nearestZone = dropZoneManagerRef.current.findNearestDropZone(x, y, draggedBlockType);
        setActiveDropZone(nearestZone);
    }, [draggedBlockType]);

    // Handle drop on the editor
    const handleEditorDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        
        if (!dropZoneManagerRef.current || !activeDropZone || !draggedCommand) {
            handleBlockDragEnd();
            return;
        }

        // Insert the code at the drop zone
        dropZoneManagerRef.current.insertAtDropZone(
            activeDropZone,
            draggedCommand.code,
            draggedCommand.needsIndent
        );

        handleBlockDragEnd();
    }, [activeDropZone, draggedCommand, handleBlockDragEnd]);

    // Handle drag leave
    const handleEditorDragLeave = useCallback((e: React.DragEvent) => {
        // Only clear if actually leaving the editor container
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!editorContainerRef.current?.contains(relatedTarget)) {
            setActiveDropZone(null);
            setDragPosition(null);
        }
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
        // Don't auto-compile on code change - only compile on specific triggers
    }, [project]);

    // Sprite management functions
    const handleSelectSprite = (id: string) => {
        setProject((prev) => prev ? { ...prev, activeSprite: id } : prev);
    };

    const handleAddSprite = async () => {
        if (!project) return;
        const newSprite = createSprite(generateSpriteName(project.sprites), "sprite", true);
        // Load default costume data for the new sprite
        const costumeData = await loadDefaultCostumeData(false);
        if (costumeData && newSprite.costumes.length > 0) {
            newSprite.costumes[0].data = costumeData;
        }
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
            // Check for duplicate sprite names
            const isDuplicate = prev.sprites.some(
                (sprite) => sprite.id !== id && sprite.name.toLowerCase() === newName.toLowerCase()
            );
            if (isDuplicate) {
                alert(`A sprite named "${newName}" already exists. Please choose a different name.`);
                return prev;
            }
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
        // Copy costumes and sounds too
        newSprite.costumes = sprite.costumes.map(c => ({
            ...c,
            id: `costume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }));
        newSprite.sounds = sprite.sounds.map(s => ({
            ...s,
            id: `sound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }));

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

    // Costume management for active sprite
    const handleCostumesChange = useCallback((costumes: Costume[], currentCostume: number) => {
        setProject((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                updatedAt: Date.now(),
                sprites: prev.sprites.map((sprite) =>
                    sprite.id === prev.activeSprite
                        ? { ...sprite, costumes, currentCostume, updatedAt: Date.now() }
                        : sprite
                ),
            };
        });
    }, []);

    // Sound management for active sprite
    const handleSoundsChange = useCallback((sounds: Sound[]) => {
        setProject((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                updatedAt: Date.now(),
                sprites: prev.sprites.map((sprite) =>
                    sprite.id === prev.activeSprite
                        ? { ...sprite, sounds, updatedAt: Date.now() }
                        : sprite
                ),
            };
        });
    }, []);

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

    // Undo handler
    const handleUndo = useCallback(() => {
        if (editorRef.current) {
            editorRef.current.trigger('keyboard', 'undo', null);
            editorRef.current.focus();
        }
    }, []);

    // Redo handler
    const handleRedo = useCallback(() => {
        if (editorRef.current) {
            editorRef.current.trigger('keyboard', 'redo', null);
            editorRef.current.focus();
        }
    }, []);

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
        notify.info(t.playground.notifications.welcomeProject.replace('{name}', name));
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
    const handleCompile = async (): Promise<{ js: string; html: string; success: boolean }> => {
        if (!project) return { js: "", html: "", success: false };

        setLoading(true);
        setCompiledJsCode(null);
        setErrorMessage(null);
        setCompilerErrors([]);
        // Don't clear htmlContent here - keep showing old preview until new one is ready

        let retValue = { js: "", html: "", success: false };

        try {
            // Send all sprites to the compiler with costume/sound data for rendering
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
                        costumeNames: s.costumes.map(c => c.name),
                        costumeUrls: s.costumes.map(c => c.data),
                        currentCostume: s.currentCostume,
                        soundNames: s.sounds.map(snd => snd.name),
                        soundUrls: s.sounds.map(snd => snd.data),
                    })),
                }),
            });

            const data = await response.json();
            
            // Handle errors from compilation
            if (data.errors && data.errors.length > 0) {
                // Translate errors using current locale
                const translatedErrors = errorTranslator.translateErrors(data.errors);
                setCompilerErrors(translatedErrors);
                setShowErrors(true);
                
                // Also update Monaco editor with error markers (use translated errors)
                updateEditorMarkers(translatedErrors);
            }
            
            if (data.success) {
                // Use userCode for display (without runtime), sanitize to hide long data URLs
                const displayCode = sanitizeCodeForDisplay(data.userCode || data.js);
                setCompiledJsCode(displayCode);
                setHtmlContent(data.html || null);
                setCompileCounter(c => c + 1); // Force iframe to remount
                retValue = { js: data.js, html: data.html, success: true };
            } else {
                // Compilation failed - show error message but still show preview with working green flag
                const errorCount = data.errors?.length || 0;
                const errorBarMessage = errorCount === 1 
                    ? t.playground.errorPanel.problemFound 
                    : t.playground.errorPanel.problemsFound.replace('{count}', String(errorCount));
                setErrorMessage(errorBarMessage);
                // Generate empty preview so user can still interact with the stage
                setHtmlContent(generateEmptyPreviewTemplate());
                retValue = { js: "", html: "", success: false };
            }
        } catch (error) {
            console.error("Error compiling:", error);
            setCompiledJsCode("Something went wrong!");
            setErrorMessage(t.playground.errorPanel.unexpectedError);
            // Generate empty preview so user can still interact with the stage
            setHtmlContent(generateEmptyPreviewTemplate());
        } finally {
            setLoading(false);
            setCompiled(true);
        }

        return retValue;
    };

    // Update Monaco editor markers based on compiler errors
    const updateEditorMarkers = useCallback((errors: CompilerError[]) => {
        if (!monacoInstance || !editorRef.current) return;
        
        const model = editorRef.current.getModel();
        if (!model) return;
        
        // Convert compiler errors to Monaco markers
        const markers: monaco.editor.IMarkerData[] = errors.map(err => ({
            severity: err.severity === "error" 
                ? monacoInstance.MarkerSeverity.Error 
                : err.severity === "warning"
                ? monacoInstance.MarkerSeverity.Warning
                : monacoInstance.MarkerSeverity.Info,
            message: err.message + (err.suggestion ? `\n💡 ${err.suggestion}` : ""),
            startLineNumber: err.line,
            startColumn: err.column,
            endLineNumber: err.endLine || err.line,
            endColumn: err.endColumn || err.column + 10,
            code: err.code,
        }));
        
        monacoInstance.editor.setModelMarkers(model, "scratch-compiler", markers);
    }, [monacoInstance]);

    // Clear markers when code changes
    useEffect(() => {
        if (monacoInstance && editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                monacoInstance.editor.setModelMarkers(model, "scratch-compiler", []);
            }
        }
    }, [currentCode, monacoInstance]);

    const handleRun = async () => {
        // Check if program is already running - prompt to stop first
        if (isRunning) {
            const shouldStop = window.confirm(
                "A program is already running.\n\nStop it and run the new code?"
            );
            if (!shouldStop) {
                return;
            }
            // Stop the running program
            if (previewIframeRef.current?.contentWindow) {
                previewIframeRef.current.contentWindow.postMessage({ type: 'scratch-stop' }, '*');
            }
            setIsRunning(false);
        }

        setRunning(true);
        setErrorMessage(null);

        // Check for event blocks in code before compiling (ignore stage, only check sprites)
        const spriteCode = project?.sprites.filter(s => !s.isStage).map(s => s.code).join('\n') || '';
        const hasEventBlocks = /when\s+(green\s+flag|.*key\s+pressed|this\s+sprite\s+clicked|I\s+receive|backdrop\s+switches|timer\s*>|I\s+start\s+as\s+a\s+clone)/i.test(spriteCode);
        
        if (!hasEventBlocks && spriteCode.trim()) {
            notify.warning(t.playground.notifications.noEventBlocks);
        }

        const result = await handleCompile();

        // Always show preview (even on errors - shows empty stage that can recompile)
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
                title="Welcome to Whiskers Playground!"
                message="Enter a name for your project:"
                defaultValue="My Project"
                onConfirm={handleFirstLoadNameConfirm}
                onCancel={handleFirstLoadNameCancel}
            />

            {/* Header */}
            <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img 
                            src="/ip/logo.png" 
                            alt="Whiskers" 
                            className="h-9 w-auto"
                        />
                        <div className="flex flex-col justify-center">
                            <h1 className="text-white font-bold text-lg leading-tight">Whiskers Playground</h1>
                            <span className="text-gray-500 text-[10px] leading-tight">Real programming starts here</span>
                        </div>
                    </Link>
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
                    {/* <Tooltip content="Contribute">
                        <a
                            href="https://github.com/pcwu2022/whiskers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22" height="22"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                            </svg>
                        </a>
                    </Tooltip> */}

                    {/* Undo/Redo Buttons */}
                    <div className="flex items-center gap-1">
                        <Tooltip content="Undo (Ctrl+Z)">
                            <button
                                onClick={handleUndo}
                                className="p-1.5 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                                aria-label="Undo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 7v6h6"/>
                                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                                </svg>
                            </button>
                        </Tooltip>
                        <Tooltip content="Redo (Ctrl+Y)">
                            <button
                                onClick={handleRedo}
                                className="p-1.5 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                                aria-label="Redo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 7v6h-6"/>
                                    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
                                </svg>
                            </button>
                        </Tooltip>
                    </div>
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
                    <Tooltip content={!compiled ? "Run code first to see output" : (showCode ? "Hide generated Code" : "Show generated Code")}>
                        <button
                            onClick={() => compiled && compiledJsCode ? setShowCode(!showCode) : undefined}
                            disabled={!compiled || !compiledJsCode}
                            className={`px-4 py-1.5 rounded font-medium text-sm transition-colors ${
                                !compiled || !compiledJsCode
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : showCode
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
            <div className="flex-1 flex overflow-hidden" ref={mainContentRef}>
                {/* Left sidebar - Tabbed panel for Toolbox, Costumes, Sounds */}
                {activeSidebar && (
                    <>
                        <div 
                            className="bg-gray-900 flex flex-col overflow-hidden flex-shrink-0"
                            style={{ width: `${toolboxWidth}px`, minWidth: "150px", maxWidth: "400px" }}
                        >
                            {/* Sidebar Tabs */}
                            <div className="flex border-b border-gray-700">
                                <Tooltip content={t.playground.sidebar.toolbox}>
                                    <button
                                        onClick={() => setActiveSidebar("toolbox")}
                                        className={`flex-1 px-2 py-2 text-sm font-medium transition-colors ${
                                            activeSidebar === "toolbox"
                                                ? "bg-gray-800 text-yellow-400 border-b-2 border-yellow-400"
                                                : "bg-gray-900 text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                                        }`}
                                    >
                                        📦 {t.playground.sidebar.toolbox}
                                    </button>
                                </Tooltip>
                                <Tooltip content={t.playground.sidebar.costumes}>
                                    <button
                                        onClick={() => setActiveSidebar("costumes")}
                                        className={`flex-1 px-2 py-2 text-sm font-medium transition-colors ${
                                            activeSidebar === "costumes"
                                                ? "bg-gray-800 text-purple-400 border-b-2 border-purple-400"
                                                : "bg-gray-900 text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                                        }`}
                                    >
                                        🎨 {t.playground.sidebar.costumes}
                                    </button>
                                </Tooltip>
                                <Tooltip content={t.playground.sidebar.sounds}>
                                    <button
                                        onClick={() => setActiveSidebar("sounds")}
                                        className={`flex-1 px-2 py-2 text-sm font-medium transition-colors ${
                                            activeSidebar === "sounds"
                                                ? "bg-gray-800 text-pink-400 border-b-2 border-pink-400"
                                                : "bg-gray-900 text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                                        }`}
                                    >
                                        🔊 {t.playground.sidebar.sounds}
                                    </button>
                                </Tooltip>
                            </div>

                            {/* Toolbox Content */}
                            {activeSidebar === "toolbox" && (
                                <>
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
                                    <div className="toolbox-scroll flex-1 overflow-y-auto">
                                        {enhancedToolboxCategories.map((category) => (
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
                                                    <div className="bg-gray-850 py-2 flex flex-col items-start overflow-x-auto">
                                                        {category.commands.map((command, idx) => (
                                                            <DraggableBlock
                                                                key={idx}
                                                                command={command}
                                                                categoryColor={category.color}
                                                                onDragStart={handleBlockDragStart}
                                                                onDragEnd={handleBlockDragEnd}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Costumes Content */}
                            {activeSidebar === "costumes" && activeSprite && (
                                <CostumeSidebar
                                    costumes={activeSprite.costumes}
                                    currentCostume={activeSprite.currentCostume}
                                    onCostumesChange={handleCostumesChange}
                                    onClose={() => setActiveSidebar(null)}
                                    width={toolboxWidth}
                                    spriteName={activeSprite.name}
                                    isStage={activeSprite.isStage}
                                />
                            )}

                            {/* Sounds Content */}
                            {activeSidebar === "sounds" && activeSprite && (
                                <SoundSidebar
                                    sounds={activeSprite.sounds}
                                    onSoundsChange={handleSoundsChange}
                                    onClose={() => setActiveSidebar(null)}
                                    width={toolboxWidth}
                                    spriteName={activeSprite.name}
                                />
                            )}
                        </div>
                        <ResizeDivider
                            orientation="vertical"
                            onResize={(delta) => {
                                setToolboxWidth(prev => {
                                    const newWidth = prev + delta;
                                    // Snap close if dragged below threshold
                                    if (newWidth < 100) {
                                        setActiveSidebar(null);
                                        return 256; // Reset to default for next open
                                    }
                                    return Math.max(150, Math.min(400, newWidth));
                                });
                            }}
                        />
                    </>
                )}

                {/* Code Editor Panel */}
                <div className="flex flex-col flex-1 min-w-0">
                    {/* File Tabs */}
                    <FileTabs
                        sprites={project.sprites}
                        activeSprite={project.activeSprite}
                        onSelectSprite={handleSelectSprite}
                        onAddSprite={handleAddSprite}
                        onRenameSprite={handleRenameSprite}
                        onDeleteSprite={handleDeleteSprite}
                        onDuplicateSprite={handleDuplicateSprite}
                        showToolbox={activeSidebar !== null}
                        onToggleToolbox={() => setActiveSidebar(activeSidebar ? null : "toolbox")}
                    />
                    
                    {/* Editor Label */}
                    <div className="bg-gray-800 px-3 py-2 text-gray-400 text-sm border-b border-gray-700">
                        <span>📝 {activeSprite?.name || "Scratch Code"}</span>
                        {isDragging && (
                            <span className="ml-2 text-yellow-400 text-xs animate-pulse">
                                ✨ Drop block here
                            </span>
                        )}
                    </div>
                    
                    {/* Monaco Editor with Drop Zone Overlay */}
                    <div 
                        ref={editorContainerRef}
                        className={`flex-1 relative ${isDragging ? "ring-2 ring-yellow-400 ring-inset" : ""}`}
                        onDragOver={handleEditorDragOver}
                        onDrop={handleEditorDrop}
                        onDragLeave={handleEditorDragLeave}
                    >
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
                                dropIntoEditor: { enabled: false }, // Disable Monaco's native drop to prevent $0 insertion
                            }}
                            onChange={(value) => updateCode(value || "")}
                            beforeMount={handleEditorWillMount}
                            onMount={handleEditorDidMount}
                        />
                        
                        {/* Drop Zone Indicator Overlay */}
                        {isDragging && activeDropZone && activeDropZone.rect && editorContainerRef.current && (
                            <div
                                className="absolute pointer-events-none z-50 transition-all duration-75"
                                style={{
                                    left: activeDropZone.rect.left - editorContainerRef.current.getBoundingClientRect().left,
                                    top: activeDropZone.rect.top - editorContainerRef.current.getBoundingClientRect().top,
                                    width: activeDropZone.rect.width,
                                    height: activeDropZone.rect.height,
                                }}
                            >
                                {/* Drop zone highlight line */}
                                <div 
                                    className={`absolute w-full h-1 rounded-full ${
                                        draggedBlockType === "reporter" || draggedBlockType === "boolean"
                                            ? "bg-green-400"
                                            : "bg-yellow-400"
                                    }`}
                                    style={{
                                        top: activeDropZone.type === "line-after" ? "100%" : "0",
                                        boxShadow: `0 0 8px ${draggedBlockType === "reporter" || draggedBlockType === "boolean" ? "#4ade80" : "#facc15"}`,
                                    }}
                                />
                                {/* Visual indicator dot */}
                                <div 
                                    className={`absolute w-3 h-3 rounded-full ${
                                        draggedBlockType === "reporter" || draggedBlockType === "boolean"
                                            ? "bg-green-400"
                                            : "bg-yellow-400"
                                    }`}
                                    style={{
                                        left: -6,
                                        top: activeDropZone.type === "line-after" ? "calc(100% - 6px)" : -6,
                                        boxShadow: `0 0 8px ${draggedBlockType === "reporter" || draggedBlockType === "boolean" ? "#4ade80" : "#facc15"}`,
                                    }}
                                />
                            </div>
                        )}
                        
                        {/* Drag overlay hint when dragging but no valid zone */}
                        {isDragging && !activeDropZone && (
                            <div className="absolute inset-0 bg-gray-900/30 pointer-events-none flex items-center justify-center">
                                <div className="bg-gray-800/90 px-4 py-2 rounded-lg text-gray-400 text-sm">
                                    Drag to a valid position
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Panel - Fixed width, not draggable */}
                {showPreview && !isFullscreen && (
                    <div className="w-1/3 flex flex-col border-l border-gray-700">
                        <div className="bg-gray-800 px-3 py-2 flex justify-between items-center border-b border-gray-700">
                            <span className="text-gray-400 text-sm">🎮 Preview</span>
                        </div>
                        <div className="flex-1 bg-gray-100">
                            {htmlContent ? (
                                <iframe
                                    key={`preview-${compileCounter}`}
                                    ref={previewIframeRef}
                                    srcDoc={htmlContent.replace('const IS_FULLSCREEN = false;', 'const IS_FULLSCREEN = false;')}
                                    className="w-full h-full border-0"
                                    title="Preview"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-white">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🚩</div>
                                        <div>Click the green flag to run</div>
                                    </div>
                                </div>
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
                            key={`preview-fullscreen-${compileCounter}`}
                            ref={previewIframeRef}
                            srcDoc={htmlContent.replace('const IS_FULLSCREEN = false;', 'const IS_FULLSCREEN = true;')}
                            className="w-full h-full border-0"
                            title="Preview Fullscreen"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                </div>
            )}

            {/* Error message bar */}
            {errorMessage && (
                <div className="bg-red-900 border-t border-red-700 px-4 py-2 flex justify-between items-center">
                    <span className="text-red-200 text-sm">⚠ {errorMessage}</span>
                    <div className="flex items-center gap-2">
                        {compilerErrors.length > 0 && (
                            <button
                                onClick={() => setShowErrors(!showErrors)}
                                className="text-red-300 hover:text-white text-sm underline"
                            >
                                {showErrors ? t.playground.errorPanel.hideDetails : t.playground.errorPanel.showDetails}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setErrorMessage(null);
                                setShowErrors(false);
                            }}
                            className="text-red-400 hover:text-red-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Detailed Error Panel */}
            {showErrors && compilerErrors.length > 0 && (
                <div className="max-h-48 border-t border-red-700 bg-gray-900 overflow-y-auto">
                    <div className="px-3 py-2 bg-red-900/50 border-b border-red-800 flex justify-between items-center sticky top-0">
                        <span className="text-red-300 text-sm font-medium">
                            🐛 {compilerErrors.length === 1 
                                ? t.playground.errorPanel.errorFound 
                                : t.playground.errorPanel.errorsFound.replace('{count}', String(compilerErrors.length))}
                        </span>
                        <button
                            onClick={() => setShowErrors(false)}
                            className="text-red-400 hover:text-white text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>
                    <div className="divide-y divide-gray-800">
                        {compilerErrors.map((err, idx) => (
                            <div 
                                key={idx}
                                className="px-4 py-3 hover:bg-gray-800/50 cursor-pointer transition-colors"
                                onClick={() => {
                                    // Jump to error location in editor
                                    if (editorRef.current) {
                                        editorRef.current.revealLineInCenter(err.line);
                                        editorRef.current.setPosition({ lineNumber: err.line, column: err.column });
                                        editorRef.current.focus();
                                    }
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <span className={`mt-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${
                                        err.severity === "error" 
                                            ? "bg-red-500/20 text-red-400" 
                                            : err.severity === "warning"
                                            ? "bg-yellow-500/20 text-yellow-400"
                                            : "bg-blue-500/20 text-blue-400"
                                    }`}>
                                        {err.code}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-200 text-sm">{err.message}</p>
                                        {err.suggestion && (
                                            <p className="text-green-400 text-xs mt-1">
                                                {err.suggestion}
                                            </p>
                                        )}
                                        <p className="text-gray-500 text-xs mt-1">
                                            {t.playground.errorPanel.lineColumn
                                                .replace('{line}', String(err.line))
                                                .replace('{column}', String(err.column))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Generated JS Code Panel (collapsible and resizable) */}
            {showCode && compiledJsCode && (
                <>
                    <ResizeDivider
                        orientation="horizontal"
                        onResize={(delta) => {
                            setOutputHeight(prev => {
                                const newHeight = prev - delta;
                                // Snap close if dragged below threshold
                                if (newHeight < 60) {
                                    setShowCode(false);
                                    return 256; // Reset to default for next open
                                }
                                return Math.max(100, Math.min(500, newHeight));
                            });
                        }}
                    />
                    <div 
                        className="border-t border-gray-700 flex flex-col flex-shrink-0"
                        style={{ height: `${outputHeight}px`, minHeight: "100px", maxHeight: "500px" }}
                    >
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
                </>
            )}
        </div>
    );
}
