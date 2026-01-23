// Code Generator - Sound Blocks
// Generates JavaScript code for sound blocks (play sound, change volume, etc.)

import { BlockNode } from "@/types";
import { GeneratorState, write, formatArg } from "../generatorState";
import { generateBlockCode } from "../blockDispatcher";

export function generateSoundBlock(state: GeneratorState, block: BlockNode): void {
    switch (block.name) {
        case "playSound":
            write(state, `// Play sound (simplified implementation)\n`);
            write(state, `console.log(\`Playing sound: \${${formatArg(state, block.args[0])}}\`);\n`);
            break;
        case "stopAllSounds":
            write(state, `// Stop all sounds (simplified implementation)\n`);
            write(state, `console.log("Stopping all sounds");\n`);
            break;
        case "changeVolume":
            write(state, `// Change volume (simplified implementation)\n`);
            write(state, `scratchRuntime.stage.volume = Math.max(0, Math.min(100, scratchRuntime.stage.volume + ${formatArg(state, block.args[0])}));\n`);
            write(state, `console.log(\`Volume changed to \${scratchRuntime.stage.volume}%\`);\n`);
            break;
        case "setVolume":
            write(state, `// Set volume (simplified implementation)\n`);
            write(state, `scratchRuntime.stage.volume = Math.max(0, Math.min(100, ${formatArg(state, block.args[0])}));\n`);
            write(state, `console.log(\`Volume set to \${scratchRuntime.stage.volume}%\`);\n`);
            break;
        default:
            write(state, `// Unsupported sound block: ${block.name}\n`);
    }

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}
