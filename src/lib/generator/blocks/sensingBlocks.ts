// Code Generator - Sensing Blocks
// Generates JavaScript code for sensing blocks (ask, touching, etc.)

import { BlockNode } from "@/types";
import { GeneratorState, write, formatArg } from "../generatorState";
import { generateBlockCode } from "../blockDispatcher";

export function generateSensingBlock(state: GeneratorState, block: BlockNode): void {
    switch (block.name) {
        case "ask":
            write(state, `// Ask a question and wait for answer\n`);
            write(state, `await scratchRuntime.ask(${formatArg(state, block.args[0])});\n`);
            break;
        case "answer":
            write(state, `scratchRuntime.answer`);
            break;
        case "touching":
            generateTouching(state, block);
            break;
        case "keyPressed":
            generateKeyPressed(state, block);
            break;
        case "mouseDown":
            generateMouseDown(state);
            break;
        case "mouseX":
            generateMouseX(state);
            break;
        case "mouseY":
            generateMouseY(state);
            break;
        case "timer":
            write(state, `// Timer value (seconds since page load)\n`);
            write(state, `((start) => (Date.now() - start) / 1000)(Date.now())`);
            break;
        case "resetTimer":
            write(state, `// Reset timer (simplified implementation)\n`);
            write(state, `console.log("Timer reset requested");\n`);
            break;
        default:
            write(state, `// Unsupported sensing block: ${block.name}\n`);
    }

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function generateTouching(state: GeneratorState, block: BlockNode): void {
    const target = formatArg(state, block.args[0]);
    write(state, `// Touching detection (simplified implementation)\n`);
    write(state, `/* Simulating touch detection */\n`);
    
    if (typeof block.args[0] === "string" && block.args[0].startsWith("sprite:")) {
        const targetSprite = block.args[0].replace("sprite:", "");
        write(state, `((sprite) => {\n`);
        state.indent++;
        write(state, `const dx = sprite.x - scratchRuntime.sprites["${targetSprite}"].x;\n`);
        write(state, `const dy = sprite.y - scratchRuntime.sprites["${targetSprite}"].y;\n`);
        write(state, `return Math.sqrt(dx*dx + dy*dy) < 30; // Simple distance check\n`);
        state.indent--;
        write(state, `})(scratchRuntime.sprites[scratchRuntime.currentSprite])`);
    } else {
        write(state, `false /* Touch detection for ${target} not implemented */`);
    }
}

function generateKeyPressed(state: GeneratorState, block: BlockNode): void {
    const key = formatArg(state, block.args[0]);
    write(state, `// Key pressed detection\n`);
    write(state, `(() => {\n`);
    state.indent++;
    write(state, `const pressedKeys = {};\n`);
    write(state, `document.addEventListener('keydown', (e) => { pressedKeys[e.key.toLowerCase()] = true; });\n`);
    write(state, `document.addEventListener('keyup', (e) => { delete pressedKeys[e.key.toLowerCase()]; });\n`);
    write(state, `return ${key}.toLowerCase() in pressedKeys;\n`);
    state.indent--;
    write(state, `})()`);
}

function generateMouseDown(state: GeneratorState): void {
    write(state, `// Mouse down detection\n`);
    write(state, `(() => {\n`);
    state.indent++;
    write(state, `let isMouseDown = false;\n`);
    write(state, `document.addEventListener('mousedown', () => { isMouseDown = true; });\n`);
    write(state, `document.addEventListener('mouseup', () => { isMouseDown = false; });\n`);
    write(state, `return isMouseDown;\n`);
    state.indent--;
    write(state, `})()`);
}

function generateMouseX(state: GeneratorState): void {
    write(state, `// Mouse X position (relative to stage center)\n`);
    write(state, `(() => {\n`);
    state.indent++;
    write(state, `let mouseX = 0;\n`);
    write(state, `const stage = document.getElementById('stage');\n`);
    write(state, `if (stage) {\n`);
    state.indent++;
    write(state, `const rect = stage.getBoundingClientRect();\n`);
    write(state, `document.addEventListener('mousemove', (e) => {\n`);
    state.indent++;
    write(state, `mouseX = e.clientX - rect.left - (rect.width / 2);\n`);
    state.indent--;
    write(state, `});\n`);
    state.indent--;
    write(state, `}\n`);
    write(state, `return mouseX;\n`);
    state.indent--;
    write(state, `})()`);
}

function generateMouseY(state: GeneratorState): void {
    write(state, `// Mouse Y position (relative to stage center)\n`);
    write(state, `(() => {\n`);
    state.indent++;
    write(state, `let mouseY = 0;\n`);
    write(state, `const stage = document.getElementById('stage');\n`);
    write(state, `if (stage) {\n`);
    state.indent++;
    write(state, `const rect = stage.getBoundingClientRect();\n`);
    write(state, `document.addEventListener('mousemove', (e) => {\n`);
    state.indent++;
    write(state, `mouseY = (rect.height / 2) - (e.clientY - rect.top);\n`);
    state.indent--;
    write(state, `});\n`);
    state.indent--;
    write(state, `}\n`);
    write(state, `return mouseY;\n`);
    state.indent--;
    write(state, `})()`);
}
