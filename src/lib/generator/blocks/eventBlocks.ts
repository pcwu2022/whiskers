// Code Generator - Event Blocks
// Generates JavaScript code for event blocks (when flag clicked, when key pressed, etc.)

import { BlockNode } from "@/types";
import { GeneratorState, write, formatArg } from "../generatorState";
import { generateBlockCode } from "../blockDispatcher";

export function generateEventBlock(state: GeneratorState, block: BlockNode): void {
    if (block.name === "when" && block.args[0] === "flagClicked") {
        write(state, `// When green flag clicked\n`);
        write(state, `scratchRuntime.onGreenFlag(async function() {\n`);
        state.indent++;

        if (block.next) {
            generateBlockCode(state, block.next);
        }

        state.indent--;
        write(state, `});\n\n`);
    } else if (block.name === "when" && typeof block.args[0] === "string" && block.args[0].includes("keyPressed")) {
        const key = (block.args[0] as string).replace("keyPressed", "").toLowerCase();
        write(state, `// When ${key} key pressed\n`);
        write(state, `scratchRuntime.onEvent("keyPressed_${key}", async function() {\n`);
        state.indent++;

        if (block.next) {
            generateBlockCode(state, block.next);
        }

        state.indent--;
        write(state, `});\n\n`);
    } else if (block.name === "whenReceived") {
        const message = formatArg(state, block.args[0]);
        write(state, `// When I receive ${message}\n`);
        write(state, `scratchRuntime.onBroadcast(${message}, async function() {\n`);
        state.indent++;

        if (block.next) {
            generateBlockCode(state, block.next);
        }

        state.indent--;
        write(state, `});\n\n`);
    } else if (block.name === "broadcast") {
        const message = formatArg(state, block.args[0]);
        write(state, `scratchRuntime.broadcast(${message});\n`);
    } else if (block.name === "broadcastAndWait") {
        const message = formatArg(state, block.args[0]);
        write(state, `// Broadcast and wait (simplified implementation)\n`);
        write(state, `scratchRuntime.broadcast(${message});\n`);
        write(state, `await new Promise(resolve => setTimeout(resolve, 100));\n`);
    }
}
