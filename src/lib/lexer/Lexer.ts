// Lexer - Main Class
// Tokenizes Scratch-like code into tokens for parsing

import { Token, TokenType } from "@/types";
import {
    LexerState,
    createLexerState,
    addToken,
    advance,
    peek,
    currentChar,
    isAtEnd,
    extractString,
    extractNumber,
    extractOperator,
    extractIdentifier,
    extractComment,
    isOperator,
} from "./extractors";
import { handleIndentation, handleNewline, closeRemainingIndents } from "./indentation";
import { isAlpha, isNumeric } from "./charUtils";

export class Lexer {
    private state: LexerState;

    constructor(code: string) {
        this.state = createLexerState(code);
    }

    /**
     * Main method to convert the input code into an array of tokens
     */
    tokenize(): Token[] {
        // Loop through the code until the end is reached
        while (!isAtEnd(this.state)) {
            // Process indentation at the beginning of each line
            if (this.state.column === 1) {
                handleIndentation(this.state);
            }

            // Get the current character at the current position
            const char = currentChar(this.state);

            // Check the type of the current character and process accordingly
            if (char === " " || char === "\t") {
                // Skip spaces and tabs (already handled in indentation)
                advance(this.state);
            } else if (char === "\n" || char === "\r") {
                handleNewline(this.state);
            } else if (char === "/" && this.state.code[this.state.position + 1] === "/") {
                extractComment(this.state);
            } else if (char === "(") {
                addToken(this.state, TokenType.PARENTHESIS_OPEN, char);
                advance(this.state);
            } else if (char === ")") {
                addToken(this.state, TokenType.PARENTHESIS_CLOSE, char);
                advance(this.state);
            } else if (char === "[") {
                addToken(this.state, TokenType.BRACKET_OPEN, char);
                advance(this.state);
            } else if (char === "]") {
                addToken(this.state, TokenType.BRACKET_CLOSE, char);
                advance(this.state);
            } else if (char === "{") {
                addToken(this.state, TokenType.BRACE_OPEN, char);
                advance(this.state);
            } else if (char === "}") {
                addToken(this.state, TokenType.BRACE_CLOSE, char);
                advance(this.state);
            } else if (char === ":") {
                addToken(this.state, TokenType.COLON, char);
                advance(this.state);
            } else if (char === ",") {
                addToken(this.state, TokenType.COMMA, char);
                advance(this.state);
            } else if (char === '"' || char === "'") {
                extractString(this.state);
            } else if (isNumeric(char) || (char === "-" && isNumeric(peek(this.state)))) {
                extractNumber(this.state);
            } else if (isOperator(char)) {
                extractOperator(this.state);
            } else if (isAlpha(char)) {
                extractIdentifier(this.state);
            } else {
                // Skip any unknown characters
                advance(this.state);
            }
        }

        // Close any remaining indentation levels
        closeRemainingIndents(this.state);

        // Add EOF token
        addToken(this.state, TokenType.EOF, "");

        return this.state.tokens;
    }
}
