// Code Generator - Looks Blocks
// Generates JavaScript code for looks blocks (say, change size, etc.)

import { BlockNode } from "@/types";
import { GeneratorState, write, formatArg } from "../generatorState";
import { generateBlockCode } from "../blockDispatcher";

const SPRITE = `scratchRuntime.sprites[scratchRuntime.currentSprite]`;

export function generateLooksBlock(state: GeneratorState, block: BlockNode): void {
    switch (block.name) {
        case "say":
            if (block.args.length > 1) {
                write(state, `${SPRITE}.say(${formatArg(state, block.args[0])}, ${formatArg(state, block.args[1])});\n`);
            } else {
                write(state, `${SPRITE}.say(${formatArg(state, block.args[0])});\n`);
            }
            break;
        case "think":
            if (block.args.length > 1) {
                write(state, `// Think is implemented the same as say but with different styling\n`);
                write(state, `${SPRITE}.say("💭 " + ${formatArg(state, block.args[0])}, ${formatArg(state, block.args[1])});\n`);
            } else {
                write(state, `${SPRITE}.say("💭 " + ${formatArg(state, block.args[0])});\n`);
            }
            break;
        case "show":
            write(state, `${SPRITE}.show();\n`);
            break;
        case "hide":
            write(state, `${SPRITE}.hide();\n`);
            break;
        case "changeSize":
            write(state, `${SPRITE}.changeSize(${formatArg(state, block.args[0])});\n`);
            break;
        case "setSize":
            write(state, `${SPRITE}.setSize(${formatArg(state, block.args[0])});\n`);
            break;
        case "switchCostume":
            write(state, `// Switch costume (simplified implementation)\n`);
            write(state, `console.log(\`Switching costume to \${${formatArg(state, block.args[0])}}\`);\n`);
            break;
        default:
            write(state, `// Unsupported looks block: ${block.name}\n`);
    }

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}
