// Constants - Defines all keywords, operators, and block type mappings

import { BlockType } from "./blockTypes";

/**
 * All Scratch keywords recognized by the lexer
 */
export const SCRATCH_KEYWORDS = new Set([
    // Event keywords
    "when",
    "flag",
    "clicked",
    "broadcast",
    "receive",
    "event",
    "I",              // for "when I receive" / "when I start as a clone"
    "start",          // for "when I start as a clone"
    "as",             // for "when I start as a clone"
    "a",              // for "when I start as a clone"
    "clone",          // for clone events
    "myself",         // for "create clone of myself"

    // Control keywords
    "forever",
    "if",
    "else",
    "then",
    "repeat",
    "until",
    "while",
    "end",
    "wait",
    "stop",
    "all",
    "this",
    "script",
    "create",         // for "create clone"
    "delete",         // for "delete this clone"
    "of",             // for "create clone of"

    // Motion keywords
    "move",
    "steps",
    "turn",
    "degrees",
    "goto",
    "glide",
    "point",
    "direction",
    "x",
    "y",

    // Looks keywords
    "say",
    "for",
    "seconds",
    "think",
    "show",
    "hide",
    "switch",
    "costume",
    "backdrop",
    "next",
    "change",
    "set",
    "color",
    "effect",
    "size",
    "clear",
    "graphic",
    "effects",

    // Sound keywords
    "play",
    "sound",

    // Sensing keywords
    "ask",
    "answer",
    "touching",
    "mouse-pointer",
    "edge",
    "sprite",
    "key",
    "pressed",
    "mouse",
    "down",
    "reset",
    "timer",
    "random",
    "between",

    // Variables keywords
    "variable",
    "to",
    "by",

    // Operators keywords
    "and",
    "or",
    "not",
    "join",
    "letter",
    "of",
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
    "pow",

    // Pen keywords
    "pen",
    "up",
    "stamp",

    // Custom block keywords
    "define",
    "procedure",
    "return",

    // Literals
    "true",
    "false",
    "null",
]);

/**
 * All operators recognized by the lexer
 */
export const SCRATCH_OPERATORS = new Set([
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

/**
 * Maps block keywords to their block types
 */
export const BLOCK_TYPE_MAP: Record<string, BlockType> = {
    // Events
    when: "event",
    broadcast: "event",
    receive: "event",
    whenReceived: "event",
    whenIReceive: "event",
    whenIStartAsClone: "event",

    // Motion
    move: "motion",
    turn: "motion",
    turnRight: "motion",
    turnLeft: "motion",
    goto: "motion",
    goTo: "motion",
    glide: "motion",
    point: "motion",
    pointInDirection: "motion",
    direction: "motion",
    setX: "motion",
    setY: "motion",
    changeX: "motion",
    changeY: "motion",

    // Looks
    say: "looks",
    think: "looks",
    show: "looks",
    hide: "looks",
    switch: "looks",
    switchCostume: "looks",
    changeSize: "looks",
    setSize: "looks",

    // Sound
    play: "sound",
    playSound: "sound",
    stop: "sound",
    stopAllSounds: "sound",
    changeVolume: "sound",
    setVolume: "sound",

    // Control
    wait: "control",
    waitUntil: "control",
    repeat: "control",
    repeatUntil: "control",
    forever: "control",
    if: "control",
    ifElse: "control",
    else: "control",
    until: "control",
    while: "control",
    create: "control",
    createClone: "control",
    delete: "control",
    deleteThisClone: "control",
    clone: "control",

    // Sensing
    ask: "sensing",
    answer: "sensing",
    touching: "sensing",
    keyPressed: "sensing",
    mouseDown: "sensing",
    mouseX: "sensing",
    mouseY: "sensing",
    timer: "sensing",
    resetTimer: "sensing",

    // Variables
    set: "variables",
    change: "variables",
    showVariable: "variables",
    hideVariable: "variables",
    addToList: "variables",
    deleteFromList: "variables",
    insertInList: "variables",
    replaceInList: "variables",
    itemOfList: "variables",
    lengthOfList: "variables",
    listContains: "variables",

    // Operators
    add: "operators",
    subtract: "operators",
    multiply: "operators",
    divide: "operators",
    mod: "operators",
    round: "operators",
    abs: "operators",
    floor: "operators",
    ceiling: "operators",
    sqrt: "operators",
    sin: "operators",
    cos: "operators",
    tan: "operators",
    greater: "operators",
    less: "operators",
    equals: "operators",
    and: "operators",
    or: "operators",
    not: "operators",
    random: "operators",
    join: "operators",
    letter: "operators",
    letterOf: "operators",
    length: "operators",
    contains: "operators",
    expression: "operators",

    // Pen
    pen: "pen",
    penDown: "pen",
    penUp: "pen",
    setPenColor: "pen",
    changePenSize: "pen",
    setPenSize: "pen",
    clear: "pen",
    stamp: "pen",

    // Custom
    define: "custom",
    defineFunction: "custom",
    call: "custom",
};

/**
 * Keywords that can start a block
 */
export const BLOCK_START_KEYWORDS = [
    // Events
    "when",
    "broadcast",
    "receive",
    // Motion
    "move",
    "turn",
    "goto",
    "glide",
    "point",
    // Looks
    "say",
    "think",
    "show",
    "hide",
    "switch",
    "change",
    "set",
    // Sound
    "play",
    "stop",
    // Control
    "wait",
    "repeat",
    "forever",
    "if",
    "else",
    "until",
    "while",
    "stop",
    // Sensing
    "ask",
    "touching",
    // Variables
    "set",
    "change",
    // Operators
    "join",
    // Pen
    "pen",
    "stamp",
];
