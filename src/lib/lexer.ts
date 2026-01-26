// Text-Based Scratch Compiler: Lexer
// This class, Lexer, is responsible for converting the input text (Scratch-like code)
// into a sequence of tokens. Tokens are the smallest units of the programming language
// that have meaning, such as keywords, identifiers, numbers, and symbols.
// The lexer processes the code character by character and groups them into these tokens.

import { Token, TokenType, CompilerError, ErrorCodes } from "@/types/compilerTypes";

export class Lexer {
    // The input code string.
    private code: string;
    // The current position in the input code string.
    private position: number = 0;
    // The array of tokens generated from the input code.
    private tokens: Token[] = [];
    // Current line number (for error reporting)
    private line: number = 1;
    // Current column number (for error reporting)
    private column: number = 1;
    // Track indentation levels
    private indentLevels: number[] = [0];
    // Collection of errors found during lexing
    private errors: CompilerError[] = [];
    
    // Reserved keywords that cannot be used as variable names
    public static readonly RESERVED_KEYWORDS: Set<string> = new Set([
        // Effect names
        "color", "fisheye", "whirl", "pixelate", "mosaic", "brightness", "ghost",
        // Special targets
        "mouse-pointer", "random", "edge", "myself",
        // Control flow
        "if", "then", "else", "end", "repeat", "forever", "until", "wait", "stop",
        "all", "this", "script", "other", "scripts", "clone", "when", "and", "or", "not",
        // Declaration keywords
        "var", "list",
        // Block keywords
        "set", "change", "to", "by", "of", "at", "with", "for", "seconds", "steps", "degrees",
        // Boolean
        "true", "false",
    ]);
    
    // Scratch keywords - comprehensive list based on Scratch 3.0
    private keywords: Set<string> = new Set([
        // Event keywords
        "when",
        "flag",
        "flagClicked",
        "green",
        "clicked",
        "pressed",
        "backdrop",
        "switches",
        "receive",
        "broadcast",
        "loudness",
        "video",
        "motion",
        "I",  // For "when I receive" and "when I start as a clone"
        
        // Control keywords
        "forever",
        "if",
        "else",
        "then",
        "repeat",
        "until",
        "wait",
        "stop",
        "all",
        "this",
        "script",
        "other",
        "scripts",
        "clone",
        "create",
        "delete",
        "myself",
        "start",
        "as",
        "a",  // For "when I start as a clone"
        
        // Motion keywords
        "move",
        "steps",
        "turn",
        "right",
        "left",
        "degrees",
        "go",
        "goto",
        "glide",
        "secs",
        "point",
        "in",
        "towards",
        "direction",
        "x",
        "y",
        "position",
        "edge",
        "bounce",
        "rotation",
        "style",
        "around",
        "don't",
        "rotate",
        
        // Looks keywords
        "say",
        "for",
        "seconds",
        "think",
        "switch",
        "costume",
        "next",
        "change",
        "effect",
        "color",
        "fisheye",
        "whirl",
        "pixelate",
        "mosaic",
        "brightness",
        "ghost",
        "clear",
        "graphic",
        "effects",
        "set",
        "size",
        "show",
        "hide",
        "layer",
        "front",
        "back",
        "forward",
        "backward",
        "layers",
        "number",
        "name",
        
        // Sound keywords
        "play",
        "sound",
        "sounds",
        "done",
        "volume",
        
        // Sensing keywords
        "touching",
        "mouse-pointer",
        "mouse",
        "ask",
        "answer",
        "key",
        "pressed",
        "down",
        "distance",
        "reset",
        "timer",
        "drag",
        "mode",
        
        // Key names for "when X key pressed"
        "space",
        "up",
        "arrow",
        "left",
        "right",
        "any",
        "draggable",
        "username",
        "current",
        "year",
        "month",
        "date",
        "day",
        "week",
        "dayofweek",
        "hour",
        "minute",
        "second",
        "days",
        "since",
        "2000",
        "contains",
        
        // Operators keywords
        "and",
        "or",
        "not",
        "join",
        "letter",
        "of",
        "length",
        "mod",
        "round",
        "abs",
        "floor",
        "ceiling",
        "sqrt",
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "ln",
        "log",
        "e",
        "pow",
        "pick",
        "random",
        "between",
        "to",
        
        // Variables keywords
        "variable",
        "var",
        "by",
        
        // Lists keywords
        "list",
        "add",
        "item",
        "delete",
        "insert",
        "at",
        "replace",
        "with",
        
        // Custom blocks keywords
        "define",
        "procedure",
        "return",
        "run",
        "without",
        "screen",
        "refresh",
        
        // Pen extension keywords (optional)
        "pen",
        "up",
        "erase",
        "stamp",
        
        // Special values
        "true",
        "false",
        "null",
        "sprite",
        "random",
        "edge",
        "on",
        "off",
        "flipped",
        "transparency",
    ]);
    // Scratch operators
    private operators: Set<string> = new Set([
        "+",
        "-",
        "*",
        "/",
        "%",
        "=",
        ">",
        "<",
        ">=",
        "<=",
        "==",
        "!=",
        "&",
        "|",
        "!",
    ]);

    // Constructor: Initializes the Lexer with the input code.
    constructor(code: string) {
        // Add a newline at the end if it doesn't exist to handle final indentation
        this.code = code.endsWith("\n") ? code : code + "\n";
    }

    // Get collected errors
    getErrors(): CompilerError[] {
        return this.errors;
    }

    // Add an error
    private addError(code: string, message: string, suggestion?: string): void {
        this.errors.push({
            code,
            message,
            line: this.line,
            column: this.column,
            severity: "error",
            suggestion,
        });
    }

    // tokenize: Main method to convert the input code into an array of tokens.
    tokenize(): Token[] {
        // Loop through the code until the end is reached.
        while (this.position < this.code.length) {
            // Process indentation at the beginning of each line
            if (this.column === 1) {
                this.handleIndentation();
            }

            // Get the current character at the current position.
            const char = this.code[this.position];

            // Check the type of the current character and process accordingly
            if ([" ", "\t"].includes(char)) {
                // Skip spaces and tabs (already handled in indentation)
                this.advance();
            } else if (char === "\n" || char === "\r") {
                this.handleNewline();
            } else if (char === "/" && this.code[this.position + 1] === "/") {
                this.extractComment();
            } else if (char === "(") {
                // Check for empty parentheses
                this.handleOpenParen();
            } else if (char === ")") {
                this.addToken(TokenType.PARENTHESIS_CLOSE, char);
                this.advance();
            } else if (char === "[") {
                // Check if this is a valid list initialization []
                this.handleOpenBracket();
            } else if (char === "]") {
                // Standalone closing bracket - error unless we're in list init
                this.addToken(TokenType.BRACKET_CLOSE, char);
                this.advance();
            } else if (char === "{" || char === "}") {
                // Curly braces are not allowed
                this.addError(
                    ErrorCodes.INVALID_CURLY_BRACKET,
                    `Curly braces '${char}' are not allowed in Scratch syntax.`,
                    "Remove the curly braces. Use indentation and 'end' to define code blocks."
                );
                this.advance();
            } else if (char === "<" || char === ">") {
                // Check if this is a comparison operator or an invalid angle bracket
                this.handleAngleBracket();
            } else if (char === ":") {
                this.addToken(TokenType.COLON, char);
                this.advance();
            } else if (char === ",") {
                this.addToken(TokenType.COMMA, char);
                this.advance();
            } else if (char === '"' || char === "'") {
                this.extractString();
            } else if (this.isNumeric(char) || (char === "-" && this.isNumeric(this.peek()))) {
                this.extractNumber();
            } else if (this.isOperator(char)) {
                this.extractOperator();
            } else if (this.isAlpha(char)) {
                this.extractIdentifier();
            } else {
                // Skip any unknown characters
                this.advance();
            }
        }

        // Close any remaining indentation levels
        while (this.indentLevels.length > 1) {
            this.indentLevels.pop();
            this.addToken(TokenType.DEDENT, "");
        }

        // Add EOF token
        this.addToken(TokenType.EOF, "");

        // Return the array of tokens.
        return this.tokens;
    }

    // Handle open parenthesis - check for empty parens
    private handleOpenParen(): void {
        // Look ahead to check for empty parentheses
        let lookAhead = this.position + 1;
        while (lookAhead < this.code.length && [" ", "\t"].includes(this.code[lookAhead])) {
            lookAhead++;
        }
        
        if (lookAhead < this.code.length && this.code[lookAhead] === ")") {
            this.addError(
                ErrorCodes.EMPTY_PARENTHESES,
                "Empty parentheses '()' are not allowed.",
                "Parentheses should only be used for grouping math expressions, e.g., (a + b) * c"
            );
        }
        
        this.addToken(TokenType.PARENTHESIS_OPEN, "(");
        this.advance();
    }

    // Handle open bracket - only allow for list initialization []
    private handleOpenBracket(): void {
        // Look ahead to see if this is []
        let lookAhead = this.position + 1;
        while (lookAhead < this.code.length && [" ", "\t"].includes(this.code[lookAhead])) {
            lookAhead++;
        }
        
        if (lookAhead < this.code.length && this.code[lookAhead] === "]") {
            // This is [] - valid for list initialization
            // Check if preceded by "list NAME ="
            // For now, allow it and let the parser validate context
            this.addToken(TokenType.BRACKET_OPEN, "[");
            this.advance();
        } else {
            // This is [something] - not allowed
            this.addError(
                ErrorCodes.INVALID_BRACKET,
                "Square brackets '[...]' are not allowed except for empty list initialization '[]'.",
                "Use variable names directly without brackets. For example, use 'score' instead of '[score]'."
            );
            // Still add the token for parser recovery
            this.addToken(TokenType.BRACKET_OPEN, "[");
            this.advance();
        }
    }

    // Handle angle brackets - distinguish between comparison operators and invalid brackets
    private handleAngleBracket(): void {
        const char = this.code[this.position];
        const nextChar = this.peek();
        
        // Check if it's a comparison operator (could be followed by =)
        if (nextChar === "=") {
            // >= or <=
            this.addToken(TokenType.OPERATOR, char + "=");
            this.advance();
            this.advance();
        } else if (char === "<") {
            // Could be < operator or <...> angle bracket
            // Look ahead to see if there's a matching >
            let depth = 1;
            let lookAhead = this.position + 1;
            let hasContent = false;
            
            while (lookAhead < this.code.length && depth > 0) {
                if (this.code[lookAhead] === "<") depth++;
                else if (this.code[lookAhead] === ">") depth--;
                else if (this.code[lookAhead] === "\n") break;
                else if (![" ", "\t"].includes(this.code[lookAhead])) hasContent = true;
                lookAhead++;
            }
            
            // If we found a matching > with content inside, it's probably meant as angle brackets
            // For comparison, user should write: a < b (with spaces)
            // But we'll be lenient and treat < as operator
            this.addToken(TokenType.OPERATOR, char);
            this.advance();
        } else {
            // > operator
            this.addToken(TokenType.OPERATOR, char);
            this.advance();
        }
    }

    // Process indentation at the beginning of a line
    private handleIndentation(): void {
        // console.log("Indent starting at ", `[${this.code[this.position]}]${this.code.substring(this.position+1, Math.min(this.position+20, this.code.length))}`)
        let spaces = 0;

        // Count the leading spaces and tabs (tabs count as 4 spaces)
        while (this.position < this.code.length) {
            const char = this.code[this.position];
            if (char === " ") {
                spaces++;
                this.advance();
            } else if (char === "\t") {
                spaces += 4; // Tab counts as 4 spaces
                this.advance();
            } else {
                break;
            }
        }

        // Skip empty lines and comments
        if (
            this.code[this.position] === "\n" ||
            this.code[this.position] === "\r" ||
            (this.code[this.position] === "/" && this.code[this.position + 1] === "/")
        ) {
            return;
        }

        const currentIndent = this.indentLevels[this.indentLevels.length - 1];

        if (spaces > currentIndent) {
            // Increase in indentation level
            this.indentLevels.push(spaces);
            this.addToken(TokenType.INDENT, " ".repeat(spaces - currentIndent));
        } else if (spaces < currentIndent) {
            // Decrease in indentation level - may need multiple DEDENT tokens
            while (this.indentLevels.length > 1 && this.indentLevels[this.indentLevels.length - 1] > spaces) {
                this.indentLevels.pop();
                this.addToken(TokenType.DEDENT, "");
            }

            // Inconsistent indentation
            if (this.indentLevels[this.indentLevels.length - 1] !== spaces) {
                this.addError(
                    ErrorCodes.INCONSISTENT_INDENT,
                    `Inconsistent indentation. Expected ${this.indentLevels[this.indentLevels.length - 1]} spaces but got ${spaces}.`,
                    "Make sure your indentation is consistent. Use the same number of spaces for each level."
                );
            }
        }
    }

    // Handle newline characters (\n or \r\n)
    private handleNewline(): void {
        // console.log("NEW LINE!");
        // Skip carriage return in \r\n
        if (this.code[this.position] === "\r") {
            this.advance();
        }

        // Handle the newline character
        if (this.code[this.position] === "\n") {
            this.addToken(TokenType.NEWLINE, "\n");
            this.advance();
            // Reset column and increment line after newline
            this.line++;
            this.column = 1;
        }
    }

    // Extract comment (starting with //)
    private extractComment(): void {
        let comment = "";

        // Skip the double slashes
        this.advance();
        this.advance();

        // Collect all characters until the end of the line
        while (
            this.position < this.code.length &&
            this.code[this.position] !== "\n" &&
            this.code[this.position] !== "\r"
        ) {
            comment += this.code[this.position];
            this.advance();
        }

        this.addToken(TokenType.COMMENT, comment);
    }

    // Extract a string literal from the input code.
    private extractString(): void {
        const quote = this.code[this.position];
        let value = "";

        // Skip the opening quote
        this.advance();

        // Collect characters until closing quote
        while (this.position < this.code.length && this.code[this.position] !== quote) {
            // Handle escape sequences
            if (this.code[this.position] === "\\" && this.position + 1 < this.code.length) {
                this.advance();

                // Handle specific escape sequences
                switch (this.code[this.position]) {
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
                        value += this.code[this.position];
                }
            } else {
                value += this.code[this.position];
            }

            this.advance();
        }

        // Handle the closing quote
        if (this.position < this.code.length) {
            this.advance(); // Skip closing quote
        } else {
            this.addError(
                ErrorCodes.UNTERMINATED_STRING,
                `Unterminated string. Missing closing quote.`,
                `Add a closing ${quote} at the end of your string.`
            );
        }

        this.addToken(TokenType.STRING, value);
    }

    // Extract a numeric literal from the input code.
    private extractNumber(): void {
        // console.log("Number starts at: ", this.code[this.position]);
        // const start = this.position;
        let value = "";
        let isFloat = false;

        // Handle negative sign
        if (this.code[this.position] === "-") {
            value += "-";
            this.advance();
        }

        // Collect digits and potential decimal point
        while (
            this.position < this.code.length &&
            (this.isNumeric(this.code[this.position]) || this.code[this.position] === ".")
        ) {
            if (this.code[this.position] === ".") {
                // Ensure only one decimal point
                if (isFloat) {
                    break;
                }
                isFloat = true;
            }
            value += this.code[this.position];
            this.advance();
        }

        this.addToken(TokenType.NUMBER, value);
    }

    // Extract an operator
    private extractOperator(): void {
        let value = this.code[this.position];
        this.advance();

        // Handle two-character operators (==, !=, >=, <=)
        if ((value === "=" || value === "!" || value === ">" || value === "<") && this.code[this.position] === "=") {
            value += "=";
            this.advance();
        }

        this.addToken(TokenType.OPERATOR, value);
    }

    // Extract an identifier or keyword - FIXED
    // Also handles hyphenated keywords like 'mouse-pointer'
    private extractIdentifier(): void {
        // console.log("Starting identifier at:", this.code[this.position]);
        // console.log("Full code: \n", this.code);
        let value = "";

        // Collect valid identifier characters (letters, digits, underscores)
        while (
            this.position < this.code.length &&
            (this.isAlpha(this.code[this.position]) ||
                this.isNumeric(this.code[this.position]) ||
                this.code[this.position] === "_")
        ) {
            value += this.code[this.position];
            this.advance();
        }

        // Check for hyphenated keywords like 'mouse-pointer'
        // Look ahead to see if we have a hyphen followed by letters
        if (this.position < this.code.length && this.code[this.position] === "-") {
            const potentialHyphenatedWord = value + "-" + this.peekWord();
            if (this.keywords.has(potentialHyphenatedWord) || Lexer.RESERVED_KEYWORDS.has(potentialHyphenatedWord)) {
                // It's a hyphenated keyword, consume the rest
                this.advance(); // consume the hyphen
                value += "-";
                while (
                    this.position < this.code.length &&
                    (this.isAlpha(this.code[this.position]) ||
                        this.isNumeric(this.code[this.position]) ||
                        this.code[this.position] === "_")
                ) {
                    value += this.code[this.position];
                    this.advance();
                }
            }
        }

        // Check if this is a keyword
        if (this.keywords.has(value)) {
            this.addToken(TokenType.KEYWORD, value);
        } else {
            this.addToken(TokenType.IDENTIFIER, value);
        }
    }
    
    // Peek at the word after the current position without advancing
    private peekWord(): string {
        let word = "";
        let pos = this.position + 1; // Start after the hyphen
        while (pos < this.code.length && (this.isAlpha(this.code[pos]) || this.isNumeric(this.code[pos]) || this.code[pos] === "_")) {
            word += this.code[pos];
            pos++;
        }
        return word;
    }

    // Helper method to add a token to the tokens array
    private addToken(type: TokenType, value: string): void {
        this.tokens.push({
            type,
            value,
            line: this.line,
            column: this.column - value.length,
        });
    }

    // Advance the position in the code and update column
    private advance(): void {
        this.position++;
        this.column++;
        // console.log("Next char: ", this.code[this.position]);
    }

    // Peek at the next character without advancing
    private peek(): string {
        return this.position + 1 < this.code.length ? this.code[this.position + 1] : "\0";
    }

    // Check if a character is an alphabet letter
    private isAlpha(char: string): boolean {
        return /[a-zA-Z]/.test(char);
    }

    // Check if a character is a digit
    private isNumeric(char: string): boolean {
        return /[0-9]/.test(char);
    }

    // Check if a character is an operator
    private isOperator(char: string): boolean {
        return this.operators.has(char);
    }
}
