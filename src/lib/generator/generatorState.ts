// Code Generator - State and Utilities
// Core code generator state management and utility functions

import { Program, BlockNode } from "@/types";

export interface GeneratorState {
    program: Program;
    output: string;
    htmlOutput: string;
    indent: number;
    inFunction: boolean;
    procedures: Map<string, string[]>;
    penMethodsAdded: boolean;
}

/**
 * Create a new generator state
 */
export function createGeneratorState(program: Program): GeneratorState {
    return {
        program,
        output: "",
        htmlOutput: "",
        indent: 0,
        inFunction: false,
        procedures: new Map(),
        penMethodsAdded: false,
    };
}

/**
 * Add proper indentation to the output
 */
export function write(state: GeneratorState, text: string): void {
    const indentation = "    ".repeat(state.indent);
    state.output += indentation + text;
}

/**
 * Format arguments correctly for JavaScript output
 */
export function formatArg(state: GeneratorState, arg: string | number | object): string {
    if (typeof arg === "string") {
        // If it's a variable reference
        if (arg.startsWith("$")) {
            return `scratchRuntime.variables["${arg.substring(1)}"]`;
        }
        // If it's a list reference
        else if (arg.startsWith("#")) {
            return `scratchRuntime.lists["${arg.substring(1)}"]`;
        }
        // It's a regular string
        else {
            return `"${arg}"`;
        }
    } else if (typeof arg === "number") {
        return arg.toString();
    } else if (typeof arg === "object" && arg !== null && "type" in arg) {
        // It's a nested block - import dynamically to avoid circular deps
        const block = arg as BlockNode;
        if (block.type === "operators") {
            return generateOperatorsExpression(state, block);
        } else {
            write(state, `// Warning: Unexpected nested block type: ${block.type}\n`);
            return '""';
        }
    } else {
        return JSON.stringify(arg);
    }
}

/**
 * Generate operators expression (used by formatArg)
 */
function generateOperatorsExpression(state: GeneratorState, block: BlockNode): string {
    switch (block.name) {
        case "add":
            return `(Number(${formatArg(state, block.args[0])}) + Number(${formatArg(state, block.args[1])}))`;
        case "subtract":
            return `(Number(${formatArg(state, block.args[0])}) - Number(${formatArg(state, block.args[1])}))`;
        case "multiply":
            return `(Number(${formatArg(state, block.args[0])}) * Number(${formatArg(state, block.args[1])}))`;
        case "divide":
            return `(Number(${formatArg(state, block.args[0])}) / Number(${formatArg(state, block.args[1])}))`;
        case "mod":
            return `(Number(${formatArg(state, block.args[0])}) % Number(${formatArg(state, block.args[1])}))`;
        case "round":
            return `Math.round(Number(${formatArg(state, block.args[0])}))`;
        case "abs":
            return `Math.abs(Number(${formatArg(state, block.args[0])}))`;
        case "floor":
            return `Math.floor(Number(${formatArg(state, block.args[0])}))`;
        case "ceiling":
            return `Math.ceil(Number(${formatArg(state, block.args[0])}))`;
        case "sqrt":
            return `Math.sqrt(Number(${formatArg(state, block.args[0])}))`;
        case "sin":
            return `Math.sin(Number(${formatArg(state, block.args[0])}) * Math.PI / 180)`;
        case "cos":
            return `Math.cos(Number(${formatArg(state, block.args[0])}) * Math.PI / 180)`;
        case "tan":
            return `Math.tan(Number(${formatArg(state, block.args[0])}) * Math.PI / 180)`;
        case "greater":
            return `(Number(${formatArg(state, block.args[0])}) > Number(${formatArg(state, block.args[1])}))`;
        case "less":
            return `(Number(${formatArg(state, block.args[0])}) < Number(${formatArg(state, block.args[1])}))`;
        case "equals":
            return `(${formatArg(state, block.args[0])} == ${formatArg(state, block.args[1])})`;
        case "and":
            return `(${formatArg(state, block.args[0])} && ${formatArg(state, block.args[1])})`;
        case "or":
            return `(${formatArg(state, block.args[0])} || ${formatArg(state, block.args[1])})`;
        case "not":
            return `!(${formatArg(state, block.args[0])})`;
        case "random":
            return `(Math.floor(Math.random() * (${formatArg(state, block.args[1])} - ${formatArg(state, block.args[0])} + 1)) + ${formatArg(state, block.args[0])})`;
        case "join":
            return `('' + ${formatArg(state, block.args[0])} + ${formatArg(state, block.args[1])})`;
        case "letterOf":
            return `String(${formatArg(state, block.args[1])}).charAt(${formatArg(state, block.args[0])} - 1)`;
        case "length":
            return `String(${formatArg(state, block.args[0])}).length`;
        case "contains":
            return `String(${formatArg(state, block.args[0])}).includes(String(${formatArg(state, block.args[1])}))`;
        case "expression":
            return `(${formatArg(state, block.args[0])})`;
        default:
            return `/* Unsupported operator: ${block.name} */`;
    }
}
