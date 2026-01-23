// Text-Based Scratch Compiler to JavaScript
// This compiler transforms Scratch-like syntax into executable JavaScript.
// It orchestrates the process of lexical analysis, parsing, and code generation.

import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { CodeGenerator } from "./generator";
import Debugger from "./debugger";

// Main compiler class
export class ScratchTextCompiler {
    public debugger: Debugger;

    constructor() {
        this.debugger = new Debugger({
            enabled: true,
            logLevels: ["info", "warn", "error"],
            saveToFile: true,
            filePath: "src/debug/compilerOutput.json",
        });
    }

    /**
     * Main method that takes Scratch-like text code as input and returns JavaScript code.
     */
    compile(code: string): { js: string; html: string; error?: string } {
        try {
            // Step 1: Tokenize the input using the Lexer
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            this.debugger.log("info", "Lexer output (tokens) ", tokens);

            // Step 2: Parse tokens into an Abstract Syntax Tree (AST)
            const parser = new Parser(tokens);
            const program = parser.parse();
            this.debugger.log("info", "Parser output (program) ", program);

            // Step 3: Generate JavaScript code from the AST
            const generator = new CodeGenerator(program);
            const jsCode = generator.generate();
            this.debugger.log("info", "Generator output (jsCode) ", jsCode);

            return jsCode;
        } catch (error) {
            console.error("Compilation error:", error);
            return {
                js: "",
                html: "",
                error: `// Compilation error: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
}

/**
 * Asynchronous function that wraps the compiler and handles potential errors.
 */
export async function compile(code: string): Promise<{ js: string; html: string } | { error: string }> {
    try {
        const compiler = new ScratchTextCompiler();
        const { js, html } = compiler.compile(code);
        return { js, html };
    } catch (error) {
        console.error("Error in compile function:", error);
        return { error: "Compilation failed in compiler function." };
    }
}

// Re-export modules for convenience
export { Lexer } from "./lexer";
export { Parser } from "./parser";
export { CodeGenerator } from "./generator";
