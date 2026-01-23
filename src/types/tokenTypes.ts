// Token Types - Defines all token types used by the lexer

export enum TokenType {
    IDENTIFIER = "IDENTIFIER",
    STRING = "STRING",
    NUMBER = "NUMBER",
    KEYWORD = "KEYWORD",
    OPERATOR = "OPERATOR",
    PARENTHESIS_OPEN = "PARENTHESIS_OPEN",
    PARENTHESIS_CLOSE = "PARENTHESIS_CLOSE",
    BRACKET_OPEN = "BRACKET_OPEN",
    BRACKET_CLOSE = "BRACKET_CLOSE",
    BRACE_OPEN = "BRACE_OPEN",
    BRACE_CLOSE = "BRACE_CLOSE",
    COLON = "COLON",
    COMMA = "COMMA",
    INDENT = "INDENT",
    DEDENT = "DEDENT",
    NEWLINE = "NEWLINE",
    COMMENT = "COMMENT",
    EOF = "EOF",
}

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}
