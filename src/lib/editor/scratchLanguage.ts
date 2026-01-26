import type { languages } from "monaco-editor";

// Language configuration for auto-indent and bracket matching
export const languageConfiguration: languages.LanguageConfiguration = {
    // Words that trigger indent after Enter
    indentationRules: {
        // Increase indent after these patterns (blocks that have bodies)
        increaseIndentPattern: /^\s*(when\s.*|repeat\s+\d+|repeat\s+until.*|forever|if\s.*then|if\s.*|else|define\s.*|when\s+flag\s+clicked|when\s+flagClicked|when\s+I\s+receive.*|when\s+I\s+start\s+as\s+a\s+clone|when\s+this\s+sprite\s+clicked|when\s+backdrop\s+switches\s+to.*|when\s+key\s+.*\s+pressed)\s*$/,
        // Decrease indent patterns (typically "else" or "end" type blocks)
        decreaseIndentPattern: /^\s*(else)\s*$/,
    },
    // Auto-closing pairs
    autoClosingPairs: [
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        { open: "[", close: "]" },
    ],
    // Surrounding pairs (for selection wrapping)
    surroundingPairs: [
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        { open: "[", close: "]" },
    ],
    // Brackets for matching
    brackets: [
        ["(", ")"],
        ["[", "]"],
    ],
    // Comments
    comments: {
        lineComment: "//",
    },
    // On Enter rules for better indentation
    onEnterRules: [
        {
            // After 'repeat X' or 'repeat until'
            beforeText: /^\s*(repeat\s+\d+|repeat\s+until.*)\s*$/,
            action: { indentAction: 1 }, // IndentAction.Indent
        },
        {
            // After 'forever'
            beforeText: /^\s*forever\s*$/,
            action: { indentAction: 1 },
        },
        {
            // After 'if ... then' or just 'if ...'
            beforeText: /^\s*if\s+.*(then)?\s*$/,
            action: { indentAction: 1 },
        },
        {
            // After 'else'
            beforeText: /^\s*else\s*$/,
            action: { indentAction: 1 },
        },
        {
            // After 'define ...'
            beforeText: /^\s*define\s+.+$/,
            action: { indentAction: 1 },
        },
        {
            // After any 'when ...' event handler
            beforeText: /^\s*when\s+.+$/,
            action: { indentAction: 1 },
        },
    ],
};

// Monarch language definition for syntax highlighting
export const languageDef: languages.IMonarchLanguage = {
    ignoreCase: false,
    tokenizer: {
        root: [
            // Comments - must be first
            [/\/\/.*$/, "comment"],

            // Strings - must be before keywords to not match inside strings
            [/"[^"]*"/, "string"],
            [/'[^']*'/, "string"],

            // Hex colors
            [/#[0-9a-fA-F]{6}\b/, "string.color"],
            [/#[0-9a-fA-F]{3}\b/, "string.color"],

            // Empty list initialization [] - this is the ONLY valid use of brackets
            [/\[\]/, "keyword.scratch.variables"],

            // ===== EVENTS - Yellow (#FFBF00) =====
            // Multi-word event blocks (must be before single keywords)
            [/\bwhen\s+green\s+flag\s+clicked\b/, "keyword.scratch.event"],
            [/\bwhen\s+I\s+receive\b/, "keyword.scratch.event"],
            [/\bwhen\s+this\s+sprite\s+clicked\b/, "keyword.scratch.event"],
            [/\bwhen\s+I\s+start\s+as\s+a\s+clone\b/, "keyword.scratch.event"],
            [/\bwhen\s+backdrop\s+switches\s+to\b/, "keyword.scratch.event"],
            [/\bbroadcast\s+and\s+wait\b/, "keyword.scratch.event"],
            [/\bbroadcast\b/, "keyword.scratch.event"],
            [/\bwhen\b/, "keyword.scratch.event"],

            // ===== PEN - Teal (#0FBD8C) =====
            [/\bpen\s+down\b/, "keyword.scratch.pen"],
            [/\bpen\s+up\b/, "keyword.scratch.pen"],
            [/\bset\s+pen\s+color\s+to\b/, "keyword.scratch.pen"],
            [/\bchange\s+pen\s+color\s+by\b/, "keyword.scratch.pen"],
            [/\bset\s+pen\s+size\s+to\b/, "keyword.scratch.pen"],
            [/\bchange\s+pen\s+size\s+by\b/, "keyword.scratch.pen"],
            [/\berase\s+all\b/, "keyword.scratch.pen"],
            [/\b(stamp|erase)\b/, "keyword.scratch.pen"],

            // ===== MOTION - Blue (#4C97FF) =====
            [/\bmove\s+\S+\s+steps?\b/, "keyword.scratch.motion"],
            [/\bturn\s+right\b/, "keyword.scratch.motion"],
            [/\bturn\s+left\b/, "keyword.scratch.motion"],
            [/\bgo\s+to\s+x:\b/, "keyword.scratch.motion"],
            [/\bgo\s+to\s+random\s+position\b/, "keyword.scratch.motion"],
            [/\bgo\s+to\s+mouse-pointer\b/, "keyword.scratch.motion"],
            [/\bgo\s+to\b/, "keyword.scratch.motion"],
            [/\bglide\s+\S+\s+secs?\s+to\s+x:\b/, "keyword.scratch.motion"],
            [/\bglide\s+\S+\s+secs?\s+to\b/, "keyword.scratch.motion"],
            [/\bpoint\s+in\s+direction\b/, "keyword.scratch.motion"],
            [/\bpoint\s+towards\b/, "keyword.scratch.motion"],
            [/\bchange\s+x\s+by\b/, "keyword.scratch.motion"],
            [/\bset\s+x\s+to\b/, "keyword.scratch.motion"],
            [/\bchange\s+y\s+by\b/, "keyword.scratch.motion"],
            [/\bset\s+y\s+to\b/, "keyword.scratch.motion"],
            [/\bif\s+on\s+edge,?\s*bounce\b/, "keyword.scratch.motion"],
            [/\bset\s+rotation\s+style\b/, "keyword.scratch.motion"],
            [/\bx\s+position\b/, "keyword.scratch.motion"],
            [/\by\s+position\b/, "keyword.scratch.motion"],
            [/\b(move|turn|direction)\b/, "keyword.scratch.motion"],

            // ===== LOOKS - Purple (#9966FF) =====
            [/\bsay\s+"[^"]*"\s+for\b/, "keyword.scratch.looks"],
            [/\bthink\s+"[^"]*"\s+for\b/, "keyword.scratch.looks"],
            [/\bswitch\s+costume\s+to\b/, "keyword.scratch.looks"],
            [/\bnext\s+costume\b/, "keyword.scratch.looks"],
            [/\bswitch\s+backdrop\s+to\b/, "keyword.scratch.looks"],
            [/\bnext\s+backdrop\b/, "keyword.scratch.looks"],
            [/\bchange\s+size\s+by\b/, "keyword.scratch.looks"],
            [/\bset\s+size\s+to\b/, "keyword.scratch.looks"],
            [/\bchange\s+\w+\s+effect\s+by\b/, "keyword.scratch.looks"],
            [/\bset\s+\w+\s+effect\s+to\b/, "keyword.scratch.looks"],
            [/\bclear\s+graphic\s+effects\b/, "keyword.scratch.looks"],
            [/\bgo\s+to\s+front\s+layer\b/, "keyword.scratch.looks"],
            [/\bgo\s+to\s+back\s+layer\b/, "keyword.scratch.looks"],
            [/\bcostume\s+number\b/, "keyword.scratch.looks"],
            [/\bcostume\s+name\b/, "keyword.scratch.looks"],
            [/\bbackdrop\s+number\b/, "keyword.scratch.looks"],
            [/\bbackdrop\s+name\b/, "keyword.scratch.looks"],
            [/\b(say|think|show|hide|size)\b/, "keyword.scratch.looks"],

            // ===== SOUND - Magenta (#CF63CF) =====
            [/\bplay\s+sound\s+"[^"]*"\s+until\s+done\b/, "keyword.scratch.sound"],
            [/\bplay\s+sound\b/, "keyword.scratch.sound"],
            [/\bstart\s+sound\b/, "keyword.scratch.sound"],
            [/\bstop\s+all\s+sounds\b/, "keyword.scratch.sound"],
            [/\bchange\s+volume\s+by\b/, "keyword.scratch.sound"],
            [/\bset\s+volume\s+to\b/, "keyword.scratch.sound"],
            [/\bvolume\b/, "keyword.scratch.sound"],

            // ===== SENSING - Sky Blue (#5CB1D6) =====
            [/\btouching\s+color\b/, "keyword.scratch.sensing"],
            [/\btouching\s+mouse-pointer\b/, "keyword.scratch.sensing"],
            [/\btouching\s+edge\b/, "keyword.scratch.sensing"],
            [/\bdistance\s+to\b/, "keyword.scratch.sensing"],
            [/\bask\s+"[^"]*"\s+and\s+wait\b/, "keyword.scratch.sensing"],
            [/\bask\b/, "keyword.scratch.sensing"],
            [/\bkey\s+\S+\s+pressed\b/, "keyword.scratch.sensing"],
            [/\bmouse\s+down\b/, "keyword.scratch.sensing"],
            [/\bmouse\s+x\b/, "keyword.scratch.sensing"],
            [/\bmouse\s+y\b/, "keyword.scratch.sensing"],
            [/\breset\s+timer\b/, "keyword.scratch.sensing"],
            [/\b(touching|answer|timer|loudness|username)\b/, "keyword.scratch.sensing"],

            // ===== CONTROL - Light Orange (#FFAB19) =====
            [/\bwait\s+until\b/, "keyword.scratch.control"],
            [/\bwait\s+\S+\s+seconds?\b/, "keyword.scratch.control"],
            [/\brepeat\s+until\b/, "keyword.scratch.control"],
            [/\bstop\s+all\b/, "keyword.scratch.control"],
            [/\bstop\s+this\s+script\b/, "keyword.scratch.control"],
            [/\bcreate\s+clone\s+of\b/, "keyword.scratch.control"],
            [/\bdelete\s+this\s+clone\b/, "keyword.scratch.control"],
            [/\b(wait|repeat|forever|if|else|then|end|stop|myself)\b/, "keyword.scratch.control"],

            // ===== VARIABLES AND LISTS - Orange (#FF8C1A) =====
            [/\bshow\s+variable\b/, "keyword.scratch.variables"],
            [/\bhide\s+variable\b/, "keyword.scratch.variables"],
            [/\badd\s+\S+\s+to\b/, "keyword.scratch.variables"],
            [/\bdelete\s+all\s+of\b/, "keyword.scratch.variables"],
            [/\bdelete\s+\S+\s+of\b/, "keyword.scratch.variables"],
            [/\binsert\s+\S+\s+at\b/, "keyword.scratch.variables"],
            [/\breplace\s+item\s+\S+\s+of\b/, "keyword.scratch.variables"],
            [/\bitem\s+\S+\s+of\b/, "keyword.scratch.variables"],
            [/\blength\s+of\b/, "keyword.scratch.variables"],
            [/\bcontains\b/, "keyword.scratch.variables"],
            [/\b(var|list|set|change|add|delete|insert|replace|item)\b/, "keyword.scratch.variables"],

            // ===== OPERATORS - Green (#59C059) =====
            [/\bpick\s+random\s+\S+\s+to\b/, "keyword.scratch.operators"],
            [/\bpick\s+random\b/, "keyword.scratch.operators"],
            [/\bletter\s+\S+\s+of\b/, "keyword.scratch.operators"],
            [/\babs\s+of\b/, "keyword.scratch.operators"],
            [/\b(and|or|not|join|round|abs|floor|ceiling|sqrt|sin|cos|tan|asin|acos|atan|ln|log|mod)\b/, "keyword.scratch.operators"],

            // ===== CUSTOM BLOCKS - Pink (#FF6680) =====
            [/\bdefine\b/, "keyword.scratch.custom"],
            [/\bcall\b/, "keyword.scratch.custom"],

            // Special targets (reserved keywords)
            [/\bmouse-pointer\b/, "constant.scratch.target"],
            [/\brandom\s+position\b/, "constant.scratch.target"],
            [/\b(edge|myself)\b/, "constant.scratch.target"],

            // Boolean/special values
            [/\b(true|false)\b/, "constant.scratch"],
            
            // Key names
            [/\b(space|left|right|up|down|any)\b/, "constant.scratch.key"],

            // Effects (reserved keywords)
            [/\b(color|fisheye|whirl|pixelate|mosaic|brightness|ghost)\b/, "constant.scratch.effect"],

            // Rotation styles
            [/\ball-around\b/, "constant.scratch.rotation"],
            [/\bleft-right\b/, "constant.scratch.rotation"],
            [/\bdont-rotate\b/, "constant.scratch.rotation"],

            // Units and modifiers
            [/\b(seconds|secs|steps|degrees|layers|layer)\b/, "constant.scratch.unit"],

            // Operators symbols
            [/[+\-*\/%]/, "operators.scratch"],
            [/[<>=!]=?/, "operators.scratch"],

            // Numbers with optional % suffix (treat as single number token)
            [/-?\d+(\.\d+)?\s*%/, "number"],
            [/-?\d+(\.\d+)?/, "number"],

            // Parentheses (only for math grouping)
            [/\(/, "delimiter.parenthesis"],
            [/\)/, "delimiter.parenthesis"],

            // Identifiers (variable and custom block names) - catch all remaining
            [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"],

            // Whitespace
            [/\s+/, "white"],
        ],
    },
};
