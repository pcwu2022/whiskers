// Code Generator - Pen Blocks
// Generates JavaScript code for pen blocks

import { BlockNode } from "@/types";
import { GeneratorState, write, formatArg } from "../generatorState";
import { generateBlockCode } from "../blockDispatcher";
import { PEN_METHODS } from "@/templates";

const SPRITE = `scratchRuntime.sprites[scratchRuntime.currentSprite]`;

export function generatePenBlock(state: GeneratorState, block: BlockNode): void {
    // If pen methods don't exist yet, add them
    if (!state.penMethodsAdded) {
        addPenMethods(state);
    }

    switch (block.name) {
        case "penDown":
            write(state, `${SPRITE}.penDown();\n`);
            break;
        case "penUp":
            write(state, `${SPRITE}.penUp();\n`);
            break;
        case "setPenColor":
            write(state, `${SPRITE}.setPenColor(${formatArg(state, block.args[0])});\n`);
            break;
        case "changePenSize":
            write(state, `${SPRITE}.changePenSize(${formatArg(state, block.args[0])});\n`);
            break;
        case "setPenSize":
            write(state, `${SPRITE}.setPenSize(${formatArg(state, block.args[0])});\n`);
            break;
        case "clear":
            write(state, `${SPRITE}.clearPen();\n`);
            break;
        case "stamp":
            write(state, `${SPRITE}.stamp();\n`);
            break;
        default:
            write(state, `// Unsupported pen block: ${block.name}\n`);
    }

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function addPenMethods(state: GeneratorState): void {
    state.penMethodsAdded = true;

    // Insert pen methods into the sprite definition
    const insertPoint = state.output.lastIndexOf("};") - 1;
    state.output = state.output.substring(0, insertPoint) + PEN_METHODS + state.output.substring(insertPoint);

    // Update move and goto methods to handle pen drawing
    updateMovementMethods(state);
}

function updateMovementMethods(state: GeneratorState): void {
    // Find and modify the move method to update pen drawing
    const moveMethodPos = state.output.indexOf("move: function(steps)");
    if (moveMethodPos > -1) {
        const endOfMoveMethod = state.output.indexOf("},", moveMethodPos) + 2;
        const moveMethod = state.output.substring(moveMethodPos, endOfMoveMethod);
        const updatedMoveMethod = moveMethod.replace(
            "console.log(`${scratchRuntime.currentSprite} moved to (${Math.floor(this.x)}, ${Math.floor(this.y)})`);\n",
            "console.log(`${scratchRuntime.currentSprite} moved to (${Math.floor(this.x)}, ${Math.floor(this.y)})`);\n                    this.updatePenDrawing();\n"
        );
        state.output = state.output.substring(0, moveMethodPos) + updatedMoveMethod + state.output.substring(endOfMoveMethod);
    }

    // Find and modify the goTo method to update pen drawing
    const goToMethodPos = state.output.indexOf("goTo: function(x, y)");
    if (goToMethodPos > -1) {
        const endOfGoToMethod = state.output.indexOf("},", goToMethodPos) + 2;
        const goToMethod = state.output.substring(goToMethodPos, endOfGoToMethod);
        const updatedGoToMethod = goToMethod.replace(
            "console.log(`${scratchRuntime.currentSprite} went to (${Math.floor(this.x)}, ${Math.floor(this.y)})`);\n",
            "console.log(`${scratchRuntime.currentSprite} went to (${Math.floor(this.x)}, ${Math.floor(this.y)})`);\n                    this.updatePenDrawing();\n"
        );
        state.output = state.output.substring(0, goToMethodPos) + updatedGoToMethod + state.output.substring(endOfGoToMethod);
    }
}
