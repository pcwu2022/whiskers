// Types for our compiler
type BlockType =
    | "event"
    | "motion"
    | "looks"
    | "sound"
    | "control"
    | "sensing"
    | "operators"
    | "operator"
    | "variables"
    | "variable"
    | "list"
    | "custom"
    | "procedure"
    | "pen";

// Compiler Error Types
export type ErrorSeverity = "error" | "warning" | "info";

export interface CompilerError {
    message: string;
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
    severity: ErrorSeverity;
    code: string;  // Error code like "E001", "E002", etc.
    suggestion?: string;  // Helpful suggestion to fix the error
}

// Error codes
export const ErrorCodes = {
    // Lexer errors (E0xx)
    INVALID_BRACKET: "E001",
    INVALID_ANGLE_BRACKET: "E002", 
    INVALID_CURLY_BRACKET: "E003",
    EMPTY_PARENTHESES: "E004",
    UNTERMINATED_STRING: "E005",
    INCONSISTENT_INDENT: "E006",
    
    // Parser errors (E1xx)
    UNDECLARED_VARIABLE: "E101",
    RESERVED_KEYWORD: "E102",
    MISSING_VALUE: "E103",
    UNEXPECTED_TOKEN: "E104",
    MISSING_END: "E105",
    INVALID_SYNTAX: "E106",
    MISSING_INDENT: "E107",
    UNKNOWN_BLOCK: "E108",
    PROCEDURE_ARG_MISMATCH: "E109",
    
    // Type errors (E2xx)
    TYPE_MISMATCH: "E201",
    NUMBER_REQUIRED: "E202",
    STRING_REQUIRED: "E203",
    BOOLEAN_REQUIRED: "E204",
    INVALID_BOOLEAN_OPERATION: "E205",
};

// Lexer Types
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

interface BlockNode {
    type: BlockType;
    name: string;
    args: (string | number | BlockNode)[];
    next?: BlockNode;
    body?: BlockNode[];      // For control structures (repeat, if, etc.)
    elseBody?: BlockNode[];  // For if-else structures
}

interface Script {
    blocks: BlockNode[];
}

interface Program {
    scripts: Script[];
    variables: Map<string, (string | number | object | undefined | null)>;
    lists: Map<string, (string | number | object | undefined | null)[]>;
}

export type { BlockType, BlockNode, Script, Program };

export const blockTypeMap: Record<string, BlockType> = {
    // Events
    when: "event",
    whenFlagClicked: "event",
    whenSpriteClicked: "event",
    whenKeyPressed: "event",
    broadcast: "event",
    receive: "event",
    whenReceived: "event",
    whenIReceive: "event",
    whenIStartAsClone: "event",
    broadcastAndWait: "event",
    
    // Motion
    move: "motion",
    turn: "motion",
    turnRight: "motion",
    turnLeft: "motion",
    go: "motion",
    goto: "motion",
    goTo: "motion",
    goToXY: "motion",
    goToRandom: "motion",
    goToMouse: "motion",
    goToSprite: "motion",
    glide: "motion",
    glideTo: "motion",
    glideToXY: "motion",
    point: "motion",
    pointInDirection: "motion",
    pointTowards: "motion",
    direction: "motion",
    setX: "motion",
    setY: "motion",
    changeX: "motion",
    changeY: "motion",
    ifOnEdgeBounce: "motion",
    setRotationStyle: "motion",
    xPosition: "motion",
    yPosition: "motion",
    
    // Looks
    say: "looks",
    sayFor: "looks",
    think: "looks",
    thinkFor: "looks",
    show: "looks",
    hide: "looks",
    switch: "looks",
    switchCostume: "looks",
    switchBackdrop: "looks",
    next: "looks",
    nextCostume: "looks",
    nextBackdrop: "looks",
    change: "looks",
    changeEffect: "looks",
    setEffect: "looks",
    clearEffects: "looks",
    clearGraphicEffects: "looks",
    changeSize: "looks",
    setSize: "looks",
    goToFront: "looks",
    goToFrontLayer: "looks",
    goToBack: "looks",
    goToBackLayer: "looks",
    goToLayer: "looks",
    goLayers: "looks",
    goBackLayers: "looks",
    goForwardLayers: "looks",
    costumeNumber: "looks",
    costumeName: "looks",
    backdropNumber: "looks",
    backdropName: "looks",
    size: "looks",
    
    // Sound
    play: "sound",
    playSound: "sound",
    playSoundUntilDone: "sound",
    startSound: "sound",
    stop: "control",  // "stop" can be both sound and control
    stopAllSounds: "sound",
    changeVolume: "sound",
    setVolume: "sound",
    volume: "sound",
    
    // Pen
    penDown: "pen",
    penUp: "pen",
    setPenColor: "pen",
    changePenColor: "pen",
    setPenSize: "pen",
    changePenSize: "pen",
    stamp: "pen",
    erase: "pen",
    eraseAll: "pen",
    
    // Control
    wait: "control",
    waitSeconds: "control",
    repeat: "control",
    forever: "control",
    if: "control",
    ifElse: "control",
    else: "control",
    until: "control",
    repeatUntil: "control",
    waitUntil: "control",
    while: "control",
    stopAll: "control",
    stopThisScript: "control",
    stopOtherScripts: "control",
    createClone: "control",
    deleteClone: "control",
    deleteThisClone: "control",
    whenCloneStarts: "event",
    create: "control",
    delete: "control",
    
    // Sensing
    ask: "sensing",
    askAndWait: "sensing",
    answer: "sensing",
    touching: "sensing",
    touchingColor: "sensing",
    colorTouching: "sensing",
    distanceTo: "sensing",
    key: "sensing",
    keyPressed: "sensing",
    mouse: "sensing",
    mouseDown: "sensing",
    mouseX: "sensing",
    mouseY: "sensing",
    setDragMode: "sensing",
    loudness: "sensing",
    timer: "sensing",
    reset: "sensing",
    resetTimer: "sensing",
    username: "sensing",
    current: "sensing",
    daysSince2000: "sensing",
    
    // Variables
    set: "variables",
    setVariable: "variables",
    changeVariable: "variables",
    showVariable: "variables",
    hideVariable: "variables",
    
    // Lists
    add: "list",
    addToList: "list",
    deleteOfList: "list",
    deleteAllOfList: "list",
    insert: "list",
    insertAtList: "list",
    replace: "list",
    replaceItemOfList: "list",
    itemOfList: "list",
    itemNumberInList: "list",
    lengthOfList: "list",
    listContains: "list",
    showList: "list",
    hideList: "list",
    
    // Operators
    join: "operators",
    letter: "operators",
    mod: "operators",
    round: "operators",
    abs: "operators",
    sqrt: "operators",
    floor: "operators",
    ceiling: "operators",
    sin: "operators",
    cos: "operators",
    tan: "operators",
    asin: "operators",
    acos: "operators",
    atan: "operators",
    ln: "operators",
    log: "operators",
    ePow: "operators",
    tenPow: "operators",
    pick: "operators",
    pickRandom: "operators",
    length: "operators",
    contains: "operators",
    
    // Custom blocks
    define: "custom",
    call: "custom",
};
