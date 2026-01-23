// Code Generator - Main Class
// Converts AST to JavaScript code with a Scratch-like runtime environment

import { Program, BlockNode } from "@/types";
import { GeneratorState, createGeneratorState } from "./generatorState";
import { generateBlockCode } from "./blockDispatcher";
import {
    generateRuntimeSupport,
    generateVariablesCode,
    generateListsCode,
    generateProceduresCode,
} from "./runtimeGenerator";
import { generateHTMLTemplate } from "@/templates";

export class CodeGenerator {
    private state: GeneratorState;

    constructor(program: Program) {
        this.state = createGeneratorState(program);
    }

    /**
     * Main method to generate the JavaScript and HTML code
     */
    generate(): { js: string; html: string } {
        // First pass to collect all custom procedures
        this.collectProcedures();

        // Generate the JavaScript code
        this.generateJavaScript();

        // Generate the HTML wrapper
        this.state.htmlOutput = generateHTMLTemplate(this.state.output);

        return {
            js: this.state.output,
            html: this.state.htmlOutput,
        };
    }

    /**
     * Collects all custom procedures defined in the program
     */
    private collectProcedures(): void {
        this.state.program.scripts.forEach((script) => {
            script.blocks.forEach((block) => {
                this.findProceduresInBlock(block);
            });
        });
    }

    /**
     * Recursively searches for procedure definitions in blocks
     */
    private findProceduresInBlock(block: BlockNode): void {
        if (block.type === "custom" && block.name === "defineFunction") {
            const procedureName = block.args[0] as string;
            const parameters = block.args.slice(1) as string[];
            this.state.procedures.set(procedureName, parameters);
        }

        if (block.next) {
            this.findProceduresInBlock(block.next);
        }
    }

    /**
     * Generates the JavaScript code from the AST
     */
    private generateJavaScript(): void {
        generateRuntimeSupport(this.state);
        generateVariablesCode(this.state);
        generateListsCode(this.state);
        generateProceduresCode(this.state);
        this.generateScriptsCode();
    }

    /**
     * Generates code for all scripts
     */
    private generateScriptsCode(): void {
        this.state.output += `// Scripts\n`;
        this.state.program.scripts.forEach((script, index) => {
            this.state.output += `// Script ${index + 1}\n`;
            script.blocks.forEach((block) => {
                generateBlockCode(this.state, block);
            });
            this.state.output += `\n`;
        });
    }
}
