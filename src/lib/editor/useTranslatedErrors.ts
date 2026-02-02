// Hook to translate compiler errors using i18n
// Maps error codes to translation keys and returns translated errors

import { CompilerError, ErrorCodes } from "@/types/compilerTypes";
import { TranslationSchema } from "@/i18n/types";

// Map error codes to translation keys
const errorCodeToKeyMap: Record<string, keyof TranslationSchema["errors"]> = {
    // Lexer errors (E0xx)
    [ErrorCodes.INVALID_BRACKET]: "invalidBracket",
    [ErrorCodes.INVALID_ANGLE_BRACKET]: "invalidBracket", // Use same as bracket
    [ErrorCodes.INVALID_CURLY_BRACKET]: "invalidCurlyBracket",
    [ErrorCodes.EMPTY_PARENTHESES]: "emptyParentheses",
    [ErrorCodes.UNTERMINATED_STRING]: "unterminatedString",
    [ErrorCodes.INCONSISTENT_INDENT]: "inconsistentIndent",
    
    // Compiler pre-check errors (E100-E109)
    [ErrorCodes.EMPTY_CIRCLE]: "emptyCircle",
    [ErrorCodes.EMPTY_DIAMOND]: "emptyDiamond",
    
    // Parser errors (E110+)
    [ErrorCodes.UNDECLARED_VARIABLE]: "undeclaredVariable",
    [ErrorCodes.RESERVED_KEYWORD]: "reservedKeyword",
    [ErrorCodes.MISSING_VALUE]: "missingValue",
    [ErrorCodes.UNEXPECTED_TOKEN]: "unexpectedToken",
    [ErrorCodes.MISSING_END]: "missingEnd",
    [ErrorCodes.INVALID_SYNTAX]: "invalidSyntax",
    [ErrorCodes.MISSING_INDENT]: "missingIndent",
    [ErrorCodes.UNKNOWN_BLOCK]: "unknownBlock",
    [ErrorCodes.PROCEDURE_ARG_MISMATCH]: "procedureArgMismatch",
    
    // Type errors (E2xx)
    [ErrorCodes.TYPE_MISMATCH]: "typeMismatch",
    [ErrorCodes.NUMBER_REQUIRED]: "numberRequired",
    [ErrorCodes.STRING_REQUIRED]: "stringRequired",
    [ErrorCodes.BOOLEAN_REQUIRED]: "booleanRequired",
    [ErrorCodes.INVALID_BOOLEAN_OPERATION]: "invalidBooleanOperation",
};

// Regex to extract sprite prefix like "[Sprite1] " from error messages
const SPRITE_PREFIX_REGEX = /^\[([^\]]+)\]\s*/;

/**
 * Translates a compiler error using the current translations
 * Preserves sprite prefixes like "[Sprite1]" while translating the message
 * Falls back to original error message if no translation found
 */
export function translateError(
    error: CompilerError,
    translations: TranslationSchema
): CompilerError {
    const translationKey = errorCodeToKeyMap[error.code];
    
    if (!translationKey) {
        // No mapping found, return original error
        return error;
    }
    
    const errorTranslation = translations.errors[translationKey];
    
    // Ensure errorTranslation is an object with string properties
    if (!errorTranslation || typeof errorTranslation !== 'object') {
        return error;
    }
    
    const translatedMessage = typeof errorTranslation.message === 'string' ? errorTranslation.message : '';
    const translatedSuggestion = typeof errorTranslation.suggestion === 'string' ? errorTranslation.suggestion : '';
    
    if (!translatedMessage) {
        // No valid translation found, return original error
        return error;
    }
    
    // Extract sprite prefix from original message if present
    const prefixMatch = error.message.match(SPRITE_PREFIX_REGEX);
    const prefix = prefixMatch ? prefixMatch[0] : '';
    
    // Return translated error with prefix preserved
    return {
        ...error,
        message: prefix + translatedMessage,
        suggestion: translatedSuggestion || error.suggestion,
    };
}

/**
 * Translates an array of compiler errors
 */
export function translateErrors(
    errors: CompilerError[],
    translations: TranslationSchema
): CompilerError[] {
    return errors.map(error => translateError(error, translations));
}

/**
 * Hook-style function to create a translator for errors
 * Can be used in components that have access to translations
 */
export function createErrorTranslator(translations: TranslationSchema) {
    return {
        translateError: (error: CompilerError) => translateError(error, translations),
        translateErrors: (errors: CompilerError[]) => translateErrors(errors, translations),
    };
}
