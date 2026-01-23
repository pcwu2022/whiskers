// Code Generator - Control Blocks
// Generates JavaScript code for control blocks (wait, repeat, if, etc.)

import { BlockNode } from "@/types";
import { GeneratorState, write, formatArg } from "../generatorState";
import { generateBlockCode } from "../blockDispatcher";

export function generateControlBlock(state: GeneratorState, block: BlockNode): void {
    switch (block.name) {
        case "wait":
            generateWait(state, block);
            break;
        case "repeat":
            generateRepeat(state, block);
            break;
        case "forever":
            generateForever(state, block);
            break;
        case "if":
            generateIf(state, block);
            break;
        case "ifElse":
            generateIfElse(state, block);
            break;
        case "waitUntil":
            generateWaitUntil(state, block);
            break;
        case "repeatUntil":
            generateRepeatUntil(state, block);
            break;
        case "stop":
            generateStop(state, block);
            break;
        default:
            write(state, `// Unsupported control block: ${block.name}\n`);
    }
}

function generateWait(state: GeneratorState, block: BlockNode): void {
    write(state, `await new Promise(resolve => setTimeout(resolve, ${formatArg(state, block.args[0])} * 1000));\n`);
    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function generateRepeat(state: GeneratorState, block: BlockNode): void {
    write(state, `// Repeat loop\n`);
    write(state, `for (let i = 0; i < ${formatArg(state, block.args[0])}; i++) {\n`);
    state.indent++;

    let nextAfterRepeat: BlockNode | undefined;
    let bodyBlock: BlockNode | undefined;

    if (block.args.length > 1 && typeof block.args[1] === "object") {
        bodyBlock = block.args[1] as BlockNode;
    } else if (block.next) {
        bodyBlock = block.next as BlockNode;
        nextAfterRepeat = block.next.next;
    }

    if (bodyBlock) {
        generateBlockCode(state, bodyBlock);
    }

    state.indent--;
    write(state, `}\n`);

    if (!nextAfterRepeat && block.next) {
        generateBlockCode(state, block.next);
    } else if (nextAfterRepeat) {
        generateBlockCode(state, nextAfterRepeat);
    }
}

function generateForever(state: GeneratorState, block: BlockNode): void {
    write(state, `// Forever loop (using setInterval for browser compatibility)\n`);
    write(state, `(async function forever() {\n`);
    state.indent++;

    if (block.args.length > 0 && typeof block.args[0] === "object") {
        generateBlockCode(state, block.args[0] as BlockNode);
    } else if (block.next) {
        generateBlockCode(state, block.next as BlockNode);
        write(state, `setTimeout(forever, 10);\n`);
        state.indent--;
        write(state, `})();\n`);
        return;
    }

    write(state, `setTimeout(forever, 10); // Small delay to prevent UI freezing\n`);
    state.indent--;
    write(state, `})();\n`);

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function generateIf(state: GeneratorState, block: BlockNode): void {
    write(state, `// If statement\n`);
    write(state, `if (${formatArg(state, block.args[0])}) {\n`);
    state.indent++;

    if (block.args.length > 1 && typeof block.args[1] === "object") {
        generateBlockCode(state, block.args[1] as BlockNode);
    } else if (block.next) {
        generateBlockCode(state, block.next as BlockNode);
    }

    state.indent--;
    write(state, `}\n`);

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function generateIfElse(state: GeneratorState, block: BlockNode): void {
    const thenBlock = block.args[1] as BlockNode;
    const elseBlock = block.args[2] as BlockNode;

    write(state, `// If-Else statement\n`);
    write(state, `if (${formatArg(state, block.args[0])}) {\n`);
    state.indent++;

    if (thenBlock) {
        generateBlockCode(state, thenBlock);
    }

    state.indent--;
    write(state, `} else {\n`);
    state.indent++;

    if (elseBlock) {
        generateBlockCode(state, elseBlock);
    }

    state.indent--;
    write(state, `}\n`);

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function generateWaitUntil(state: GeneratorState, block: BlockNode): void {
    write(state, `// Wait until condition is true\n`);
    write(state, `await new Promise(resolve => {\n`);
    state.indent++;
    write(state, `function checkCondition() {\n`);
    state.indent++;
    write(state, `if (${formatArg(state, block.args[0])}) {\n`);
    state.indent++;
    write(state, `resolve();\n`);
    state.indent--;
    write(state, `} else {\n`);
    state.indent++;
    write(state, `setTimeout(checkCondition, 50);\n`);
    state.indent--;
    write(state, `}\n`);
    state.indent--;
    write(state, `}\n`);
    write(state, `checkCondition();\n`);
    state.indent--;
    write(state, `});\n`);

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function generateRepeatUntil(state: GeneratorState, block: BlockNode): void {
    write(state, `// Repeat until condition is true\n`);
    write(state, `while (!(${formatArg(state, block.args[0])})) {\n`);
    state.indent++;

    if (block.args.length > 1 && typeof block.args[1] === "object") {
        generateBlockCode(state, block.args[1] as BlockNode);
    } else if (block.next) {
        generateBlockCode(state, block.next as BlockNode);
    }

    write(state, `await new Promise(resolve => setTimeout(resolve, 10));\n`);
    state.indent--;
    write(state, `}\n`);

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function generateStop(state: GeneratorState, block: BlockNode): void {
    const target = block.args[0];
    if (target === "all") {
        write(state, `// Stop all (simplified implementation - just returns from current execution)\n`);
        write(state, `return;\n`);
    } else if (target === "thisScript") {
        write(state, `// Stop this script\n`);
        write(state, `return;\n`);
    } else {
        write(state, `// Stop other scripts (simplified implementation)\n`);
        write(state, `console.log("Stop other scripts requested");\n`);
    }
}
