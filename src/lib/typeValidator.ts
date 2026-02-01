// Type Validator: Validates argument types, detects typos, and checks procedure calls
// This module provides semantic validation after parsing to catch type mismatches and common errors

import { Program, BlockNode, CompilerError, ErrorCodes } from "@/types/compilerTypes";

// ============================================================================
// BLOCK ARGUMENT TYPE DEFINITIONS
// ============================================================================

type ArgType = "number" | "string" | "boolean" | "any";

interface BlockSignature {
    name: string;
    args: ArgType[];
    description?: string;
}

// Blocks that require specific argument types
const BLOCK_SIGNATURES: BlockSignature[] = [
    // Motion blocks requiring numbers
    { name: "move", args: ["number"], description: "move N steps" },
    { name: "turnRight", args: ["number"], description: "turn right N degrees" },
    { name: "turnLeft", args: ["number"], description: "turn left N degrees" },
    { name: "goToXY", args: ["number", "number"], description: "go to x: N y: N" },
    { name: "glide", args: ["number", "number", "number"], description: "glide N secs to x: N y: N" },
    { name: "glideToXY", args: ["number", "number", "number"], description: "glide N secs to x: N y: N" },
    { name: "pointInDirection", args: ["number"], description: "point in direction N" },
    { name: "setX", args: ["number"], description: "set x to N" },
    { name: "setY", args: ["number"], description: "set y to N" },
    { name: "changeX", args: ["number"], description: "change x by N" },
    { name: "changeY", args: ["number"], description: "change y by N" },
    
    // Control blocks requiring numbers
    { name: "wait", args: ["number"], description: "wait N seconds" },
    { name: "waitSeconds", args: ["number"], description: "wait N seconds" },
    { name: "repeat", args: ["number"], description: "repeat N times" },
    
    // Control blocks requiring booleans
    { name: "if", args: ["boolean"], description: "if condition then" },
    { name: "ifElse", args: ["boolean"], description: "if condition then ... else" },
    { name: "repeatUntil", args: ["boolean"], description: "repeat until condition" },
    { name: "waitUntil", args: ["boolean"], description: "wait until condition" },
    
    // Looks blocks requiring numbers
    { name: "setSize", args: ["number"], description: "set size to N %" },
    { name: "changeSize", args: ["number"], description: "change size by N" },
    { name: "sayFor", args: ["any", "number"], description: "say message for N seconds" },
    { name: "thinkFor", args: ["any", "number"], description: "think message for N seconds" },
    { name: "setEffect", args: ["any", "number"], description: "set effect to N" },
    { name: "changeEffect", args: ["any", "number"], description: "change effect by N" },
    { name: "goBackLayers", args: ["number"], description: "go back N layers" },
    { name: "goForwardLayers", args: ["number"], description: "go forward N layers" },
    
    // Sound blocks requiring numbers
    { name: "setVolume", args: ["number"], description: "set volume to N %" },
    { name: "changeVolume", args: ["number"], description: "change volume by N" },
    
    // Pen blocks requiring numbers
    { name: "setPenSize", args: ["number"], description: "set pen size to N" },
    { name: "changePenSize", args: ["number"], description: "change pen size by N" },
];

// Map block names to their signatures for quick lookup
const SIGNATURE_MAP = new Map<string, BlockSignature>();
BLOCK_SIGNATURES.forEach(sig => SIGNATURE_MAP.set(sig.name, sig));

// ============================================================================
// KNOWN KEYWORDS FOR TYPO DETECTION
// ============================================================================

const KNOWN_BLOCK_KEYWORDS = new Set([
    // Events
    "when", "broadcast", "receive",
    // Motion
    "move", "turn", "go", "glide", "point", "set", "change",
    // Looks
    "say", "think", "show", "hide", "switch", "next", "clear",
    // Sound
    "play", "start", "stop",
    // Control
    "wait", "repeat", "forever", "if", "else", "until", "create", "delete", "end",
    // Sensing
    "ask", "touching", "key", "mouse", "reset",
    // Variables/Lists
    "var", "list", "add", "insert", "replace", "item",
    // Custom blocks
    "define", "call",
    // Pen
    "pen", "stamp", "erase",
]);

// ============================================================================
// LEVENSHTEIN DISTANCE FOR TYPO DETECTION
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * Used to suggest corrections for misspelled keywords
 */
function levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    
    // Create distance matrix
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    // Fill in the rest
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                );
            }
        }
    }
    
    return dp[m][n];
}

/**
 * Find the closest matching keyword for a typo
 * Returns null if no close match found (distance > 2)
 */
export function findClosestKeyword(typo: string): string | null {
    let closest: string | null = null;
    let minDistance = Infinity;
    
    for (const keyword of KNOWN_BLOCK_KEYWORDS) {
        const distance = levenshteinDistance(typo.toLowerCase(), keyword.toLowerCase());
        if (distance < minDistance && distance <= 2) {
            minDistance = distance;
            closest = keyword;
        }
    }
    
    return closest;
}

// ============================================================================
// TYPE CHECKING HELPERS
// ============================================================================

/**
 * Determine the type of an argument value
 */
function getArgType(arg: string | number | BlockNode | undefined | null): ArgType {
    if (arg === undefined || arg === null) {
        return "any";
    }
    
    if (typeof arg === "number") {
        return "number";
    }
    
    if (typeof arg === "string") {
        // Check if it's a string literal (quoted)
        if (arg.startsWith('"') || arg.startsWith("'")) {
            return "string";
        }
        // Check for boolean operators/conditions
        if (arg === "true" || arg === "false") {
            return "boolean";
        }
        // Variable references ($varName) or list references (#listName) are dynamic
        if (arg.startsWith("$") || arg.startsWith("#")) {
            return "any"; // Could be any type at runtime
        }
        // Keywords like "steps", "degrees", "seconds" are just labels
        if (["steps", "degrees", "seconds", "secs", "layers", "layer"].includes(arg)) {
            return "any";
        }
        // Bare strings (unquoted) could be identifiers or string values
        return "string";
    }
    
    if (typeof arg === "object") {
        // It's a BlockNode - check what type it returns
        const block = arg as BlockNode;
        
        // Boolean-returning blocks
        if (block.name === "and" || block.name === "or" || block.name === "not") {
            return "boolean";
        }
        if (block.name === "touching" || block.name === "touchingColor" || 
            block.name === "keyPressed" || block.name === "mouseDown" ||
            block.name === "contains" || block.name === "listContains") {
            return "boolean";
        }
        
        // Comparison operators return boolean
        if (block.type === "operator" || block.type === "operators") {
            if (block.name === ">" || block.name === "<" || block.name === "=" ||
                block.name === "comparison" || block.name === "equals" ||
                block.name === "lessThan" || block.name === "greaterThan") {
                return "boolean";
            }
        }
        
        // Number-returning blocks
        if (block.name === "pickRandom" || block.name === "pick" ||
            block.name === "abs" || block.name === "sqrt" || block.name === "round" ||
            block.name === "floor" || block.name === "ceiling" ||
            block.name === "sin" || block.name === "cos" || block.name === "tan" ||
            block.name === "length" || block.name === "lengthOfList" ||
            block.name === "xPosition" || block.name === "yPosition" ||
            block.name === "direction" || block.name === "size" ||
            block.name === "timer" || block.name === "volume" ||
            block.name === "mouseX" || block.name === "mouseY") {
            return "number";
        }
        
        // Most reporter blocks return dynamic types
        return "any";
    }
    
    return "any";
}

/**
 * Check if an argument is a "raw" literal value (not a computed expression or variable)
 * Used to detect cases like "if 50 then" where a literal number is used as boolean
 */
function isLiteralValue(arg: string | number | BlockNode | undefined | null): boolean {
    if (typeof arg === "number") {
        return true;
    }
    if (typeof arg === "string") {
        // String literal
        if (arg.startsWith('"') || arg.startsWith("'")) {
            return true;
        }
        // Variable/list references are not literals
        if (arg.startsWith("$") || arg.startsWith("#")) {
            return false;
        }
        // Try to parse as number
        if (!isNaN(Number(arg))) {
            return true;
        }
    }
    return false;
}

/**
 * Check if arg represents a comparison expression (returns boolean)
 */
function isComparisonExpression(arg: string | number | BlockNode | undefined | null): boolean {
    if (typeof arg === "object" && arg !== null) {
        const block = arg as BlockNode;
        // Check for comparison operators
        if (block.type === "operator" || block.type === "operators") {
            if (block.name === ">" || block.name === "<" || block.name === "=" ||
                block.name === "comparison" || block.name === "equals" ||
                block.name === "lessThan" || block.name === "greaterThan") {
                return true;
            }
        }
        // Boolean operators
        if (block.name === "and" || block.name === "or" || block.name === "not") {
            return true;
        }
        // Sensing blocks that return boolean
        if (block.name === "touching" || block.name === "touchingColor" ||
            block.name === "keyPressed" || block.name === "mouseDown" ||
            block.name === "contains" || block.name === "listContains") {
            return true;
        }
    }
    return false;
}

/**
 * Check if an array of args contains a comparison operator (for inline comparisons like "score > 10")
 */
function argsContainComparison(args: (string | number | BlockNode)[]): boolean {
    const comparisonOperators = [">", "<", "=", "==", "!=", ">=", "<="];
    for (const arg of args) {
        if (typeof arg === "string" && comparisonOperators.includes(arg)) {
            return true;
        }
        // Also check if any arg is a comparison BlockNode
        if (isComparisonExpression(arg)) {
            return true;
        }
    }
    return false;
}

// ============================================================================
// MAIN VALIDATION FUNCTIONS
// ============================================================================

export interface TypeValidationResult {
    errors: CompilerError[];
}

/**
 * Validate types in a program's AST
 * Checks for type mismatches, typos, and other semantic errors
 */
export function validateTypes(
    program: Program,
    code: string,
    procedureDefinitions: Map<string, string[]>
): TypeValidationResult {
    const errors: CompilerError[] = [];
    const codeLines = code.split('\n');
    
    // Helper to find line number for a block name
    const findLineForBlock = (blockName: string, startLine: number = 0): number => {
        const searchPatterns = getSearchPatterns(blockName);
        for (let i = startLine; i < codeLines.length; i++) {
            const lineTrimmed = codeLines[i].trim();
            const lineLower = lineTrimmed.toLowerCase();
            
            // Skip comment lines
            if (lineTrimmed.startsWith("//")) {
                continue;
            }
            
            for (const pattern of searchPatterns) {
                if (lineLower.includes(pattern)) {
                    // Special case: don't match "if on edge, bounce" when searching for "if" control blocks
                    if ((blockName === "if" || blockName === "ifElse") && 
                        lineLower.includes("if on edge")) {
                        continue;
                    }
                    return i + 1;
                }
            }
        }
        return startLine + 1;
    };
    
    // Get search patterns for a block name
    const getSearchPatterns = (blockName: string): string[] => {
        const patterns: string[] = [blockName.toLowerCase()];
        // Add common variations
        if (blockName === "goToXY") patterns.push("go to x");
        if (blockName === "waitSeconds" || blockName === "wait") patterns.push("wait ");
        if (blockName === "sayFor") patterns.push("say ");
        if (blockName === "thinkFor") patterns.push("think ");
        if (blockName === "repeat") patterns.push("repeat ");
        if (blockName === "if" || blockName === "ifElse") patterns.push("if ");
        if (blockName === "repeatUntil") patterns.push("repeat until");
        if (blockName === "waitUntil") patterns.push("wait until");
        return patterns;
    };
    
    let lastProcessedLine = 0;
    
    // Recursively validate blocks
    const validateBlock = (block: BlockNode) => {
        const signature = SIGNATURE_MAP.get(block.name);
        const lineNum = findLineForBlock(block.name, lastProcessedLine);
        lastProcessedLine = Math.max(lastProcessedLine, lineNum - 1);
        
        // Check type signatures for known blocks
        if (signature) {
            // Filter out non-value args (like "steps", "seconds", etc.)
            const valueArgs = block.args.filter(arg => {
                if (typeof arg === "string") {
                    const lower = arg.toLowerCase();
                    return !["steps", "degrees", "seconds", "secs", "layers", "layer", "then", "%"].includes(lower);
                }
                return true;
            });
            
            for (let i = 0; i < signature.args.length && i < valueArgs.length; i++) {
                const expectedType = signature.args[i];
                const actualArg = valueArgs[i];
                const actualType = getArgType(actualArg);
                
                // Type mismatch checks
                if (expectedType === "number" && actualType === "string") {
                    // String where number expected
                    const argValue = typeof actualArg === "string" ? actualArg : String(actualArg);
                    errors.push({
                        code: ErrorCodes.NUMBER_REQUIRED,
                        message: `'${block.name}' requires a number, but got a string ${argValue}.`,
                        line: lineNum,
                        column: 1,
                        severity: "error",
                        suggestion: `💡 Use a number instead. For example: ${signature.description || block.name + " 10"}`,
                    });
                }
                
                if (expectedType === "boolean") {
                    // Check if a literal number/string is used where boolean expected
                    // Skip this check if the block's args contain a comparison operator (inline comparison like "score > 10")
                    if (isLiteralValue(actualArg) && !isComparisonExpression(actualArg) && !argsContainComparison(block.args)) {
                        const argValue = typeof actualArg === "string" ? actualArg : String(actualArg);
                        errors.push({
                            code: ErrorCodes.BOOLEAN_REQUIRED,
                            message: `'${block.name}' requires a condition (true/false), but got ${argValue}.`,
                            line: lineNum,
                            column: 1,
                            severity: "error",
                            suggestion: `💡 Use a comparison like: ${block.name} score > 10 then`,
                        });
                    }
                }
            }
        }
        
        // Check for and/or operators in flat args (e.g., if block's args)
        // Pattern: [..., "and"|"or", ...]
        if (block.name === "if" || block.name === "ifElse" || block.name === "repeatUntil" || block.name === "waitUntil") {
            for (let i = 0; i < block.args.length; i++) {
                const arg = block.args[i];
                if (typeof arg === "string" && (arg === "and" || arg === "or")) {
                    // Check left operand (what immediately precedes the and/or)
                    if (i > 0) {
                        const leftArg = block.args[i - 1];
                        // Check if the left side is a literal number (not part of a comparison)
                        if (typeof leftArg === "number") {
                            // Check if there's no comparison operator before this number
                            let hasComparisonBefore = false;
                            for (let j = 0; j < i; j++) {
                                const prev = block.args[j];
                                if (typeof prev === "string" && ["<", ">", "=", "==", "!=", "<=", ">="].includes(prev)) {
                                    hasComparisonBefore = true;
                                }
                            }
                            if (!hasComparisonBefore) {
                                errors.push({
                                    code: ErrorCodes.INVALID_BOOLEAN_OPERATION,
                                    message: `Cannot use '${arg}' with ${leftArg}. The left side should be a condition.`,
                                    line: lineNum,
                                    column: 1,
                                    severity: "error",
                                    suggestion: `💡 Both sides of '${arg}' need to be conditions. Example: score > 0 ${arg} lives > 0`,
                                });
                            }
                        }
                    }
                    
                    // Check right operand (what immediately follows the and/or)
                    if (i < block.args.length - 1) {
                        const rightArg = block.args[i + 1];
                        // Check if the right side is a literal number (not followed by comparison)
                        if (typeof rightArg === "number") {
                            // Check if there's no comparison operator after this number (before next and/or or end)
                            let hasComparisonAfter = false;
                            for (let j = i + 2; j < block.args.length; j++) {
                                const next = block.args[j];
                                if (typeof next === "string" && ["<", ">", "=", "==", "!=", "<=", ">="].includes(next)) {
                                    hasComparisonAfter = true;
                                    break;
                                }
                                // Stop at another logical operator or then
                                if (typeof next === "string" && (next === "and" || next === "or" || next === "then")) {
                                    break;
                                }
                            }
                            if (!hasComparisonAfter) {
                                errors.push({
                                    code: ErrorCodes.INVALID_BOOLEAN_OPERATION,
                                    message: `Cannot use '${arg}' with ${rightArg}. The right side should be a condition.`,
                                    line: lineNum,
                                    column: 1,
                                    severity: "error",
                                    suggestion: `💡 Both sides of '${arg}' need to be conditions. Example: score > 0 ${arg} lives > 0`,
                                });
                            }
                        }
                    }
                }
            }
        }
        
        // Check boolean operators (and, or) for type mismatches
        if (block.name === "and" || block.name === "or") {
            for (let i = 0; i < block.args.length && i < 2; i++) {
                const arg = block.args[i];
                if (isLiteralValue(arg) && !isComparisonExpression(arg)) {
                    const argValue = typeof arg === "string" ? arg : String(arg);
                    const position = i === 0 ? "left" : "right";
                    errors.push({
                        code: ErrorCodes.INVALID_BOOLEAN_OPERATION,
                        message: `Cannot use '${block.name}' with ${argValue}. The ${position} side should be a condition.`,
                        line: lineNum,
                        column: 1,
                        severity: "error",
                        suggestion: `💡 Both sides of '${block.name}' need to be conditions. Example: score > 0 ${block.name} lives > 0`,
                    });
                }
            }
        }
        
        // Check expression blocks that contain "and" or "or" operators
        if (block.name === "expression" && block.args) {
            // Find positions of "and" or "or" in args
            for (let i = 0; i < block.args.length; i++) {
                const arg = block.args[i];
                if (typeof arg === "string" && (arg === "and" || arg === "or")) {
                    // Check the operand before the operator (left side)
                    if (i > 0) {
                        const leftArg = block.args[i - 1];
                        // Check if the immediate left is a literal number (not a comparison)
                        if (isLiteralValue(leftArg) && !isComparisonExpression(leftArg)) {
                            // Make sure there's no comparison operator between this literal and the and/or
                            let hasComparisonBefore = false;
                            for (let j = i - 1; j >= 0; j--) {
                                const prev = block.args[j];
                                if (typeof prev === "string" && ["<", ">", "=", "==", "!=", "<=", ">="].includes(prev)) {
                                    hasComparisonBefore = true;
                                    break;
                                }
                                // Stop at another logical operator
                                if (typeof prev === "string" && (prev === "and" || prev === "or")) {
                                    break;
                                }
                            }
                            if (!hasComparisonBefore) {
                                const argValue = typeof leftArg === "string" ? leftArg : String(leftArg);
                                errors.push({
                                    code: ErrorCodes.INVALID_BOOLEAN_OPERATION,
                                    message: `Cannot use '${arg}' with ${argValue}. The left side should be a condition.`,
                                    line: lineNum,
                                    column: 1,
                                    severity: "error",
                                    suggestion: `💡 Both sides of '${arg}' need to be conditions. Example: score > 0 ${arg} lives > 0`,
                                });
                            }
                        }
                    }
                    
                    // Check the operand after the operator (right side)
                    if (i < block.args.length - 1) {
                        const rightArg = block.args[i + 1];
                        // Check if the immediate right is a literal number (not followed by comparison)
                        if (isLiteralValue(rightArg) && !isComparisonExpression(rightArg)) {
                            // Make sure there's no comparison operator after this literal
                            let hasComparisonAfter = false;
                            for (let j = i + 1; j < block.args.length; j++) {
                                const next = block.args[j];
                                if (typeof next === "string" && ["<", ">", "=", "==", "!=", "<=", ">="].includes(next)) {
                                    hasComparisonAfter = true;
                                    break;
                                }
                                // Stop at another logical operator
                                if (typeof next === "string" && (next === "and" || next === "or")) {
                                    break;
                                }
                            }
                            if (!hasComparisonAfter) {
                                const argValue = typeof rightArg === "string" ? rightArg : String(rightArg);
                                errors.push({
                                    code: ErrorCodes.INVALID_BOOLEAN_OPERATION,
                                    message: `Cannot use '${arg}' with ${argValue}. The right side should be a condition.`,
                                    line: lineNum,
                                    column: 1,
                                    severity: "error",
                                    suggestion: `💡 Both sides of '${arg}' need to be conditions. Example: score > 0 ${arg} lives > 0`,
                                });
                            }
                        }
                    }
                }
            }
        }
        
        // Check procedure calls for argument count
        if (block.name === "call" || block.type === "custom") {
            // For "call" blocks, first arg is procedure name, rest are arguments
            if (block.name === "call" && block.args.length > 0) {
                const procName = String(block.args[0]);
                const providedArgs = block.args.slice(1).filter(arg => {
                    // Filter out the procedure name and any keyword-like args
                    if (typeof arg === "string") {
                        return !["call"].includes(arg.toLowerCase());
                    }
                    return true;
                });
                
                if (procedureDefinitions.has(procName)) {
                    const expectedParams = procedureDefinitions.get(procName)!;
                    const expectedCount = expectedParams.length;
                    const providedCount = providedArgs.length;
                    
                    if (providedCount !== expectedCount) {
                        errors.push({
                            code: "E301",
                            message: `'${procName}' expects ${expectedCount} argument${expectedCount !== 1 ? 's' : ''} but got ${providedCount}.`,
                            line: lineNum,
                            column: 1,
                            severity: "error",
                            suggestion: `💡 The procedure '${procName}' needs: ${expectedParams.join(', ')}`,
                        });
                    }
                }
            } else if (block.type === "custom" && block.name !== "define" && block.name !== "call") {
                // Direct procedure call like "jump 5"
                const procName = block.name;
                if (procedureDefinitions.has(procName)) {
                    const expectedParams = procedureDefinitions.get(procName)!;
                    const expectedCount = expectedParams.length;
                    const providedCount = block.args.length;
                    
                    if (providedCount !== expectedCount) {
                        errors.push({
                            code: "E301",
                            message: `'${procName}' expects ${expectedCount} argument${expectedCount !== 1 ? 's' : ''} but got ${providedCount}.`,
                            line: lineNum,
                            column: 1,
                            severity: "error",
                            suggestion: `💡 The procedure '${procName}' needs: ${expectedParams.join(', ')}`,
                        });
                    }
                }
            }
        }
        
        // Recursively check nested blocks
        if (block.body) {
            for (const child of block.body) {
                validateBlock(child);
            }
        }
        if (block.elseBody) {
            for (const child of block.elseBody) {
                validateBlock(child);
            }
        }
        if (block.next) {
            validateBlock(block.next);
        }
        
        // Check arguments that are blocks
        for (const arg of block.args) {
            if (typeof arg === "object" && arg !== null) {
                validateBlock(arg as BlockNode);
            }
        }
    };
    
    // Validate all scripts
    for (const script of program.scripts) {
        lastProcessedLine = 0;
        for (const block of script.blocks) {
            validateBlock(block);
        }
    }
    
    return { errors };
}

/**
 * Check for missing values in coordinate patterns like "go to x: y: 50"
 * Returns error if x: is immediately followed by y: without a value
 */
export function checkMissingCoordinateValue(
    line: string,
    lineNumber: number
): CompilerError | null {
    // Check for "x: y:" pattern (missing x value)
    if (/x:\s*y:/i.test(line)) {
        return {
            code: ErrorCodes.MISSING_VALUE,
            message: "Missing value after 'x:'. You need to provide a number.",
            line: lineNumber,
            column: line.toLowerCase().indexOf("x:") + 1,
            severity: "error",
            suggestion: "💡 Provide both values: go to x: 100 y: 50",
        };
    }
    
    // Check for "y:" at end of line without value (before any newline)
    const yMatch = line.match(/y:\s*$/i);
    if (yMatch) {
        return {
            code: ErrorCodes.MISSING_VALUE,
            message: "Missing value after 'y:'. You need to provide a number.",
            line: lineNumber,
            column: line.toLowerCase().lastIndexOf("y:") + 1,
            severity: "error",
            suggestion: "💡 Provide a value: y: 50",
        };
    }
    
    return null;
}

/**
 * Check for assignment operator in expression context
 * Detects patterns like "set x to x = 5"
 */
export function checkAssignmentInExpression(
    line: string,
    lineNumber: number
): CompilerError | null {
    // Look for "set ... to ... = ..." pattern
    const setToMatch = line.match(/set\s+\w+\s+to\s+.+\s*=\s*.+/i);
    if (setToMatch) {
        // Check if it's actually a comparison expression (has > < or second =)
        const afterTo = line.substring(line.toLowerCase().indexOf(" to ") + 4);
        // If there's a comparison operator before the =, it's probably valid
        if (!/[<>]/.test(afterTo.split("=")[0])) {
            // Single = after "to" is suspicious
            const equalCount = (afterTo.match(/=/g) || []).length;
            if (equalCount === 1 && !afterTo.includes("==")) {
                return {
                    code: "E302",
                    message: "Unexpected '=' in expression. Did you mean to assign a value directly?",
                    line: lineNumber,
                    column: line.indexOf("=") + 1,
                    severity: "error",
                    suggestion: "💡 For assignment, use: set x to 5\n    For comparison, use: x = 5 (returns true/false)",
                };
            }
        }
    }
    
    return null;
}
