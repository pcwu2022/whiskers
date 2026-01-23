// Text-Based Scratch Compiler to JavaScript
// This compiler transforms Scratch-like syntax into executable JavaScript.
// It orchestrates the process of lexical analysis, parsing, and code generation.

import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { CodeGenerator, MultiSpriteCodeGenerator } from "./codeGenerator";
import Debugger from "./debugger";

// Sprite input for multi-sprite compilation
interface SpriteInput {
    name: string;
    code: string;
    isStage?: boolean;
}

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
    // compile: Main method that takes Scratch-like text code as input and returns JavaScript code.
    compile(code: string): { js: string; html: string; error?: string } {
        try {
            // Step 1: Tokenize the input using the Lexer.
            // The Lexer converts the raw text input into an array of tokens,
            // which are the basic building blocks of the programming language.
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();

            this.debugger.log("info", "Lexer output (tokens) ", tokens);

            // Step 2: Parse tokens into an Abstract Syntax Tree (AST) using the Parser.
            // The Parser takes the tokens and constructs an AST, which represents the
            // structure of the program in a hierarchical format.
            const parser = new Parser(tokens);
            const program = parser.parse();

            this.debugger.log("info", "Parser output (program) ", program);

            // Step 3: Generate JavaScript code from the AST using the CodeGenerator.
            // The CodeGenerator traverses the AST and produces JavaScript code that
            // corresponds to the original Scratch-like input.
            const generator = new CodeGenerator(program);
            const jsCode = generator.generate();

            this.debugger.log("info", "Generator output (jsCode) ", jsCode);

            // Return the generated JavaScript code.
            return jsCode;
        } catch (error) {
            // Handle any errors that occur during compilation.
            console.error("Compilation error:", error);
            // Return an error message as a comment in the JavaScript output.
            return {
                js: "",
                html: "",
                error: `// Compilation error: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    // compileMultiSprite: Compile multiple sprites into a single program
    compileMultiSprite(sprites: SpriteInput[]): { js: string; html: string; error?: string } {
        try {
            const parsedSprites: { name: string; program: ReturnType<Parser["parse"]>; isStage?: boolean }[] = [];

            // Parse each sprite's code
            for (const sprite of sprites) {
                const lexer = new Lexer(sprite.code);
                const tokens = lexer.tokenize();
                const parser = new Parser(tokens);
                const program = parser.parse();

                this.debugger.log("info", `Parsed sprite: ${sprite.name}`, program);

                parsedSprites.push({
                    name: sprite.name,
                    program,
                    isStage: sprite.isStage,
                });
            }

            // Generate combined JavaScript code
            const generator = new MultiSpriteCodeGenerator(parsedSprites);
            const jsCode = generator.generate();

            this.debugger.log("info", "Multi-sprite generator output", jsCode);

            return jsCode;
        } catch (error) {
            console.error("Multi-sprite compilation error:", error);
            return {
                js: "",
                html: "",
                error: `// Compilation error: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
}

// compile: Asynchronous function that wraps the compiler and handles potential errors.
// This function is designed to be used in an asynchronous context, such as in a web environment.
export async function compile(code: string): Promise<{ js: string; html: string } | { error: string }> {
    try {
        // Create an instance of the ScratchTextCompiler.
        const compiler = new ScratchTextCompiler();
        // Call the compile method to generate JavaScript code.
        const { js, html } = compiler.compile(code);
        // Return the generated code in a result object.
        return { js: js, html: html };
    } catch (error) {
        // Handle any errors that occur during the compilation process.
        console.error("Error in compile function:", error);
        // Return an error object indicating compilation failure.
        return { error: "Compilation failed in compiler function." };
    }
}

// compileMultiSprite: Compile multiple sprites
export async function compileMultiSprite(sprites: SpriteInput[]): Promise<{ js: string; html: string } | { error: string }> {
    try {
        const compiler = new ScratchTextCompiler();
        const { js, html } = compiler.compileMultiSprite(sprites);
        return { js, html };
    } catch (error) {
        console.error("Error in compileMultiSprite function:", error);
        return { error: "Multi-sprite compilation failed." };
    }
}
