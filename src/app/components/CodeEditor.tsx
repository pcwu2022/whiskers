"use client";

import React, { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { initialCode, languageDef, languageSelector } from "@/lib/codeEditorConfig";

type monacoType = typeof monaco;

export default function CodeEditor() {
    const [code, setCode] = useState<string>(initialCode);
    const [compiledJsCode, setCompiledJsCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [compiled, setCompiled] = useState(false);
    const [running, setRunning] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showCode, setShowCode] = useState(false);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoInstance = useMonaco();

    useEffect(() => {
        const storedCode = localStorage.getItem("scratchCode");
        setCode(
            !storedCode
                ? initialCode
                : storedCode?.replaceAll("\n", "").replaceAll(" ", "") === ""
                  ? initialCode
                  : storedCode
        );
    }, []);

    useEffect(() => {
        if (monacoInstance) {
            monacoInstance.languages.register({ id: "scratchSyntax" });
            monacoInstance.languages.setMonarchTokensProvider("scratchSyntax", languageDef);
            monacoInstance.languages.registerCompletionItemProvider("scratchSyntax", languageSelector(monacoInstance));
            monacoInstance.languages.register({ id: "javascript" });
            monacoInstance.languages.register({ id: "html" });
        }
    }, [monacoInstance]);

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: monacoType) => {
        editorRef.current = editor;
        if (monacoInstance) {
            monaco.editor.setModelLanguage(editor.getModel()!, "scratchSyntax");
        }
    };

    const saveCode = () => {
        localStorage.setItem("scratchCode", code);
    };

    const handleCompile = async (): Promise<{js: string, html: string}> => {
        saveCode();
        setLoading(true);
        setCompiledJsCode(null);
        setErrorMessage(null);
        setHtmlContent(null);

        let retValue = {js: "", html: ""};

        try {
            const response = await fetch("/api/compile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
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
        saveCode();
        setRunning(true);
        setErrorMessage(null);
        
        // Always recompile to ensure fresh code
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

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
                <h1 className="text-white font-bold text-lg">🐱 Scratch Compiler</h1>
                <div className="flex gap-2">
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
                {/* Code Editor Panel */}
                <div className={`flex flex-col ${showPreview ? 'w-1/2' : 'flex-1'} transition-all`}>
                    <div className="bg-gray-800 px-3 py-2 text-gray-400 text-sm border-b border-gray-700">
                        📝 Scratch Code
                    </div>
                    <div className="flex-1">
                        <Editor
                            width="100%"
                            height="100%"
                            language="scratchSyntax"
                            theme="vs-dark"
                            value={code}
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
                            onChange={(value) => {
                                setCompiled(false);
                                saveCode();
                                setCode(value || "");
                            }}
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
