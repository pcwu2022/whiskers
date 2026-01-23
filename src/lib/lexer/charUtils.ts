// Lexer - Character Utilities
// Helper functions for character classification

/**
 * Check if a character is an alphabet letter
 */
export function isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char);
}

/**
 * Check if a character is a digit
 */
export function isNumeric(char: string): boolean {
    return /[0-9]/.test(char);
}

/**
 * Check if a character is alphanumeric
 */
export function isAlphanumeric(char: string): boolean {
    return isAlpha(char) || isNumeric(char);
}

/**
 * Check if a character is whitespace (space or tab)
 */
export function isWhitespace(char: string): boolean {
    return char === " " || char === "\t";
}

/**
 * Check if a character is a newline
 */
export function isNewline(char: string): boolean {
    return char === "\n" || char === "\r";
}
