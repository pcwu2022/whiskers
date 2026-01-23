// Lexer - Token Extractors
// Functions for extracting different token types from the source code

import { Token, TokenType, SCRATCH_KEYWORDS, SCRATCH_OPERATORS } from "@/types";

export interface LexerState {
    code: string;
    position: number;
    line: number;
    column: number;
    tokens: Token[];
    indentLevels: number[];
}

/**
 * Create a new lexer state
 */
export function createLexerState(code: string): LexerState {
    return {
        code: code.endsWith("\n") ? code : code + "\n",
        position: 0,
        line: 1,
        column: 1,
        tokens: [],
        indentLevels: [0],
    };
}

/**
 * Add a token to the state
 */
export function addToken(state: LexerState, type: TokenType, value: string): void {
    state.tokens.push({
        type,
        value,
        line: state.line,
        column: state.column - value.length,
    });
}

/**
 * Advance position and update column
 */
export function advance(state: LexerState): void {
    state.position++;
    state.column++;
}

/**
 * Peek at the next character without advancing
 */
export function peek(state: LexerState): string {
    return state.position + 1 < state.code.length ? state.code[state.position + 1] : "\0";
}

/**
 * Get the current character
 */
export function currentChar(state: LexerState): string {
    return state.code[state.position];
}

/**
 * Check if we've reached the end of the code
 */
export function isAtEnd(state: LexerState): boolean {
    return state.position >= state.code.length;
}

/**
 * Extract a string literal from the input code
 */
export function extractString(state: LexerState): void {
    const quote = state.code[state.position];
    let value = "";

    // Skip the opening quote
    advance(state);

    // Collect characters until closing quote
    while (state.position < state.code.length && state.code[state.position] !== quote) {
        // Handle escape sequences
        if (state.code[state.position] === "\\" && state.position + 1 < state.code.length) {
            advance(state);

            // Handle specific escape sequences
            switch (state.code[state.position]) {
                case "n":
                    value += "\n";
                    break;
                case "t":
                    value += "\t";
                    break;
                case "r":
                    value += "\r";
                    break;
                default:
                    value += state.code[state.position];
            }
        } else {
            value += state.code[state.position];
        }

        advance(state);
    }

    // Handle the closing quote
    if (state.position < state.code.length) {
        advance(state); // Skip closing quote
    } else {
        throw new Error(`Unterminated string at line ${state.line}, column ${state.column}`);
    }

    addToken(state, TokenType.STRING, value);
}

/**
 * Extract a numeric literal from the input code
 */
export function extractNumber(state: LexerState): void {
    let value = "";
    let isFloat = false;

    // Handle negative sign
    if (state.code[state.position] === "-") {
        value += "-";
        advance(state);
    }

    // Collect digits and potential decimal point
    while (
        state.position < state.code.length &&
        (/[0-9]/.test(state.code[state.position]) || state.code[state.position] === ".")
    ) {
        if (state.code[state.position] === ".") {
            // Ensure only one decimal point
            if (isFloat) {
                break;
            }
            isFloat = true;
        }
        value += state.code[state.position];
        advance(state);
    }

    addToken(state, TokenType.NUMBER, value);
}

/**
 * Extract an operator from the input code
 */
export function extractOperator(state: LexerState): void {
    let value = state.code[state.position];
    advance(state);

    // Handle two-character operators (==, !=, >=, <=)
    if ((value === "=" || value === "!" || value === ">" || value === "<") && state.code[state.position] === "=") {
        value += "=";
        advance(state);
    }

    addToken(state, TokenType.OPERATOR, value);
}

/**
 * Extract an identifier or keyword from the input code
 */
export function extractIdentifier(state: LexerState): void {
    let value = "";

    // Collect valid identifier characters (letters, digits, underscores)
    while (
        state.position < state.code.length &&
        (/[a-zA-Z]/.test(state.code[state.position]) ||
            /[0-9]/.test(state.code[state.position]) ||
            state.code[state.position] === "_")
    ) {
        value += state.code[state.position];
        advance(state);
    }

    // Check if this is a keyword
    if (SCRATCH_KEYWORDS.has(value)) {
        addToken(state, TokenType.KEYWORD, value);
    } else {
        addToken(state, TokenType.IDENTIFIER, value);
    }
}

/**
 * Extract a comment from the input code (starting with //)
 */
export function extractComment(state: LexerState): void {
    let comment = "";

    // Skip the double slashes
    advance(state);
    advance(state);

    // Collect all characters until the end of the line
    while (
        state.position < state.code.length &&
        state.code[state.position] !== "\n" &&
        state.code[state.position] !== "\r"
    ) {
        comment += state.code[state.position];
        advance(state);
    }

    addToken(state, TokenType.COMMENT, comment);
}

/**
 * Check if the current character is an operator
 */
export function isOperator(char: string): boolean {
    return SCRATCH_OPERATORS.has(char);
}
