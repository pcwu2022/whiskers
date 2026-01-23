// Code Generator - Variables Blocks
// Generates JavaScript code for variables blocks (set, change, etc.)

import { BlockNode } from "@/types";
import { GeneratorState, write, formatArg } from "../generatorState";
import { generateBlockCode } from "../blockDispatcher";

export function generateVariablesBlock(state: GeneratorState, block: BlockNode): void {
    switch (block.name) {
        case "set":
            write(state, `scratchRuntime.variables["${block.args[0]}"] = ${formatArg(state, block.args[1])};\n`);
            break;
        case "change":
            write(state, `scratchRuntime.variables["${block.args[0]}"] = Number(scratchRuntime.variables["${block.args[0]}"]) + Number(${formatArg(state, block.args[1])});\n`);
            break;
        case "showVariable":
            generateShowVariable(state, block);
            break;
        case "hideVariable":
            write(state, `// Hide variable in the UI\n`);
            write(state, `const varDisplay = document.getElementById('var-${block.args[0]}');\n`);
            write(state, `if (varDisplay) varDisplay.style.display = 'none';\n`);
            break;
        case "addToList":
            write(state, `// Add item to list\n`);
            write(state, `if (!scratchRuntime.lists["${block.args[0]}"]) scratchRuntime.lists["${block.args[0]}"] = [];\n`);
            write(state, `scratchRuntime.lists["${block.args[0]}"].push(${formatArg(state, block.args[1])});\n`);
            break;
        case "deleteFromList":
            generateDeleteFromList(state, block);
            break;
        case "insertInList":
            generateInsertInList(state, block);
            break;
        case "replaceInList":
            generateReplaceInList(state, block);
            break;
        case "itemOfList":
            write(state, `(scratchRuntime.lists["${block.args[0]}"] && ${formatArg(state, block.args[1])} > 0 && ${formatArg(state, block.args[1])} <= scratchRuntime.lists["${block.args[0]}"].length ? scratchRuntime.lists["${block.args[0]}"][${formatArg(state, block.args[1])} - 1] : "")`);
            break;
        case "lengthOfList":
            write(state, `(scratchRuntime.lists["${block.args[0]}"] ? scratchRuntime.lists["${block.args[0]}"].length : 0)`);
            break;
        case "listContains":
            write(state, `(scratchRuntime.lists["${block.args[0]}"] ? scratchRuntime.lists["${block.args[0]}"].includes(${formatArg(state, block.args[1])}) : false)`);
            break;
        default:
            write(state, `// Unsupported variables block: ${block.name}\n`);
    }

    if (block.next) {
        generateBlockCode(state, block.next);
    }
}

function generateShowVariable(state: GeneratorState, block: BlockNode): void {
    const showVarName = block.args[0];
    write(state, `// Show variable in the UI\n`);
    write(state, `(() => {\n`);
    state.indent++;
    write(state, `const varDisplay = document.getElementById('var-${showVarName}');\n`);
    write(state, `if (!varDisplay) {\n`);
    state.indent++;
    write(state, `const newVarDisplay = document.createElement('div');\n`);
    write(state, `newVarDisplay.id = 'var-${showVarName}';\n`);
    write(state, `newVarDisplay.className = 'scratch-variable';\n`);
    write(state, `newVarDisplay.style.position = 'absolute';\n`);
    write(state, `newVarDisplay.style.top = '10px';\n`);
    write(state, `newVarDisplay.style.left = '10px';\n`);
    write(state, `newVarDisplay.style.backgroundColor = 'rgba(255,255,255,0.7)';\n`);
    write(state, `newVarDisplay.style.padding = '5px';\n`);
    write(state, `newVarDisplay.style.borderRadius = '5px';\n`);
    write(state, `newVarDisplay.textContent = '${showVarName}: ' + scratchRuntime.variables["${showVarName}"];\n`);
    write(state, `document.getElementById('stage').appendChild(newVarDisplay);\n`);
    state.indent--;
    write(state, `} else {\n`);
    state.indent++;
    write(state, `varDisplay.style.display = 'block';\n`);
    state.indent--;
    write(state, `}\n`);
    state.indent--;
    write(state, `})();\n`);
}

function generateDeleteFromList(state: GeneratorState, block: BlockNode): void {
    const deleteIndex = formatArg(state, block.args[1]);
    write(state, `// Delete item from list\n`);
    write(state, `if (scratchRuntime.lists["${block.args[0]}"] && ${deleteIndex} > 0 && ${deleteIndex} <= scratchRuntime.lists["${block.args[0]}"].length) {\n`);
    state.indent++;
    write(state, `scratchRuntime.lists["${block.args[0]}"].splice(${deleteIndex} - 1, 1);\n`);
    state.indent--;
    write(state, `}\n`);
}

function generateInsertInList(state: GeneratorState, block: BlockNode): void {
    const insertValue = formatArg(state, block.args[1]);
    const insertIndex = formatArg(state, block.args[2]);
    write(state, `// Insert item in list\n`);
    write(state, `if (!scratchRuntime.lists["${block.args[0]}"]) scratchRuntime.lists["${block.args[0]}"] = [];\n`);
    write(state, `if (${insertIndex} > 0 && ${insertIndex} <= scratchRuntime.lists["${block.args[0]}"].length + 1) {\n`);
    state.indent++;
    write(state, `scratchRuntime.lists["${block.args[0]}"].splice(${insertIndex} - 1, 0, ${insertValue});\n`);
    state.indent--;
    write(state, `}\n`);
}

function generateReplaceInList(state: GeneratorState, block: BlockNode): void {
    const replaceIndex = formatArg(state, block.args[1]);
    const replaceValue = formatArg(state, block.args[2]);
    write(state, `// Replace item in list\n`);
    write(state, `if (scratchRuntime.lists["${block.args[0]}"] && ${replaceIndex} > 0 && ${replaceIndex} <= scratchRuntime.lists["${block.args[0]}"].length) {\n`);
    state.indent++;
    write(state, `scratchRuntime.lists["${block.args[0]}"][${replaceIndex} - 1] = ${replaceValue};\n`);
    state.indent--;
    write(state, `}\n`);
}
