// Code Generator - Custom Blocks
// Generates JavaScript code for custom blocks (procedures)

import { BlockNode } from "@/types";
import { GeneratorState, write, formatArg } from "../generatorState";
import { generateBlockCode } from "../blockDispatcher";

export function generateCustomBlock(state: GeneratorState, block: BlockNode): void {
    if (block.name === "defineFunction") {
        // Define a custom procedure/function
        const functionName = block.args[0] as string;
        const paramList = block.args.slice(1) as string[];

        write(state, `// Define custom procedure: ${functionName}\n`);
        write(state, `scratchRuntime.procedures["${functionName}"] = function(${paramList.join(", ")}) {\n`);
        state.indent++;

        // Generate code for the function body
        if (block.next) {
            state.inFunction = true;
            generateBlockCode(state, block.next);
            state.inFunction = false;
        }

        state.indent--;
        write(state, `};\n\n`);
    } else if (block.name === "call") {
        // Call a custom procedure/function
        const functionName = block.args[0] as string;
        const args = block.args
            .slice(1)
            .map((arg) => formatArg(state, arg))
            .join(", ");

        write(state, `// Call custom procedure: ${functionName}\n`);
        write(state, `scratchRuntime.procedures["${functionName}"](${args});\n`);

        // Process the next block if it exists
        if (block.next) {
            generateBlockCode(state, block.next);
        }
    }
}
