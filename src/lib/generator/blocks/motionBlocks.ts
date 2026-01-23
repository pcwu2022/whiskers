// Code Generator - Motion Blocks
// Generates JavaScript code for motion blocks (move, turn, go to, etc.)

import { BlockNode } from "@/types";
import { GeneratorState, write, formatArg } from "../generatorState";
import { generateBlockCode } from "../blockDispatcher";

const SPRITE = `scratchRuntime.sprites[scratchRuntime.currentSprite]`;

export function generateMotionBlock(state: GeneratorState, block: BlockNode): void {
    switch (block.name) {
        case "move":
            write(state, `${SPRITE}.move(${formatArg(state, block.args[0])});\n`);
            break;
        case "turnRight":
            write(state, `${SPRITE}.turnRight(${formatArg(state, block.args[0])});\n`);
            break;
        case "turnLeft":
            write(state, `${SPRITE}.turnLeft(${formatArg(state, block.args[0])});\n`);
            break;
        case "pointInDirection":
            write(state, `${SPRITE}.pointInDirection(${formatArg(state, block.args[0])});\n`);
            break;
        case "goTo":
            generateGoTo(state, block);
            break;
        case "setX":
            write(state, `${SPRITE}.goTo(${formatArg(state, block.args[0])}, ${SPRITE}.y);\n`);
            break;
        case "setY":
            write(state, `${SPRITE}.goTo(${SPRITE}.x, ${formatArg(state, block.args[0])});\n`);
            break;
        case "changeX":
            write(state, `${SPRITE}.goTo(${SPRITE}.x + ${formatArg(state, block.args[0])}, ${SPRITE}.y);\n`);
            break;
        case "changeY":
            write(state, `${SPRITE}.goTo(${SPRITE}.x, ${SPRITE}.y + ${formatArg(state, block.args[0])});\n`);
            break;
        case "glide":
            generateGlide(state, block);
            break;
        default:
            write(state, `// Unsupported motion block: ${block.name}\n`);
    }

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function generateGoTo(state: GeneratorState, block: BlockNode): void {
    if (block.args[0] === "random") {
        write(state, `// Go to random position\n`);
        write(state, `const randomX = Math.floor(Math.random() * scratchRuntime.stage.width) - (scratchRuntime.stage.width / 2);\n`);
        write(state, `const randomY = Math.floor(Math.random() * scratchRuntime.stage.height) - (scratchRuntime.stage.height / 2);\n`);
        write(state, `${SPRITE}.goTo(randomX, randomY);\n`);
    } else if (typeof block.args[0] === "string" && block.args[0].startsWith("sprite:")) {
        const targetSprite = block.args[0].replace("sprite:", "");
        write(state, `${SPRITE}.goToSprite("${targetSprite}");\n`);
    } else {
        write(state, `${SPRITE}.goTo(${formatArg(state, block.args[0])}, ${formatArg(state, block.args[1])});\n`);
    }
}

function generateGlide(state: GeneratorState, block: BlockNode): void {
    const seconds = formatArg(state, block.args[0]);
    const targetX = formatArg(state, block.args[1]);
    const targetY = formatArg(state, block.args[2]);
    
    write(state, `// Glide to position\n`);
    write(state, `const startX = ${SPRITE}.x;\n`);
    write(state, `const startY = ${SPRITE}.y;\n`);
    write(state, `const targetX = ${targetX};\n`);
    write(state, `const targetY = ${targetY};\n`);
    write(state, `const duration = ${seconds} * 1000;\n`);
    write(state, `const startTime = Date.now();\n\n`);

    write(state, `await new Promise(resolve => {\n`);
    state.indent++;
    write(state, `function animate() {\n`);
    state.indent++;
    write(state, `const elapsed = Date.now() - startTime;\n`);
    write(state, `const progress = Math.min(elapsed / duration, 1);\n`);
    write(state, `const newX = startX + (targetX - startX) * progress;\n`);
    write(state, `const newY = startY + (targetY - startY) * progress;\n`);
    write(state, `${SPRITE}.goTo(newX, newY);\n\n`);

    write(state, `if (progress < 1) {\n`);
    state.indent++;
    write(state, `requestAnimationFrame(animate);\n`);
    state.indent--;
    write(state, `} else {\n`);
    state.indent++;
    write(state, `resolve();\n`);
    state.indent--;
    write(state, `}\n`);
    state.indent--;
    write(state, `}\n\n`);

    write(state, `animate();\n`);
    state.indent--;
    write(state, `});\n`);
}
