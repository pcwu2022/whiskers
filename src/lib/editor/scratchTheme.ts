import type * as monaco from "monaco-editor";
import type { editor } from "monaco-editor";

// Define the custom Scratch theme for Monaco
export const scratchTheme: editor.IStandaloneThemeData = {
    base: "vs-dark",
    inherit: true,
    rules: [
        // Comments
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        
        // Scratch block categories with official colors
        { token: "keyword.scratch.event", foreground: "FFBF00", fontStyle: "bold" },      // Yellow
        { token: "keyword.scratch.motion", foreground: "4C97FF", fontStyle: "bold" },     // Blue
        { token: "keyword.scratch.looks", foreground: "9966FF", fontStyle: "bold" },      // Purple
        { token: "keyword.scratch.sound", foreground: "CF63CF", fontStyle: "bold" },      // Magenta
        { token: "keyword.scratch.control", foreground: "FFAB19", fontStyle: "bold" },    // Light Orange
        { token: "keyword.scratch.sensing", foreground: "5CB1D6", fontStyle: "bold" },    // Sky Blue
        { token: "keyword.scratch.variables", foreground: "FF8C1A", fontStyle: "bold" },  // Orange
        { token: "keyword.scratch.operators", foreground: "59C059", fontStyle: "bold" },  // Green
        { token: "keyword.scratch.custom", foreground: "FF6680", fontStyle: "bold" },     // Pink (My Blocks)
        { token: "keyword.scratch.pen", foreground: "0FBD8C", fontStyle: "bold" },        // Teal
        
        // Constants and special values
        { token: "constant.scratch", foreground: "CE9178" },
        { token: "constant.scratch.effect", foreground: "9966FF" },
        { token: "constant.scratch.rotation", foreground: "4C97FF" },
        
        // Operators
        { token: "operators.scratch", foreground: "59C059" },
        
        // Numbers
        { token: "number", foreground: "B5CEA8" },
        
        // Strings
        { token: "string", foreground: "CE9178" },
        { token: "string.color", foreground: "CE9178" },
        
        // Identifiers
        { token: "identifier", foreground: "9CDCFE" },
        
        // Delimiters
        { token: "delimiter.parenthesis", foreground: "D4D4D4" },
        { token: "delimiter.bracket", foreground: "FF8C1A" },
    ],
    colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
    },
};

// Function to register the Scratch theme
export function registerScratchTheme(monacoInstance: typeof monaco): void {
    monacoInstance.editor.defineTheme("scratch-dark", scratchTheme);
}
