// Parser - Script Parsing
// Functions for parsing scripts (sequences of blocks)

import { Script, TokenType } from "@/types";
import {
    ParserState,
    isAtEnd,
    advance,
    match,
    skipIrrelevant,
    getCurrentToken,
} from "./parserState";
import { parseBlock, isBlockStart } from "./blockParser";

/**
 * Parse a script (sequence of blocks)
 */
export function parseScript(state: ParserState): Script {
    const script: Script = {
        blocks: [],
    };

    // Reset the block stack for this script
    state.blockStack = [];
    state.lastAtIndent = [];
    state.indentLevel = 0;

    // Parse the first block (usually an event block)
    const firstBlock = parseBlock(state);
    if (firstBlock) {
        script.blocks.push(firstBlock);
        state.blockStack.push({ block: firstBlock, indent: 0 });
        state.lastAtIndent[0] = firstBlock;

        // Parse subsequent blocks
        parseScriptBlocks(state, script);
    }

    return script;
}

/**
 * Parse all blocks in a script after the first block
 */
export function parseScriptBlocks(state: ParserState, script: Script): void {
    while (!isAtEnd(state)) {
        skipIrrelevant(state);

        if (isAtEnd(state)) break;

        // If we're at indent level 0 and encounter a new "when" block, 
        // this is a NEW script - stop parsing current script
        if (state.indentLevel === 0 && match(state, TokenType.KEYWORD)) {
            const keyword = getCurrentToken(state).value;
            if (keyword === "when" || keyword === "define" || keyword === "var" || keyword === "list" || keyword === "variable") {
                // Don't consume this token - let the main parser handle it as a new script
                break;
            }
        }

        if (match(state, TokenType.INDENT)) {
            handleIndent(state);
        } else if (match(state, TokenType.DEDENT)) {
            if (!handleDedent(state)) break;
        } else if (isBlockStart(state)) {
            handleBlockAtCurrentLevel(state, script);
        } else {
            advance(state);
        }
    }
}

/**
 * Handle an increase in indentation
 */
function handleIndent(state: ParserState): void {
    state.indentLevel++;
    advance(state);

    if (!state.blockStack.length) {
        return;
    }

    const parentEntry = state.blockStack[state.blockStack.length - 1];
    const parentBlock = parentEntry.block;

    // Parse the first nested block in this indented region
    const firstNestedBlock = parseBlock(state);
    if (!firstNestedBlock) {
        return;
    }

    // Attach the nested sequence to the parent block
    if (parentBlock.type === "event" || parentBlock.name === "when") {
        parentBlock.next = firstNestedBlock;
    } else {
        parentBlock.args.push(firstNestedBlock);
    }

    // Track the first block at this indent level
    state.lastAtIndent[state.indentLevel] = firstNestedBlock;
    state.blockStack.push({ block: firstNestedBlock, indent: state.indentLevel });

    // Parse additional sibling blocks at the same indentation level
    let currentBlock = firstNestedBlock;
    while (!isAtEnd(state) && !match(state, TokenType.DEDENT)) {
        skipIrrelevant(state);
        if (isAtEnd(state) || match(state, TokenType.DEDENT)) break;

        if (isBlockStart(state)) {
            const nextBlock = parseBlock(state);
            if (nextBlock) {
                currentBlock.next = nextBlock;
                currentBlock = nextBlock;
                state.lastAtIndent[state.indentLevel] = nextBlock;
                state.blockStack.push({ block: nextBlock, indent: state.indentLevel });
            }
        } else {
            advance(state);
        }
    }
}

/**
 * Handle a decrease in indentation
 * Returns false if we should break out of the parsing loop
 */
function handleDedent(state: ParserState): boolean {
    advance(state);
    state.indentLevel = Math.max(0, state.indentLevel - 1);

    // Pop any blocks that belonged to deeper indentation levels
    while (state.blockStack.length && state.blockStack[state.blockStack.length - 1].indent > state.indentLevel) {
        state.blockStack.pop();
    }

    // Clear lastAtIndent entries deeper than current indent
    for (let i = state.lastAtIndent.length - 1; i > state.indentLevel; i--) {
        state.lastAtIndent[i] = null;
    }

    // If we've reduced indentation below our starting level, we're done with this script
    if (state.indentLevel <= 0) {
        state.indentLevel = 0;
        if (state.blockStack.length <= 1) return false;
    }

    return true;
}

/**
 * Handle a new block at the current indentation level
 */
function handleBlockAtCurrentLevel(state: ParserState, script: Script): void {
    const block = parseBlock(state);
    if (block) {
        const last = state.lastAtIndent[state.indentLevel];
        if (last) {
            last.next = block;
        } else {
            script.blocks.push(block);
        }

        state.lastAtIndent[state.indentLevel] = block;
        state.blockStack.push({ block, indent: state.indentLevel });
    }
}
