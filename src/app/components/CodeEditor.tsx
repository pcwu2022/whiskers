"use client";

import React, { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { initialCode, languageDef, languageSelector } from "@/lib/codeEditorConfig";
// import { data } from "autoprefixer";

type monacoType = typeof monaco;

export default function CodeEditor() {
    const [code, setCode] = useState<string>(initialCode);
    const [compiledJsCode, setCompiledJsCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [compiled, setCompiled] = useState(false);
    const [running, setRunning] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState("");
    const [compiledResult, setCompiledResult] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [showHtml, setShowHtml] = useState(false);

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

    // Listen for messages from the preview iframe/new window
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (!e || !e.data) return;
            if (e.data && e.data.type === 'scratch-log') {
                setTerminalOutput((prev) => (prev ? prev + '\n' + e.data.message : e.data.message));
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    useEffect(() => {
        if (monacoInstance) {
            monacoInstance.languages.register({ id: "scratchSyntax" });
            monacoInstance.languages.setMonarchTokensProvider("scratchSyntax", languageDef);
            monacoInstance.languages.registerCompletionItemProvider("scratchSyntax", languageSelector(monacoInstance));

            // Register javascript for output highlighting
            monacoInstance.languages.register({ id: "javascript" });

            // Register HTML for preview
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

    const runResult = async (jsCode: string) => {
        // Use Function constructor to avoid embedding arbitrary code inside a template literal
        const terminalPre = document.getElementById("terminal");
        if (terminalPre) terminalPre.innerHTML = "";

        const outputs: any[] = [];
        const saveOutput = (...output: any[]) => {
            for (let el of output) {
                if (terminalPre) terminalPre.innerHTML += el + "\n";
            }
            outputs.push(...output);
        };

        // Replace console.log with saveOutput for capturing prints
        const safeCode = jsCode.replaceAll("console.log(", "saveOutput(");

        try {
            const body = 'return (async () => { ' + safeCode + ' })()';
            const runner = new Function('saveOutput', body);
            await runner(saveOutput);
        } catch (err) {
            console.error(err);
        }

        const returnOutputs = outputs.map((o) => (typeof o === "string" ? o : JSON.stringify(o)));
        setTerminalOutput(returnOutputs.join("\n"));
    };

    const handleCompile = async (): Promise<{js: string, html: string}> => {
        saveCode();
        setLoading(true);
        setCompiledJsCode(null);
        setTerminalOutput("");
        setCompiledResult(null);
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
            setCompiledResult(data.js || null);
            setHtmlContent(data.html || null);
            console.log(data.js);
            console.log(data.html);
            retValue = data;
        } catch (error) {
            console.error("Error compiling:", error);
            setCompiledJsCode("Compilation failed.");
            setTerminalOutput(String(error));
        } finally {
            setLoading(false);
            setCompiled(true);
        }

        return retValue;
    };

    const runInNewPage = (html: string) => {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, "/running.html");
        // if (newWindow) {
        //     newWindow.document.open();
        //     newWindow.document.write(html);
        //     newWindow.document.close();
        // } else {
        //     window.alert("Please allow new window to be opened.");
        // }
    }

    const handleRun = async () => {
        saveCode();
        setRunning(true);
        let code = {js: compiledJsCode, html: htmlContent};
        if (!compiled) {
            code = await handleCompile();
        }
        if (!code || !code.js || !code.html) {
            setRunning(false);
            return;
        }
        setShowHtml(true);
        setTerminalOutput("");
        runInNewPage(code.html);
        setRunning(false);
    };

    return (
        <div className="Body-Main h-screen relative">
            <div className="Body-Header bg-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-white font-bold">Scratch Compiler</h1>
                <div>
                    <span className="ml-4"></span>
                    <button
                        onClick={handleRun}
                        disabled={running}
                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                            running ? "cursor-not-allowed" : ""
                        }`}
                    >
                        {running ? "Running..." : compiled ? "▶ Run" : "▶ Compile and Run"}
                    </button>
                    <span className="ml-4"></span>
                    <button
                        onClick={handleCompile}
                        disabled={loading}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? "⚙ Compiling..." : "⚙ Compile"}
                    </button>
                </div>
            </div>

            <div className="Body-Interface relative h-3/4">
                {/* Left panel - Code editor */}
                <div
                    className={`Code-Editor h-full ${showHtml && htmlContent ? "w-1/2 inline-block align-top " : "w-full "}`}
                >
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
                        }}
                        onChange={(value) => {
                            setCompiled(false);
                            saveCode();
                            setCode(value || "");
                        }}
                        onMount={handleEditorDidMount}
                    />
                </div>

                {/* Right panel - HTML Preview */}
                {showHtml && htmlContent && (
                    <div className="w-1/2 h-full inline-block align-top">
                        {/* <div className="bg-gray-800 p-4">
                            <h2 className="text-white font-bold">HTML Preview</h2>
                        </div> */}
                        <div className="w-full h-full">
                            <div className="w-full h-full bg-white overflow-auto">
                                <iframe
                                    srcDoc={htmlContent}
                                    className="w-full h-full border-0"
                                    title="HTML Preview"
                                    sandbox="allow-scripts"
                                />
                            </div>
                            {/* <div className="bg-gray-900 p-4">
                                <h2 className="text-white font-bold">HTML Source</h2>
                                <div className="border p-2 rounded">
                                    <Editor
                                        width="100%"
                                        height="300px"
                                        language="html"
                                        theme="vs-dark"
                                        value={htmlContent}
                                        options={{
                                            readOnly: true,
                                            automaticLayout: true,
                                        }}
                                    />
                                </div>
                            </div> */}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-800 p-4 max-h-1/4 overflow-auto">
                <h2 className="text-white font-bold">Terminal Output</h2>
                <pre id="terminal" className="text-gray-300 whitespace-pre-wrap">
                    {terminalOutput}
                </pre>
            </div>
            {compiledResult && (
                <div className="bg-gray-900 p-4">
                    <h2 className="text-white font-bold">Result</h2>
                    <div className="border p-2 rounded">
                        <Editor
                            width="100%"
                            height="300px"
                            language="javascript" // Highlight as javascript
                            theme="vs-dark"
                            value={compiledResult}
                            options={{
                                readOnly: true,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
