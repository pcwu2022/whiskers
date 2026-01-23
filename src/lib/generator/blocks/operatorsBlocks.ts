// Code Generator - Operators Blocks
// Generates JavaScript code for operators blocks (mathematical and logical operations)

import { BlockNode } from "@/types";
import { GeneratorState, formatArg } from "../generatorState";

export function generateOperatorsBlock(state: GeneratorState, block: BlockNode): string {
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
