// Text-Based Scratch Compiler to JavaScript
// This compiler transforms Scratch-like syntax into executable JavaScript.
// It orchestrates the process of lexical analysis, parsing, and code generation.

import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { MultiSpriteCodeGenerator } from "./codeGenerator";
import Debugger from "./debugger";
import { CompilerError } from "@/types/compilerTypes";
import { BlockNode, Program } from "@/types/blockTypes";
import { 
    validateTypes, 
    checkMissingCoordinateValue, 
    checkAssignmentInExpression,
    findClosestKeyword 
} from "./typeValidator";

// Sprite input for multi-sprite compilation
interface SpriteInput {
    name: string;
    code: string;
    isStage?: boolean;
    costumeNames?: string[];  // Available costume names for validation
    costumeUrls?: string[];   // Costume image URLs (data URLs)
    currentCostume?: number;  // Current costume index
    soundNames?: string[];    // Available sound names for validation
    soundUrls?: string[];     // Sound URLs (data URLs)
}

// Compilation result interface
interface CompilationResult {
    js: string;
    html: string;
    userCode: string;
    errors: CompilerError[];
    success: boolean;
}

// Multi-sprite compilation result
interface MultiSpriteCompilationResult extends CompilationResult {
    parsedSprites: unknown;
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

    // Validate costume and sound references in the AST
    private validateAssetReferences(
        spriteName: string,
        code: string,
        program: Program,
        costumeNames: string[],
        soundNames: string[]
    ): CompilerError[] {
        const errors: CompilerError[] = [];
        const costumeSet = new Set(costumeNames.map(n => n.toLowerCase()));
        const soundSet = new Set(soundNames.map(n => n.toLowerCase()));
        const codeLines = code.split('\n');

        // Helper to find line number for a string in code
        const findLineNumber = (searchText: string): number => {
            const lowerSearch = searchText.toLowerCase();
            for (let i = 0; i < codeLines.length; i++) {
                if (codeLines[i].toLowerCase().includes(lowerSearch)) {
                    return i + 1;
                }
            }
            return 1;
        };

        // Recursively check blocks for costume/sound references
        const checkBlock = (block: BlockNode) => {
            // Check for switch costume blocks
            if (block.name === "switchCostume" && block.args.length > 0) {
                const costumeName = String(block.args[0]).toLowerCase();
                // Check if it's a string (not a variable reference)
                if (typeof block.args[0] === 'string' && costumeNames.length > 0) {
                    if (!costumeSet.has(costumeName)) {
                        const lineNum = findLineNumber(`switch costume to "${block.args[0]}"`);
                        errors.push({
                            code: "W101",
                            message: `[${spriteName}] Oops! I can't find a costume named "${block.args[0]}"`,
                            line: lineNum,
                            column: 1,
                            severity: "warning",
                            suggestion: `💡 Check the spelling! Your costumes are: ${costumeNames.join(', ') || 'none'}. You can add new costumes in the Costumes tab on the left.`,
                        });
                    }
                }
            }

            // Check for play sound blocks
            if ((block.name === "playSound" || block.name === "playSoundUntilDone") && block.args.length > 0) {
                const soundName = String(block.args[0]).toLowerCase();
                // Check if it's a string (not a variable reference)
                if (typeof block.args[0] === 'string' && soundNames.length >= 0) {
                    if (!soundSet.has(soundName)) {
                        const lineNum = findLineNumber(`play sound "${block.args[0]}"`);
                        errors.push({
                            code: "W102",
                            message: `[${spriteName}] Oops! I can't find a sound named "${block.args[0]}"`,
                            line: lineNum,
                            column: 1,
                            severity: "warning",
                            suggestion: `💡 Check the spelling! Your sounds are: ${soundNames.length > 0 ? soundNames.join(', ') : 'none yet'}. You can add new sounds in the Sounds tab on the left.`,
                        });
                    }
                }
            }

            // Check nested blocks in body
            if (block.body) {
                block.body.forEach(checkBlock);
            }
            if (block.elseBody) {
                block.elseBody.forEach(checkBlock);
            }
            // Check nested blocks in next
            if (block.next) {
                checkBlock(block.next);
            }
        };

        // Check all scripts in the program
        for (const script of program.scripts) {
            for (const block of script.blocks) {
                checkBlock(block);
            }
        }

        return errors;
    }
    
    // Check for unfilled placeholder symbols in code
    private checkForPlaceholders(code: string, spriteName?: string): CompilerError[] {
        const errors: CompilerError[] = [];
        const lines = code.split('\n');
        const prefix = spriteName ? `[${spriteName}] ` : '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;
            
            // Check for reporter placeholder (⬤)
            let col = line.indexOf('⬤');
            if (col !== -1) {
                errors.push({
                    code: "E100",
                    message: `${prefix}There's an empty circle (⬤) that needs to be filled in!`,
                    line: lineNum,
                    column: col + 1,
                    severity: "error",
                    suggestion: "💡 The circle ⬤ is a blank space waiting for a value. Type a number, a word in quotes (like \"hello\"), or drag a round block here.",
                });
            }
            
            // Check for boolean placeholder (⯁)
            col = line.indexOf('⯁');
            if (col !== -1) {
                errors.push({
                    code: "E101",
                    message: `${prefix}There's an empty diamond (⯁) that needs to be filled in!`,
                    line: lineNum,
                    column: col + 1,
                    severity: "error",
                    suggestion: "💡 The diamond ⯁ is waiting for a yes/no question. Type something like 'x > 10' or drag a pointy (boolean) block here.",
                });
            }
            
            // Check for missing coordinate values (e.g., "go to x: y: 50")
            const missingValueError = checkMissingCoordinateValue(line, lineNum);
            if (missingValueError) {
                errors.push({
                    ...missingValueError,
                    message: prefix + missingValueError.message,
                });
            }
            
            // Check for assignment operator in expression (e.g., "set x to x = 5")
            const assignmentError = checkAssignmentInExpression(line, lineNum);
            if (assignmentError) {
                errors.push({
                    ...assignmentError,
                    message: prefix + assignmentError.message,
                });
            }
        }
        
        return errors;
    }
    
    // Extract procedure definitions from a program for validation
    private extractProcedureDefinitions(program: Program): Map<string, string[]> {
        const procedures = new Map<string, string[]>();
        
        const findProcedures = (block: BlockNode) => {
            if ((block.type === "procedure" || block.type === "custom") && block.name === "define") {
                const procName = String(block.args[0]);
                const params = block.args.slice(1).map((a) => String(a));
                procedures.set(procName, params);
            }
            if (block.body) {
                for (const child of block.body) {
                    findProcedures(child);
                }
            }
            if (block.next) {
                findProcedures(block.next);
            }
        };
        
        for (const script of program.scripts) {
            for (const block of script.blocks) {
                findProcedures(block);
            }
        }
        
        return procedures;
    }
    
    // Perform type validation on parsed program
    private performTypeValidation(
        code: string, 
        program: Program, 
        procedureDefinitions: Map<string, string[]>,
        spriteName?: string
    ): CompilerError[] {
        const prefix = spriteName ? `[${spriteName}] ` : '';
        const result = validateTypes(program, code, procedureDefinitions);
        
        // Add sprite prefix to all error messages
        return result.errors.map(err => ({
            ...err,
            message: prefix + err.message,
        }));
    }
    
    // List of motion block names that are not allowed on Stage
    private static MOTION_BLOCK_NAMES = [
        "move", "turn", "turnRight", "turnLeft", "go", "goto", "goTo", "goToXY",
        "goToRandom", "goToMouse", "goToSprite", "glide", "glideTo", "glideToXY",
        "point", "pointInDirection", "pointTowards", "setX", "setY", "changeX",
        "changeY", "ifOnEdgeBounce", "setRotationStyle"
    ];
    
    // Check for motion blocks used in Stage (not allowed)
    private validateStageNoMotionBlocks(spriteName: string, code: string, program: ReturnType<Parser["parse"]>): CompilerError[] {
        const errors: CompilerError[] = [];
        const lines = code.split('\n');
        
        const checkBlock = (block: BlockNode) => {
            // Check if this block is a motion block
            if (block.type === "motion" || ScratchTextCompiler.MOTION_BLOCK_NAMES.includes(block.name)) {
                // Find the line containing this block keyword
                const blockKeyword = block.name.toLowerCase();
                // Search for the block in the code
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].toLowerCase();
                    // Check for various motion block patterns
                    if (line.includes("move ") || 
                        line.includes("turn ") || 
                        line.includes("go to ") ||
                        line.includes("goto ") ||
                        line.includes("glide ") ||
                        line.includes("point ") ||
                        line.includes("set x ") ||
                        line.includes("set y ") ||
                        line.includes("change x ") ||
                        line.includes("change y ") ||
                        line.includes("if on edge") ||
                        line.includes("rotation style")) {
                        errors.push({
                            code: "E110",
                            message: `[${spriteName}] The Stage can't use motion blocks like 'move', 'turn', or 'go to'. Only sprites can move!`,
                            line: i + 1,
                            column: 1,
                            severity: "error",
                            suggestion: "💡 Motion blocks only work on sprites. If you want something to move, add a sprite and put the motion code there.",
                        });
                        break; // Only report once per block
                    }
                }
            }
            
            // Recursively check nested blocks
            if (block.body) {
                for (const child of block.body) {
                    checkBlock(child);
                }
            }
            if (block.elseBody) {
                for (const child of block.elseBody) {
                    checkBlock(child);
                }
            }
            if (block.next) {
                checkBlock(block.next);
            }
        };
        
        // Check all scripts
        for (const script of program.scripts) {
            for (const block of script.blocks) {
                checkBlock(block);
            }
        }
        
        return errors;
    }

    // compile: Main method that takes Scratch-like text code as input and returns JavaScript code.
    compile(code: string): CompilationResult {
        const allErrors: CompilerError[] = [];
        
        try {
            // Step 0: Check for unfilled placeholders
            const placeholderErrors = this.checkForPlaceholders(code);
            allErrors.push(...placeholderErrors);
            
            // If there are placeholder errors, stop early
            if (placeholderErrors.length > 0) {
                return {
                    js: "",
                    html: "",
                    userCode: "",
                    errors: allErrors,
                    success: false,
                };
            }
            
            // Step 1: Tokenize the input using the Lexer.
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            
            // Collect lexer errors
            allErrors.push(...lexer.getErrors());

            this.debugger.log("info", "Lexer output (tokens) ", tokens);

            // Step 2: Parse tokens into an Abstract Syntax Tree (AST) using the Parser.
            const parser = new Parser(tokens);
            const program = parser.parse();
            
            // Collect parser errors
            allErrors.push(...parser.getErrors());

            this.debugger.log("info", "Parser output (program) ", program);
            
            // Type validation (only if no errors so far, to avoid cascading)
            if (allErrors.length === 0) {
                const procedureDefinitions = this.extractProcedureDefinitions(program);
                const typeErrors = this.performTypeValidation(code, program, procedureDefinitions);
                allErrors.push(...typeErrors);
            }

            // If there are errors, don't generate code
            if (allErrors.some(e => e.severity === "error")) {
                return {
                    js: "",
                    html: "",
                    userCode: "",
                    errors: allErrors,
                    success: false,
                };
            }

            // Step 3: Generate JavaScript code using MultiSpriteCodeGenerator
            // Wrap single-sprite program in the expected format
            const parsedSprites = [{
                name: "Sprite1",
                isStage: false,
                program: program,
                costumeNames: [],
                costumeUrls: [],
                currentCostume: 0,
                soundNames: [],
                soundUrls: [],
            }];
            
            const generator = new MultiSpriteCodeGenerator(parsedSprites);
            const jsCode = generator.generate();

            this.debugger.log("info", "Generator output (jsCode) ", jsCode);

            // Return the generated JavaScript code.
            return {
                ...jsCode,
                errors: allErrors,
                success: true,
            };
        } catch (error) {
            // Handle any errors that occur during compilation.
            console.error("Compilation error:", error);
            allErrors.push({
                code: "E999",
                message: `Something went wrong: ${error instanceof Error ? error.message : String(error)}`,
                line: 1,
                column: 1,
                severity: "error",
                suggestion: "💡 This is an unexpected error. Try checking your code for typos or unusual characters.",
            });
            return {
                js: "",
                html: "",
                userCode: "",
                errors: allErrors,
                success: false,
            };
        }
    }

    // compileMultiSprite: Compile multiple sprites into a single program
    compileMultiSprite(sprites: SpriteInput[]): MultiSpriteCompilationResult {
        const allErrors: CompilerError[] = [];
        
        try {
            // Step 0: Check for unfilled placeholders in all sprites
            for (const sprite of sprites) {
                const placeholderErrors = this.checkForPlaceholders(sprite.code, sprite.name);
                allErrors.push(...placeholderErrors);
            }
            
            // If there are placeholder errors, stop early
            if (allErrors.length > 0) {
                return {
                    js: "",
                    html: "",
                    userCode: "",
                    errors: allErrors,
                    parsedSprites: [],
                    success: false,
                };
            }
            
            const parsedSprites: { 
                name: string; 
                program: ReturnType<Parser["parse"]>; 
                isStage?: boolean;
                costumeNames?: string[];
                costumeUrls?: string[];
                currentCostume?: number;
                soundNames?: string[];
                soundUrls?: string[];
            }[] = [];

            // Parse each sprite's code
            for (const sprite of sprites) {
                const lexer = new Lexer(sprite.code);
                const tokens = lexer.tokenize();
                
                // Collect lexer errors with sprite context
                lexer.getErrors().forEach(err => {
                    allErrors.push({
                        ...err,
                        message: `[${sprite.name}] ${err.message}`,
                    });
                });
                
                const parser = new Parser(tokens);
                const program = parser.parse();
                
                // Collect parser errors with sprite context
                parser.getErrors().forEach(err => {
                    allErrors.push({
                        ...err,
                        message: `[${sprite.name}] ${err.message}`,
                    });
                });

                // Validate costume and sound references if names are provided
                if (sprite.costumeNames || sprite.soundNames) {
                    const validationErrors = this.validateAssetReferences(
                        sprite.name,
                        sprite.code,
                        program,
                        sprite.costumeNames || [],
                        sprite.soundNames || []
                    );
                    allErrors.push(...validationErrors);
                }

                // Validate Stage doesn't use motion blocks
                if (sprite.isStage) {
                    const motionErrors = this.validateStageNoMotionBlocks(
                        sprite.name,
                        sprite.code,
                        program
                    );
                    allErrors.push(...motionErrors);
                }
                
                // Type validation for this sprite (only if no errors so far)
                if (!allErrors.some(e => e.severity === "error")) {
                    const procedureDefinitions = this.extractProcedureDefinitions(program);
                    const typeErrors = this.performTypeValidation(
                        sprite.code, 
                        program, 
                        procedureDefinitions, 
                        sprite.name
                    );
                    allErrors.push(...typeErrors);
                }

                this.debugger.log("info", `Parsed sprite: ${sprite.name}`, program);

                parsedSprites.push({
                    name: sprite.name,
                    program,
                    isStage: sprite.isStage,
                    costumeNames: sprite.costumeNames,
                    costumeUrls: sprite.costumeUrls,
                    currentCostume: sprite.currentCostume,
                    soundNames: sprite.soundNames,
                    soundUrls: sprite.soundUrls,
                });
            }

            // If there are errors, don't generate code
            if (allErrors.some(e => e.severity === "error")) {
                return {
                    js: "",
                    html: "",
                    userCode: "",
                    errors: allErrors,
                    parsedSprites: [],
                    success: false,
                };
            }

            // Generate combined JavaScript code
            const generator = new MultiSpriteCodeGenerator(parsedSprites);
            const jsCode = generator.generate();

            this.debugger.log("info", "Multi-sprite generator output", jsCode);

            return {
                ...jsCode,
                errors: allErrors,
                parsedSprites,
                success: true,
            };
        } catch (error) {
            console.error("Multi-sprite compilation error:", error);
            allErrors.push({
                code: "E999",
                message: `Something went wrong: ${error instanceof Error ? error.message : String(error)}`,
                line: 1,
                column: 1,
                severity: "error",
                suggestion: "💡 This is an unexpected error. Try checking your code for typos or unusual characters.",
            });
            return {
                js: "",
                html: "",
                userCode: "",
                errors: allErrors,
                parsedSprites: [],
                success: false,
            };
        }
    }
}

// compile: Asynchronous function that wraps the compiler and handles potential errors.
// This function is designed to be used in an asynchronous context, such as in a web environment.
export async function compile(code: string): Promise<CompilationResult> {
    try {
        // Create an instance of the ScratchTextCompiler.
        const compiler = new ScratchTextCompiler();
        // Call the compile method to generate JavaScript code.
        return compiler.compile(code);
    } catch (error) {
        // Handle any errors that occur during the compilation process.
        console.error("Error in compile function:", error);
        // Return an error object indicating compilation failure.
        return {
            js: "",
            html: "",
            userCode: "",
            errors: [{
                code: "E999",
                message: "Oops! Something went wrong while trying to run your code.",
                line: 1,
                column: 1,
                severity: "error",
                suggestion: "💡 This is an unexpected error. Try checking your code for typos, and make sure all blocks are complete.",
            }],
            success: false,
        };
    }
}

// compileMultiSprite: Compile multiple sprites
export async function compileMultiSprite(sprites: SpriteInput[], debug?: boolean): Promise<MultiSpriteCompilationResult> {
    try {
        const compiler = new ScratchTextCompiler();
        const result = compiler.compileMultiSprite(sprites);
        
        if (!debug) {
            // Remove parsedSprites from result if not debugging
            return { ...result, parsedSprites: undefined };
        }
        return result;
    } catch (error) {
        console.error("Error in compileMultiSprite function:", error);
        return {
            js: "",
            html: "",
            userCode: "",
            errors: [{
                code: "E999",
                message: "Oops! Something went wrong while trying to run your project.",
                line: 1,
                column: 1,
                severity: "error",
                suggestion: "💡 This is an unexpected error. Check all your sprites for typos and make sure all blocks are complete.",
            }],
            parsedSprites: [],
            success: false,
        };
    }
}

// Export types for consumers
export type { CompilationResult, MultiSpriteCompilationResult, SpriteInput, CompilerError };
