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
    } else if (
        // Handle "when I receive" - new normalized format
        block.name === "whenIReceive"
    ) {
        const message = formatArg(state, block.args[0]);
        write(state, `// When I receive ${message}\n`);
        write(state, `scratchRuntime.onBroadcast(${message}, async function() {\n`);
        state.indent++;

        if (block.next) {
            generateBlockCode(state, block.next);
        }

        state.indent--;
        write(state, `});\n\n`);
    } else if (
        // Handle "when I receive" - parsed as when + ["I", "receive", "message"]
        block.name === "when" && 
        block.args.length >= 3 && 
        String(block.args[0]) === "I" && 
        String(block.args[1]) === "receive"
    ) {
        const message = formatArg(state, block.args[2]);
        write(state, `// When I receive ${message}\n`);
        write(state, `scratchRuntime.onBroadcast(${message}, async function() {\n`);
        state.indent++;

        if (block.next) {
            generateBlockCode(state, block.next);
        }

        state.indent--;
        write(state, `});\n\n`);
    } else if (
        // Handle "when receive" - parsed as when + ["receive", "message"]
        block.name === "when" && 
        block.args.length >= 2 && 
        String(block.args[0]) === "receive"
    ) {
        const message = formatArg(state, block.args[1]);
        write(state, `// When I receive ${message}\n`);
        write(state, `scratchRuntime.onBroadcast(${message}, async function() {\n`);
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
    } else if (
        // Handle "when I start as a clone" - new normalized format
        block.name === "whenIStartAsClone"
    ) {
        write(state, `// When I start as a clone\n`);
        write(state, `scratchRuntime.onEvent("cloneStart_" + CURRENT_SPRITE, async function() {\n`);
        state.indent++;

        if (block.next) {
            generateBlockCode(state, block.next);
        }

        state.indent--;
        write(state, `});\n\n`);
    } else if (
        // Handle "when I start as a clone" / "when cloneStarted"
        block.name === "when" && (
            block.args[0] === "cloneStarted" ||
            (block.args.length >= 4 && String(block.args[0]) === "I" && String(block.args[1]) === "start")
        )
    ) {
        write(state, `// When I start as a clone\n`);
        write(state, `scratchRuntime.onEvent("cloneStart_" + CURRENT_SPRITE, async function() {\n`);
        state.indent++;

        if (block.next) {
            generateBlockCode(state, block.next);
        }

        state.indent--;
        write(state, `});\n\n`);
    } else if (block.name === "when" && block.args[0] === "spriteClicked") {
        write(state, `// When this sprite clicked\n`);
        write(state, `scratchRuntime.onEvent("spriteClicked_" + CURRENT_SPRITE, async function() {\n`);
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
        write(state, `await scratchRuntime.broadcastAndWait(${message});\n`);
    }
}
