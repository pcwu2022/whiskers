// Parser - Block Parsing
// Functions for parsing individual blocks

import { BlockNode, BlockType, TokenType, BLOCK_TYPE_MAP, BLOCK_START_KEYWORDS } from "@/types";
import {
    ParserState,
    getCurrentToken,
    isAtEnd,
    advance,
    match,
    consume,
    skipIrrelevant,
} from "./parserState";

/**
 * Checks if the current token can start a block
 */
export function isBlockStart(state: ParserState): boolean {
    if (!match(state, TokenType.KEYWORD)) return false;
    return BLOCK_START_KEYWORDS.includes(getCurrentToken(state).value);
}

/**
 * Determine the type of block based on its keyword
 */
export function determineBlockType(keyword: string): BlockType {
    return BLOCK_TYPE_MAP[keyword] || "custom";
}

/**
 * Parse a single block
 */
export function parseBlock(state: ParserState): BlockNode | null {
    // Check if the current token can start a block
    if (!isBlockStart(state)) {
        return null;
    }

    // Get the block name (keyword)
    let blockKeyword = consume(state, TokenType.KEYWORD, "Expected block keyword").value;

    // Normalize multi-word block keywords
    if (blockKeyword === "turn") {
        skipIrrelevant(state);
        if (!isAtEnd(state) && match(state, TokenType.KEYWORD)) {
            const value = getCurrentToken(state).value;
            if (value === "right" || value === "left") {
                const dir = advance(state).value;
                blockKeyword = dir === "right" ? "turnRight" : "turnLeft";
            }
        }
    } else if (blockKeyword === "repeat") {
        skipIrrelevant(state);
        if (!isAtEnd(state) && match(state, TokenType.KEYWORD) && getCurrentToken(state).value === "until") {
            advance(state);
            blockKeyword = "repeatUntil";
        }
    }

    // Determine the block type based on the keyword
    const blockType: BlockType = determineBlockType(blockKeyword);

    // Parse block arguments
    const args = parseBlockArguments(state);

    // Create the block node
    const block: BlockNode = {
        type: blockType,
        name: blockKeyword,
        args,
    };

    // Handle special case for if-else blocks
    if (blockKeyword === "if") {
        skipIrrelevant(state);
        if (!isAtEnd(state) && match(state, TokenType.KEYWORD) && getCurrentToken(state).value === "else") {
            advance(state); // Consume 'else'

            // Parse the else block
            const elseBlock = parseBlock(state);
            if (elseBlock) {
                block.args.push("else");
                block.args.push(elseBlock);
            }
        }
    }

    return block;
}

/**
 * Parse arguments for a block based on its type
 */
export function parseBlockArguments(state: ParserState): (string | number | BlockNode)[] {
    const args: (string | number | BlockNode)[] = [];

    // Continue parsing arguments until we hit a new block, indentation change, or end of line
    while (!isAtEnd(state)) {
        skipIrrelevant(state);

        if (isAtEnd(state)) break;

        // Stop if we encounter a new block start, indent, or dedent
        if (
            match(state, TokenType.INDENT) ||
            match(state, TokenType.DEDENT) ||
            (match(state, TokenType.KEYWORD) && isBlockStart(state))
        ) {
            break;
        }

        // Parse different types of arguments
        if (match(state, TokenType.STRING)) {
            args.push(advance(state).value);
        } else if (match(state, TokenType.NUMBER)) {
            args.push(parseFloat(advance(state).value));
        } else if (match(state, TokenType.IDENTIFIER)) {
            args.push(advance(state).value);
        } else if (match(state, TokenType.PARENTHESIS_OPEN)) {
            args.push(parseExpression(state));
        } else if (match(state, TokenType.BRACKET_OPEN)) {
            const listValues = parseListLiteral(state);
            args.push({
                type: "operators",
                name: "list",
                args: listValues,
            });
        } else if (match(state, TokenType.KEYWORD)) {
            args.push(advance(state).value);
        } else if (match(state, TokenType.OPERATOR)) {
            args.push(advance(state).value);
        } else {
            advance(state);
        }
    }

    return args;
}

/**
 * Parse a parenthesized expression
 */
export function parseExpression(state: ParserState): BlockNode {
    consume(state, TokenType.PARENTHESIS_OPEN, "Expected '('");

    const args: (string | number | BlockNode)[] = [];

    while (!isAtEnd(state) && !match(state, TokenType.PARENTHESIS_CLOSE)) {
        if (match(state, TokenType.STRING)) {
            args.push(advance(state).value);
        } else if (match(state, TokenType.NUMBER)) {
            args.push(parseFloat(advance(state).value));
        } else if (match(state, TokenType.IDENTIFIER)) {
            args.push(advance(state).value);
        } else if (match(state, TokenType.OPERATOR)) {
            args.push(advance(state).value);
        } else if (match(state, TokenType.PARENTHESIS_OPEN)) {
            args.push(parseExpression(state));
        } else {
            advance(state);
        }
    }

    consume(state, TokenType.PARENTHESIS_CLOSE, "Expected ')'");

    return {
        type: "operators",
        name: "expression",
        args,
    };
}

/**
 * Parse a list literal [value1, value2, ...]
 */
export function parseListLiteral(state: ParserState): (string | number)[] {
    consume(state, TokenType.BRACKET_OPEN, "Expected '['");

    const values: (string | number)[] = [];

    while (!isAtEnd(state) && !match(state, TokenType.BRACKET_CLOSE)) {
        if (match(state, TokenType.COMMA)) {
            advance(state);
            continue;
        }

        if (match(state, TokenType.STRING)) {
            values.push(advance(state).value);
        } else if (match(state, TokenType.NUMBER)) {
            values.push(parseFloat(advance(state).value));
        } else if (match(state, TokenType.IDENTIFIER)) {
            values.push(advance(state).value);
        } else {
            advance(state);
        }
    }

    consume(state, TokenType.BRACKET_CLOSE, "Expected ']'");

    return values;
}
