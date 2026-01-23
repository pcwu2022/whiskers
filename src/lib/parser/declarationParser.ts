// Parser - Declaration Parsing
// Functions for parsing variable, list, and custom block declarations

import { Program, Script, TokenType } from "@/types";
import {
    ParserState,
    getCurrentToken,
    isAtEnd,
    advance,
    match,
    consume,
    skipIrrelevant,
} from "./parserState";
import { parseListLiteral } from "./blockParser";
import { parseScriptBlocks } from "./scriptParser";

/**
 * Parse a variable declaration
 */
export function parseVariableDeclaration(state: ParserState, program: Program): void {
    // Skip 'var' or 'variable' keyword
    advance(state);

    // Expect a variable name (identifier)
    const variableName = consume(state, TokenType.IDENTIFIER, "Expected variable name").value;

    // Check for initial value assignment
    let initialValue: string | number | object | undefined | null = 0;

    if (!isAtEnd(state) && match(state, TokenType.OPERATOR) && getCurrentToken(state).value === "=") {
        advance(state); // Skip '='

        // Parse the initial value
        if (match(state, TokenType.NUMBER)) {
            initialValue = parseFloat(advance(state).value);
        } else if (match(state, TokenType.STRING)) {
            initialValue = advance(state).value;
        } else if (match(state, TokenType.IDENTIFIER)) {
            initialValue = advance(state).value;
        } else {
            advance(state);
        }
    }

    // Add the variable to the program
    program.variables.set(variableName, initialValue);

    // Skip to the end of the declaration (usually a newline)
    while (!isAtEnd(state) && !match(state, TokenType.NEWLINE)) {
        advance(state);
    }
}

/**
 * Parse a list declaration
 */
export function parseListDeclaration(state: ParserState, program: Program): void {
    // Skip 'list' keyword
    advance(state);

    // Expect a list name (identifier)
    const listName = consume(state, TokenType.IDENTIFIER, "Expected list name").value;

    // Initialize with an empty list
    let listValues: (string | number | object | undefined | null)[] = [];

    // Check for initial values
    if (!isAtEnd(state) && match(state, TokenType.OPERATOR) && getCurrentToken(state).value === "=") {
        advance(state); // Skip '='

        // Parse list initialization
        if (match(state, TokenType.BRACKET_OPEN)) {
            listValues = parseListLiteral(state) as (string | number | object | undefined | null)[];
        }
    }

    // Add the list to the program
    program.lists.set(listName, listValues);

    // Skip to the end of the declaration (usually a newline)
    while (!isAtEnd(state) && !match(state, TokenType.NEWLINE)) {
        advance(state);
    }
}

/**
 * Parse a custom block definition (procedure)
 */
export function parseCustomBlockDefinition(state: ParserState, program: Program): void {
    // Skip 'define' keyword
    advance(state);

    // Expect the block name (identifier)
    const blockName = consume(state, TokenType.IDENTIFIER, "Expected custom block name").value;

    // Parse parameter list if available
    const parameters: string[] = [];

    if (!isAtEnd(state) && match(state, TokenType.PARENTHESIS_OPEN)) {
        advance(state); // Skip '('

        // Parse parameters until closing parenthesis
        while (!isAtEnd(state) && !match(state, TokenType.PARENTHESIS_CLOSE)) {
            if (match(state, TokenType.IDENTIFIER)) {
                parameters.push(advance(state).value);
            } else if (match(state, TokenType.COMMA)) {
                advance(state);
            } else {
                advance(state);
            }
        }

        if (!isAtEnd(state)) {
            advance(state); // Skip ')'
        }
    }

    // Create a custom block script
    const customScript: Script = {
        blocks: [],
    };

    // Parse the custom block body
    skipIrrelevant(state);

    if (!isAtEnd(state) && match(state, TokenType.INDENT)) {
        advance(state); // Skip indent

        // Reset indentation for parsing this block
        const oldIndentLevel = state.indentLevel;
        state.indentLevel = 1;

        // Parse the body of the custom block
        parseScriptBlocks(state, customScript);

        // Restore indentation level
        state.indentLevel = oldIndentLevel;
    }

    // Add this custom block to the program
    customScript.blocks.unshift({
        type: "custom",
        name: "define",
        args: [blockName, ...parameters],
    });

    program.scripts.push(customScript);
}
