// Lexer - Indentation Handler
// Functions for handling Python-style indentation

import { TokenType } from "@/types";
import { LexerState, addToken, advance } from "./extractors";

/**
 * Process indentation at the beginning of a line
 */
export function handleIndentation(state: LexerState): void {
    let spaces = 0;

    // Count the leading spaces and tabs (tabs count as 4 spaces)
    while (state.position < state.code.length) {
        const char = state.code[state.position];
        if (char === " ") {
            spaces++;
            advance(state);
        } else if (char === "\t") {
            spaces += 4; // Tab counts as 4 spaces
            advance(state);
        } else {
            break;
        }
    }

    // Skip empty lines and comments
    if (
        state.code[state.position] === "\n" ||
        state.code[state.position] === "\r" ||
        (state.code[state.position] === "/" && state.code[state.position + 1] === "/")
    ) {
        return;
    }

    const currentIndent = state.indentLevels[state.indentLevels.length - 1];

    if (spaces > currentIndent) {
        // Increase in indentation level
        state.indentLevels.push(spaces);
        addToken(state, TokenType.INDENT, " ".repeat(spaces - currentIndent));
    } else if (spaces < currentIndent) {
        // Decrease in indentation level - may need multiple DEDENT tokens
        while (state.indentLevels.length > 1 && state.indentLevels[state.indentLevels.length - 1] > spaces) {
            state.indentLevels.pop();
            addToken(state, TokenType.DEDENT, "");
        }

        // Inconsistent indentation
        if (state.indentLevels[state.indentLevels.length - 1] !== spaces) {
            throw new Error(`Inconsistent indentation at line ${state.line}`);
        }
    }
}

/**
 * Handle newline characters (\n or \r\n)
 */
export function handleNewline(state: LexerState): void {
    // Skip carriage return in \r\n
    if (state.code[state.position] === "\r") {
        advance(state);
    }

    // Handle the newline character
    if (state.code[state.position] === "\n") {
        addToken(state, TokenType.NEWLINE, "\n");
        advance(state);
        // Reset column and increment line after newline
        state.line++;
        state.column = 1;
    }
}

/**
 * Close any remaining indentation levels at the end of the file
 */
export function closeRemainingIndents(state: LexerState): void {
    while (state.indentLevels.length > 1) {
        state.indentLevels.pop();
        addToken(state, TokenType.DEDENT, "");
    }
}
