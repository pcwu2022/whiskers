// Code Generator - Block Dispatcher
// Routes block code generation to the appropriate block handler

import { BlockNode } from "@/types";
import { GeneratorState, write } from "./generatorState";
import {
    generateEventBlock,
    generateMotionBlock,
    generateLooksBlock,
    generateSoundBlock,
    generateControlBlock,
    generateSensingBlock,
    generateOperatorsBlock,
    generateVariablesBlock,
    generatePenBlock,
    generateCustomBlock,
} from "./blocks";

/**
 * Generates code for a single block and routes to the appropriate handler
 */
export function generateBlockCode(state: GeneratorState, block: BlockNode): void {
    switch (block.type) {
        case "event":
            generateEventBlock(state, block);
            break;
        case "motion":
            generateMotionBlock(state, block);
            break;
        case "looks":
            generateLooksBlock(state, block);
            break;
        case "sound":
            generateSoundBlock(state, block);
            break;
        case "control":
            generateControlBlock(state, block);
            break;
        case "sensing":
            generateSensingBlock(state, block);
            break;
        case "operators":
            write(state, generateOperatorsBlock(state, block));
            break;
        case "variables":
            generateVariablesBlock(state, block);
            break;
        case "pen":
            generatePenBlock(state, block);
            break;
        case "custom":
            generateCustomBlock(state, block);
            break;
        default:
            write(state, `// Unsupported block type: ${block.type}, name: ${block.name}\n`);
    }
}
