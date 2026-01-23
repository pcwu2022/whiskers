// Parser - Main Class
// Converts tokens to an AST (Abstract Syntax Tree)

import { Program, Token, TokenType } from "@/types";
import {
    ParserState,
    createParserState,
    getCurrentToken,
    isAtEnd,
    advance,
    match,
    skipIrrelevant,
    synchronize,
} from "./parserState";
import { parseScript } from "./scriptParser";
import { parseVariableDeclaration, parseListDeclaration, parseCustomBlockDefinition } from "./declarationParser";

export class Parser {
    private state: ParserState;

    constructor(tokens: Token[]) {
        this.state = createParserState(tokens);
    }

    /**
     * Main method to generate the AST (Program)
     */
    parse(): Program {
        const program: Program = {
            scripts: [],
            variables: new Map(),
            lists: new Map(),
        };

        // Skip any initial newlines or comments
        skipIrrelevant(this.state);

        // Loop through the tokens until we reach the end
        while (!isAtEnd(this.state)) {
            try {
                skipIrrelevant(this.state);

                if (isAtEnd(this.state)) break;

                if (match(this.state, TokenType.KEYWORD)) {
                    const keyword = getCurrentToken(this.state).value;

                    if (keyword === "when") {
                        const script = parseScript(this.state);
                        program.scripts.push(script);
                    } else if (keyword === "var" || keyword === "variable") {
                        parseVariableDeclaration(this.state, program);
                    } else if (keyword === "list") {
                        parseListDeclaration(this.state, program);
                    } else if (keyword === "define") {
                        parseCustomBlockDefinition(this.state, program);
                    } else {
                        advance(this.state);
                    }
                } else {
                    advance(this.state);
                }
            } catch (error) {
                console.error(error);
                synchronize(this.state);
            }
        }

        return program;
    }
}
