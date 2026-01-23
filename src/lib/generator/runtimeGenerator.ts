// Code Generator - Runtime Generator
// Generates the runtime support code for the Scratch program

import { GeneratorState, write } from "./generatorState";
import { SCRATCH_RUNTIME } from "@/templates";

/**
 * Generates the runtime support functions
 */
export function generateRuntimeSupport(state: GeneratorState): void {
    state.output = SCRATCH_RUNTIME;
}

/**
 * Generates code for variables
 */
export function generateVariablesCode(state: GeneratorState): void {
    state.output += `// Variables\n`;
    if (state.program.variables.size > 0) {
        state.program.variables.forEach((value, name) => {
            if (typeof value === "number") {
                state.output += `scratchRuntime.variables["${name}"] = ${value};\n`;
            } else if (typeof value === "string") {
                state.output += `scratchRuntime.variables["${name}"] = "${value}";\n`;
            } else {
                state.output += `scratchRuntime.variables["${name}"] = ${JSON.stringify(value)};\n`;
            }
        });
    } else {
        state.output += `// No variables defined\n`;
    }
    state.output += `\n`;
}

/**
 * Generates code for lists
 */
export function generateListsCode(state: GeneratorState): void {
    state.output += `// Lists\n`;
    if (state.program.lists.size > 0) {
        state.program.lists.forEach((values, name) => {
            const formattedValues = values.map((v) => (typeof v === "number" ? v : `"${v}"`)).join(", ");
            state.output += `scratchRuntime.lists["${name}"] = [${formattedValues}];\n`;
        });
    } else {
        state.output += `// No lists defined\n`;
    }
    state.output += `\n`;
}

/**
 * Generates code for custom procedures
 */
export function generateProceduresCode(state: GeneratorState): void {
    state.output += `// Custom Procedures\n`;
    if (state.procedures.size > 0) {
        state.procedures.forEach((params, name) => {
            const paramList = params.join(", ");
            state.output += `scratchRuntime.procedures["${name}"] = function(${paramList}) {\n`;
            state.indent++;
            write(state, `// Function body will be generated during script processing\n`);
            state.indent--;
            state.output += `};\n\n`;
        });
    } else {
        state.output += `// No procedures defined\n`;
    }
    state.output += `\n`;
}
