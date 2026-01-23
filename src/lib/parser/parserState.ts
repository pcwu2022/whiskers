// Parser - State and Utilities
// Core parser state management and utility functions

import { Token, TokenType, BlockNode } from "@/types";

export interface ParserState {
    tokens: Token[];
    position: number;
    blockStack: { block: BlockNode; indent: number }[];
    lastAtIndent: (BlockNode | null)[];
    indentLevel: number;
}

/**
 * Create a new parser state
 */
export function createParserState(tokens: Token[]): ParserState {
    return {
        tokens,
        position: 0,
        blockStack: [],
        lastAtIndent: [],
        indentLevel: 0,
    };
}

/**
 * Get the current token
 */
export function getCurrentToken(state: ParserState): Token {
    return state.tokens[state.position];
}

/**
 * Check if we've reached the end of the tokens
 */
export function isAtEnd(state: ParserState): boolean {
    return state.position >= state.tokens.length || getCurrentToken(state).type === TokenType.EOF;
}

/**
 * Advance to the next token and return the previous one
 */
export function advance(state: ParserState): Token {
    const token = getCurrentToken(state);
    if (!isAtEnd(state)) {
        state.position++;
    }
    return token;
}

/**
 * Look ahead at the next token without advancing
 */
export function peek(state: ParserState, offset: number = 1): Token | null {
    if (state.position + offset >= state.tokens.length) {
        return null;
    }
    return state.tokens[state.position + offset];
}

/**
 * Check if the current token's type matches the expected type
 */
export function match(state: ParserState, type: TokenType): boolean {
    if (isAtEnd(state)) return false;
    return getCurrentToken(state).type === type;
}

/**
 * Consume a token if it matches the expected type, otherwise throw an error
 */
export function consume(state: ParserState, type: TokenType, errorMessage: string): Token {
    if (match(state, type)) {
        return advance(state);
    }
    const current = getCurrentToken(state);
    throw new Error(`${errorMessage} at line ${current.line}, column ${current.column}`);
}

/**
 * Skip newlines and comments
 */
export function skipIrrelevant(state: ParserState): void {
    while (!isAtEnd(state) && (match(state, TokenType.NEWLINE) || match(state, TokenType.COMMENT))) {
        advance(state);
    }
}

/**
 * Skip tokens until a safe point to continue parsing
 */
export function synchronize(state: ParserState): void {
    advance(state);

    while (!isAtEnd(state)) {
        const current = getCurrentToken(state);
        
        // Skip until we find a keyword that could start a new statement
        if (
            current.type === TokenType.KEYWORD &&
            ["when", "var", "variable", "list", "define"].includes(current.value)
        ) {
            return;
        }

        // Skip until we find a newline, which might indicate a new statement
        if (current.type === TokenType.NEWLINE) {
            advance(state);
            return;
        }

        advance(state);
    }
}
