import { languages, editor } from "monaco-editor";
import * as monaco from "monaco-editor";

// Scratch official colors
export const SCRATCH_COLORS = {
    motion: "#4C97FF",      // Blue
    looks: "#9966FF",       // Purple
    sound: "#CF63CF",       // Magenta/Pink
    events: "#FFBF00",      // Yellow
    control: "#FFAB19",     // Light Orange
    sensing: "#5CB1D6",     // Sky Blue
    operators: "#59C059",   // Green
    variables: "#FF8C1A",   // Orange
    myBlocks: "#FF6680",    // Pink
    pen: "#0FBD8C",         // Teal (Pen extension)
};

// Define the custom Scratch theme for Monaco
export const scratchTheme: editor.IStandaloneThemeData = {
    base: "vs-dark",
    inherit: true,
    rules: [
        // Comments
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        
        // Scratch block categories with official colors
        { token: "keyword.scratch.event", foreground: "FFBF00", fontStyle: "bold" },      // Yellow
        { token: "keyword.scratch.motion", foreground: "4C97FF", fontStyle: "bold" },     // Blue
        { token: "keyword.scratch.looks", foreground: "9966FF", fontStyle: "bold" },      // Purple
        { token: "keyword.scratch.sound", foreground: "CF63CF", fontStyle: "bold" },      // Magenta
        { token: "keyword.scratch.control", foreground: "FFAB19", fontStyle: "bold" },    // Light Orange
        { token: "keyword.scratch.sensing", foreground: "5CB1D6", fontStyle: "bold" },    // Sky Blue
        { token: "keyword.scratch.variables", foreground: "FF8C1A", fontStyle: "bold" },  // Orange
        { token: "keyword.scratch.operators", foreground: "59C059", fontStyle: "bold" },  // Green
        { token: "keyword.scratch.custom", foreground: "FF6680", fontStyle: "bold" },     // Pink (My Blocks)
        { token: "keyword.scratch.pen", foreground: "0FBD8C", fontStyle: "bold" },        // Teal
        
        // Constants and special values
        { token: "constant.scratch", foreground: "CE9178" },
        { token: "constant.scratch.effect", foreground: "9966FF" },
        { token: "constant.scratch.rotation", foreground: "4C97FF" },
        
        // Operators
        { token: "operators.scratch", foreground: "59C059" },
        
        // Numbers
        { token: "number", foreground: "B5CEA8" },
        
        // Strings
        { token: "string", foreground: "CE9178" },
        { token: "string.color", foreground: "CE9178" },
        
        // Identifiers
        { token: "identifier", foreground: "9CDCFE" },
        
        // Delimiters
        { token: "delimiter.parenthesis", foreground: "D4D4D4" },
        { token: "delimiter.bracket", foreground: "FF8C1A" },
    ],
    colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
    },
};

// Function to register the Scratch theme
export function registerScratchTheme(monacoInstance: typeof monaco): void {
    monacoInstance.editor.defineTheme("scratch-dark", scratchTheme);
}

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

            // Variable references in brackets [varName] - Orange
            [/\[[^\]]+\]/, "keyword.scratch.variables"],

            // Events - Yellow (#FFBF00) - must check multi-word patterns first
            [/\bwhen\s+flagClicked\b/, "keyword.scratch.event"],
            [/\bwhen\s+keyPressed\b/, "keyword.scratch.event"],
            [/\bwhen\s+spriteClicked\b/, "keyword.scratch.event"],
            [/\bwhen\s+cloneStarted\b/, "keyword.scratch.event"],
            [/\bwhen\s+receive\b/, "keyword.scratch.event"],
            [/\bwhen\s+backdropSwitchesTo\b/, "keyword.scratch.event"],
            [/\bwhen\s+loudnessGreaterThan\b/, "keyword.scratch.event"],
            [/\bwhen\s+timerGreaterThan\b/, "keyword.scratch.event"],
            [/\b(when|broadcast|broadcastAndWait)\b/, "keyword.scratch.event"],

            // Pen extension - Teal (#0FBD8C) - before motion to avoid conflicts
            [/\b(penDown|penUp|setPenColor|changePenColor|setPenSize|changePenSize|setPenShade|changePenShade|stamp|erase)\b/, "keyword.scratch.pen"],

            // Motion - Blue (#4C97FF)
            [/\b(move|turn|goTo|glideTo|glide|secs|pointInDirection|pointTowards|changeX|setX|changeY|setY|bounceOnEdge|setRotationStyle|xPosition|yPosition|direction)\b/, "keyword.scratch.motion"],

            // Looks - Purple (#9966FF)
            [/\b(say|think|switchCostume|nextCostume|switchBackdrop|nextBackdrop|changeSizeBy|setSizeTo|setSize|changeEffectBy|setEffectTo|clearEffects|clearGraphicEffects|show|hide|goToFront|goToBack|goForward|goBackward|costumeNumber|costumeName|backdropNumber|backdropName|size)\b/, "keyword.scratch.looks"],

            // Sound - Magenta (#CF63CF)
            [/\b(playSound|playSoundUntilDone|startSound|stopAllSounds|changeVolumeBy|setVolumeTo|changePitchBy|setPitchTo|volume)\b/, "keyword.scratch.sound"],

            // Sensing - Sky Blue (#5CB1D6)
            [/\b(touching|touchingColor|colorIsTouching|distanceTo|askAndWait|ask|answer|keyPressed|keyDown|mouseDown|mouseX|mouseY|setDragMode|draggable|loudness|timer|resetTimer|current|daysSince2000|username)\b/, "keyword.scratch.sensing"],

            // Control - Light Orange (#FFAB19)
            [/\b(wait|repeat|forever|if|else|then|waitUntil|repeatUntil|stop|createClone|deleteThisClone|clone|myself|create)\b/, "keyword.scratch.control"],

            // Variables and Lists - Orange (#FF8C1A)
            [/\b(var|list|set|change|showVariable|hideVariable|add|delete|deleteAll|insert|replace|item|itemOf|itemNumberOf|lengthOf|contains|showList|hideList)\b/, "keyword.scratch.variables"],

            // Operators - Green (#59C059)
            [/\b(and|or|not|join|letterOf|letter|random|pick|between|to|of|round|abs|floor|ceiling|sqrt|sin|cos|tan|asin|acos|atan|ln|log|ePowerOf|tenPowerOf|mod|length)\b/, "keyword.scratch.operators"],

            // Custom blocks / My Blocks - Pink (#FF6680)
            [/\b(define|call|run|without|screen|refresh)\b/, "keyword.scratch.custom"],

            // Boolean/special values and targets
            [/\b(true|false|left|right|up|down|space|any|all|this|script|other|scripts|edge|mouse|position|front|back|forward|backward|layers|layer|seconds)\b/, "constant.scratch"],

            // Effects
            [/\b(color|fisheye|whirl|pixelate|mosaic|brightness|ghost)\b/, "constant.scratch.effect"],

            // Rotation styles
            [/\ball\s+around\b/, "constant.scratch.rotation"],
            [/\bleft-right\b/, "constant.scratch.rotation"],
            [/\bdon't\s+rotate\b/, "constant.scratch.rotation"],

            // Operators symbols
            [/[+\-*\/%]/, "operators.scratch"],
            [/[<>=!]=?/, "operators.scratch"],

            // Numbers
            [/-?\d+(\.\d+)?/, "number"],

            // Parentheses and brackets
            [/\(/, "delimiter.parenthesis"],
            [/\)/, "delimiter.parenthesis"],

            // Identifiers (variable and custom block names) - catch all remaining
            [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"],

            // Whitespace
            [/\s+/, "white"],
        ],
    },
};

export const languageSelector = (monacoInstance: typeof monaco): languages.CompletionItemProvider => {
    return {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endLineNumber: position.lineNumber,
                endColumn: word.endColumn,
            };
            
            const suggestions: languages.CompletionItem[] = [
                // ==================== EVENTS ====================
                {
                    label: "when green flag clicked",
                    kind: monacoInstance.languages.CompletionItemKind.Event,
                    insertText: "when flagClicked\n    ",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code when the green flag is clicked",
                    detail: "🟦 Event: Start on flag click",
                    range: range,
                },
                {
                    label: "when key pressed",
                    kind: monacoInstance.languages.CompletionItemKind.Event,
                    insertText: "when keyPressed ${1|space,up,down,left,right,any,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9|}\n    ",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code when a specific key is pressed",
                    detail: "🟦 Event: Key press trigger",
                    range: range,
                },
                {
                    label: "when this sprite clicked",
                    kind: monacoInstance.languages.CompletionItemKind.Event,
                    insertText: "when spriteClicked\n    ",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code when this sprite is clicked",
                    detail: "🟦 Event: Sprite click trigger",
                    range: range,
                },
                {
                    label: "when backdrop switches to",
                    kind: monacoInstance.languages.CompletionItemKind.Event,
                    insertText: "when backdropSwitchesTo \"${1:backdrop1}\"\n    ",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code when backdrop switches to a specific one",
                    detail: "🟦 Event: Backdrop switch trigger",
                    range: range,
                },
                {
                    label: "when loudness > value",
                    kind: monacoInstance.languages.CompletionItemKind.Event,
                    insertText: "when loudnessGreaterThan ${1:10}\n    ",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code when loudness exceeds a value",
                    detail: "🟦 Event: Loudness trigger",
                    range: range,
                },
                {
                    label: "when timer > value",
                    kind: monacoInstance.languages.CompletionItemKind.Event,
                    insertText: "when timerGreaterThan ${1:10}\n    ",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code when timer exceeds a value",
                    detail: "🟦 Event: Timer trigger",
                    range: range,
                },
                {
                    label: "when I receive message",
                    kind: monacoInstance.languages.CompletionItemKind.Event,
                    insertText: "when receive \"${1:message1}\"\n    ",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code when a broadcast message is received",
                    detail: "🟦 Event: Message received",
                    range: range,
                },
                {
                    label: "when I start as a clone",
                    kind: monacoInstance.languages.CompletionItemKind.Event,
                    insertText: "when cloneStarted\n    ",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code when this sprite starts as a clone",
                    detail: "🟦 Event: Clone starts",
                    range: range,
                },
                {
                    label: "broadcast message",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "broadcast \"${1:message1}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Send a broadcast message to all sprites",
                    detail: "🟦 Event: Send message",
                    range: range,
                },
                {
                    label: "broadcast message and wait",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "broadcastAndWait \"${1:message1}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Broadcast and wait for all receivers to finish",
                    detail: "🟦 Event: Send and wait",
                    range: range,
                },

                // ==================== CONTROL ====================
                {
                    label: "wait seconds",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "wait ${1:1}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Wait for a number of seconds",
                    detail: "🟧 Control: Wait seconds",
                    range: range,
                },
                {
                    label: "repeat",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "repeat ${1:10}\n    ${2:// code here}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Repeat a block of code a number of times",
                    detail: "🟧 Control: Repeat loop",
                    range: range,
                },
                {
                    label: "forever",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "forever\n    ${1:// code here}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Repeat a block of code forever",
                    detail: "🟧 Control: Forever loop",
                    range: range,
                },
                {
                    label: "if then",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "if ${1:condition} then\n    ${2:// code}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code if a condition is true",
                    detail: "🟧 Control: If statement",
                    range: range,
                },
                {
                    label: "if then else",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "if ${1:condition} then\n    ${2:// then code}\nelse\n    ${3:// else code}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Run code if condition is true, otherwise run else code",
                    detail: "🟧 Control: If-Else statement",
                    range: range,
                },
                {
                    label: "wait until",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "waitUntil ${1:condition}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Wait until a condition becomes true",
                    detail: "🟧 Control: Wait until",
                    range: range,
                },
                {
                    label: "repeat until",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "repeatUntil ${1:condition}\n    ${2:// code here}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Repeat code until a condition becomes true",
                    detail: "🟧 Control: Repeat until",
                    range: range,
                },
                {
                    label: "stop all",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "stop all",
                    documentation: "Stop all scripts in the project",
                    detail: "🟧 Control: Stop all",
                    range: range,
                },
                {
                    label: "stop this script",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "stop this script",
                    documentation: "Stop this script",
                    detail: "🟧 Control: Stop this script",
                    range: range,
                },
                {
                    label: "stop other scripts in sprite",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "stop other scripts",
                    documentation: "Stop other scripts in this sprite",
                    detail: "🟧 Control: Stop other scripts",
                    range: range,
                },
                {
                    label: "create clone of myself",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "createClone myself",
                    documentation: "Create a clone of this sprite",
                    detail: "🟧 Control: Create clone of myself",
                    range: range,
                },
                {
                    label: "create clone of sprite",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "createClone \"${1:Sprite1}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Create a clone of a sprite",
                    detail: "🟧 Control: Create clone of sprite",
                    range: range,
                },
                {
                    label: "delete this clone",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "deleteThisClone",
                    documentation: "Delete this clone",
                    detail: "🟧 Control: Delete clone",
                    range: range,
                },

                // ==================== MOTION ====================
                {
                    label: "move steps",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "move ${1:10}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Move the sprite forward by a number of steps",
                    detail: "🟦 Motion: Move steps",
                    range: range,
                },
                {
                    label: "turn right degrees",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "turn right ${1:15}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Turn the sprite clockwise by degrees",
                    detail: "🟦 Motion: Turn right",
                    range: range,
                },
                {
                    label: "turn left degrees",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "turn left ${1:15}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Turn the sprite counter-clockwise by degrees",
                    detail: "🟦 Motion: Turn left",
                    range: range,
                },
                {
                    label: "go to mouse-pointer",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "goTo mouse",
                    documentation: "Go to the mouse pointer position",
                    detail: "🟦 Motion: Go to mouse",
                    range: range,
                },
                {
                    label: "go to random position",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "goTo random",
                    documentation: "Go to a random position on the stage",
                    detail: "🟦 Motion: Go to random",
                    range: range,
                },
                {
                    label: "go to sprite",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "goTo \"${1:Sprite1}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Go to another sprite's position",
                    detail: "🟦 Motion: Go to sprite",
                    range: range,
                },
                {
                    label: "go to x y",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "goTo x ${1:0} y ${2:0}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Go to specific x and y coordinates",
                    detail: "🟦 Motion: Go to x y",
                    range: range,
                },
                {
                    label: "glide to mouse-pointer",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "glideTo ${1:1} secs mouse",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Glide to mouse pointer over seconds",
                    detail: "🟦 Motion: Glide to mouse",
                    range: range,
                },
                {
                    label: "glide to random position",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "glideTo ${1:1} secs random",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Glide to random position over seconds",
                    detail: "🟦 Motion: Glide to random",
                    range: range,
                },
                {
                    label: "glide to x y",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "glideTo ${1:1} secs x ${2:0} y ${3:0}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Glide to x y coordinates over seconds",
                    detail: "🟦 Motion: Glide to x y",
                    range: range,
                },
                {
                    label: "point in direction",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "pointInDirection ${1:90}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Point the sprite in a direction (90=right, 0=up, -90=left, 180=down)",
                    detail: "🟦 Motion: Point direction",
                    range: range,
                },
                {
                    label: "point towards mouse-pointer",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "pointTowards mouse",
                    documentation: "Point towards the mouse pointer",
                    detail: "🟦 Motion: Point towards mouse",
                    range: range,
                },
                {
                    label: "point towards sprite",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "pointTowards \"${1:Sprite1}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Point towards another sprite",
                    detail: "🟦 Motion: Point towards sprite",
                    range: range,
                },
                {
                    label: "change x by",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "changeX ${1:10}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Change x position by an amount",
                    detail: "🟦 Motion: Change X",
                    range: range,
                },
                {
                    label: "set x to",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "setX ${1:0}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set x position to a value",
                    detail: "🟦 Motion: Set X",
                    range: range,
                },
                {
                    label: "change y by",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "changeY ${1:10}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Change y position by an amount",
                    detail: "🟦 Motion: Change Y",
                    range: range,
                },
                {
                    label: "set y to",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "setY ${1:0}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set y position to a value",
                    detail: "🟦 Motion: Set Y",
                    range: range,
                },
                {
                    label: "if on edge, bounce",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "bounceOnEdge",
                    documentation: "Bounce when touching the edge of the stage",
                    detail: "🟦 Motion: Bounce on edge",
                    range: range,
                },
                {
                    label: "set rotation style",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "setRotationStyle ${1|all around,left-right,don't rotate|}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set how the sprite rotates",
                    detail: "🟦 Motion: Rotation style",
                    range: range,
                },
                {
                    label: "x position",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "xPosition",
                    documentation: "Get the sprite's x position",
                    detail: "🟦 Motion: X position reporter",
                    range: range,
                },
                {
                    label: "y position",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "yPosition",
                    documentation: "Get the sprite's y position",
                    detail: "🟦 Motion: Y position reporter",
                    range: range,
                },
                {
                    label: "direction",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "direction",
                    documentation: "Get the sprite's direction",
                    detail: "🟦 Motion: Direction reporter",
                    range: range,
                },

                // ==================== LOOKS ====================
                {
                    label: "say text",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "say \"${1:Hello!}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Display a speech bubble with text",
                    detail: "🟪 Looks: Say text",
                    range: range,
                },
                {
                    label: "say text for seconds",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "say \"${1:Hello!}\" for ${2:2} seconds",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Display a speech bubble for a duration",
                    detail: "🟪 Looks: Say for seconds",
                    range: range,
                },
                {
                    label: "think text",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "think \"${1:Hmm...}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Display a thought bubble with text",
                    detail: "🟪 Looks: Think text",
                    range: range,
                },
                {
                    label: "think text for seconds",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "think \"${1:Hmm...}\" for ${2:2} seconds",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Display a thought bubble for a duration",
                    detail: "🟪 Looks: Think for seconds",
                    range: range,
                },
                {
                    label: "switch costume to",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "switchCostume \"${1:costume1}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Switch to a specific costume",
                    detail: "🟪 Looks: Switch costume",
                    range: range,
                },
                {
                    label: "next costume",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "nextCostume",
                    documentation: "Switch to the next costume",
                    detail: "🟪 Looks: Next costume",
                    range: range,
                },
                {
                    label: "switch backdrop to",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "switchBackdrop \"${1:backdrop1}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Switch to a specific backdrop",
                    detail: "🟪 Looks: Switch backdrop",
                    range: range,
                },
                {
                    label: "next backdrop",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "nextBackdrop",
                    documentation: "Switch to the next backdrop",
                    detail: "🟪 Looks: Next backdrop",
                    range: range,
                },
                {
                    label: "change size by",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "changeSizeBy ${1:10}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Change sprite size by a percentage",
                    detail: "🟪 Looks: Change size",
                    range: range,
                },
                {
                    label: "set size to %",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "setSize ${1:100} %",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set sprite size to a percentage",
                    detail: "🟪 Looks: Set size",
                    range: range,
                },
                {
                    label: "change effect by",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "change [${1|color,fisheye,whirl,pixelate,mosaic,brightness,ghost|}] effect by ${2:25}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Change a graphic effect by an amount",
                    detail: "🟪 Looks: Change effect",
                    range: range,
                },
                {
                    label: "set effect to",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "set [${1|color,fisheye,whirl,pixelate,mosaic,brightness,ghost|}] effect to ${2:0}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set a graphic effect to a value",
                    detail: "🟪 Looks: Set effect",
                    range: range,
                },
                {
                    label: "clear graphic effects",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "clearGraphicEffects",
                    documentation: "Clear all graphic effects",
                    detail: "🟪 Looks: Clear effects",
                    range: range,
                },
                {
                    label: "show",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "show",
                    documentation: "Make the sprite visible",
                    detail: "🟪 Looks: Show sprite",
                    range: range,
                },
                {
                    label: "hide",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "hide",
                    documentation: "Make the sprite invisible",
                    detail: "🟪 Looks: Hide sprite",
                    range: range,
                },
                {
                    label: "go to front layer",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "goToFront",
                    documentation: "Move sprite to front layer",
                    detail: "🟪 Looks: Go to front",
                    range: range,
                },
                {
                    label: "go to back layer",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "goToBack",
                    documentation: "Move sprite to back layer",
                    detail: "🟪 Looks: Go to back",
                    range: range,
                },
                {
                    label: "go forward layers",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "goForward ${1:1} layers",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Move sprite forward layers",
                    detail: "🟪 Looks: Go forward layers",
                    range: range,
                },
                {
                    label: "go backward layers",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "goBackward ${1:1} layers",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Move sprite backward layers",
                    detail: "🟪 Looks: Go backward layers",
                    range: range,
                },
                {
                    label: "costume number",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "costumeNumber",
                    documentation: "Get the current costume number",
                    detail: "🟪 Looks: Costume number reporter",
                    range: range,
                },
                {
                    label: "costume name",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "costumeName",
                    documentation: "Get the current costume name",
                    detail: "🟪 Looks: Costume name reporter",
                    range: range,
                },
                {
                    label: "backdrop number",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "backdropNumber",
                    documentation: "Get the current backdrop number",
                    detail: "🟪 Looks: Backdrop number reporter",
                    range: range,
                },
                {
                    label: "backdrop name",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "backdropName",
                    documentation: "Get the current backdrop name",
                    detail: "🟪 Looks: Backdrop name reporter",
                    range: range,
                },
                {
                    label: "size",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "size",
                    documentation: "Get the sprite's size",
                    detail: "🟪 Looks: Size reporter",
                    range: range,
                },

                // ==================== SOUND ====================
                {
                    label: "play sound until done",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "playSoundUntilDone \"${1:meow}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Play a sound and wait until it finishes",
                    detail: "🟩 Sound: Play until done",
                    range: range,
                },
                {
                    label: "start sound",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "startSound \"${1:meow}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Start playing a sound (don't wait)",
                    detail: "🟩 Sound: Start sound",
                    range: range,
                },
                {
                    label: "stop all sounds",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "stopAllSounds",
                    documentation: "Stop all currently playing sounds",
                    detail: "🟩 Sound: Stop all",
                    range: range,
                },
                {
                    label: "change volume by",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "changeVolumeBy ${1:-10}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Change volume by an amount",
                    detail: "🟩 Sound: Change volume",
                    range: range,
                },
                {
                    label: "set volume to %",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "setVolumeTo ${1:100}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set volume to a percentage",
                    detail: "🟩 Sound: Set volume",
                    range: range,
                },
                {
                    label: "volume",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "volume",
                    documentation: "Get the current volume",
                    detail: "🟩 Sound: Volume reporter",
                    range: range,
                },

                // ==================== SENSING ====================
                {
                    label: "touching mouse-pointer?",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "touching mouse",
                    documentation: "Check if sprite is touching the mouse pointer",
                    detail: "🟦 Sensing: Touching mouse?",
                    range: range,
                },
                {
                    label: "touching edge?",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "touching edge",
                    documentation: "Check if sprite is touching the edge",
                    detail: "🟦 Sensing: Touching edge?",
                    range: range,
                },
                {
                    label: "touching sprite?",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "touching \"${1:Sprite1}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Check if sprite is touching another sprite",
                    detail: "🟦 Sensing: Touching sprite?",
                    range: range,
                },
                {
                    label: "touching color?",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "touchingColor \"${1:#ff0000}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Check if sprite is touching a color",
                    detail: "🟦 Sensing: Touching color?",
                    range: range,
                },
                {
                    label: "color is touching color?",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "colorIsTouching \"${1:#ff0000}\" \"${2:#00ff00}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Check if a color on sprite is touching another color",
                    detail: "🟦 Sensing: Color touching color?",
                    range: range,
                },
                {
                    label: "distance to mouse-pointer",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "distanceTo mouse",
                    documentation: "Get distance to mouse pointer",
                    detail: "🟦 Sensing: Distance to mouse",
                    range: range,
                },
                {
                    label: "distance to sprite",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "distanceTo \"${1:Sprite1}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get distance to another sprite",
                    detail: "🟦 Sensing: Distance to sprite",
                    range: range,
                },
                {
                    label: "ask and wait",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "askAndWait \"${1:What's your name?}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Ask a question and wait for input",
                    detail: "🟦 Sensing: Ask and wait",
                    range: range,
                },
                {
                    label: "answer",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "answer",
                    documentation: "The answer from the last ask block",
                    detail: "🟦 Sensing: Answer value",
                    range: range,
                },
                {
                    label: "key pressed?",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "keyPressed ${1|space,up,down,left,right,any,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9|}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Check if a key is pressed",
                    detail: "🟦 Sensing: Key pressed?",
                    range: range,
                },
                {
                    label: "mouse down?",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "mouseDown",
                    documentation: "Check if mouse button is pressed",
                    detail: "🟦 Sensing: Mouse down?",
                    range: range,
                },
                {
                    label: "mouse x",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "mouseX",
                    documentation: "Get the mouse x position",
                    detail: "🟦 Sensing: Mouse X",
                    range: range,
                },
                {
                    label: "mouse y",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "mouseY",
                    documentation: "Get the mouse y position",
                    detail: "🟦 Sensing: Mouse Y",
                    range: range,
                },
                {
                    label: "set drag mode",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "setDragMode ${1|draggable,not draggable|}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set whether sprite can be dragged",
                    detail: "🟦 Sensing: Set drag mode",
                    range: range,
                },
                {
                    label: "loudness",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "loudness",
                    documentation: "Get the microphone loudness level",
                    detail: "🟦 Sensing: Loudness",
                    range: range,
                },
                {
                    label: "timer",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "timer",
                    documentation: "Get the timer value in seconds",
                    detail: "🟦 Sensing: Timer",
                    range: range,
                },
                {
                    label: "reset timer",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "resetTimer",
                    documentation: "Reset the timer to 0",
                    detail: "🟦 Sensing: Reset timer",
                    range: range,
                },
                {
                    label: "current date/time",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "current ${1|year,month,date,dayOfWeek,hour,minute,second|}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get current date/time component",
                    detail: "🟦 Sensing: Current time",
                    range: range,
                },
                {
                    label: "days since 2000",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "daysSince2000",
                    documentation: "Days since January 1, 2000",
                    detail: "🟦 Sensing: Days since 2000",
                    range: range,
                },
                {
                    label: "username",
                    kind: monacoInstance.languages.CompletionItemKind.Variable,
                    insertText: "username",
                    documentation: "Get the username",
                    detail: "🟦 Sensing: Username",
                    range: range,
                },

                // ==================== OPERATORS ====================
                {
                    label: "pick random to",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "random ${1:1} to ${2:10}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Pick a random number between two values",
                    detail: "🟧 Operators: Random number",
                    range: range,
                },
                {
                    label: "join strings",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "join \"${1:hello }\" \"${2:world}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Join two strings together",
                    detail: "🟧 Operators: Join strings",
                    range: range,
                },
                {
                    label: "letter of string",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "letter ${1:1} of \"${2:hello}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get a letter from a string",
                    detail: "🟧 Operators: Letter of string",
                    range: range,
                },
                {
                    label: "length of string",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "length of \"${1:hello}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the length of a string",
                    detail: "🟧 Operators: String length",
                    range: range,
                },
                {
                    label: "string contains?",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "\"${1:hello}\" contains \"${2:ell}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Check if a string contains another string",
                    detail: "🟧 Operators: String contains?",
                    range: range,
                },
                {
                    label: "mod (remainder)",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "${1:10} mod ${2:3}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the remainder of division (modulo)",
                    detail: "🟧 Operators: Modulo",
                    range: range,
                },
                {
                    label: "round",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "round ${1:3.5}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Round a number to nearest integer",
                    detail: "🟧 Operators: Round",
                    range: range,
                },
                {
                    label: "abs (absolute value)",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "abs ${1:-5}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get absolute value of a number",
                    detail: "🟧 Operators: Absolute value",
                    range: range,
                },
                {
                    label: "floor",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "floor ${1:3.7}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Round down to nearest integer",
                    detail: "🟧 Operators: Floor",
                    range: range,
                },
                {
                    label: "ceiling",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "ceiling ${1:3.2}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Round up to nearest integer",
                    detail: "🟧 Operators: Ceiling",
                    range: range,
                },
                {
                    label: "sqrt (square root)",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "sqrt ${1:16}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the square root of a number",
                    detail: "🟧 Operators: Square root",
                    range: range,
                },
                {
                    label: "sin",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "sin ${1:90}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the sine of an angle in degrees",
                    detail: "🟧 Operators: Sine",
                    range: range,
                },
                {
                    label: "cos",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "cos ${1:0}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the cosine of an angle in degrees",
                    detail: "🟧 Operators: Cosine",
                    range: range,
                },
                {
                    label: "tan",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "tan ${1:45}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the tangent of an angle in degrees",
                    detail: "🟧 Operators: Tangent",
                    range: range,
                },
                {
                    label: "asin",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "asin ${1:0.5}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the arc sine (result in degrees)",
                    detail: "🟧 Operators: Arc sine",
                    range: range,
                },
                {
                    label: "acos",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "acos ${1:0.5}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the arc cosine (result in degrees)",
                    detail: "🟧 Operators: Arc cosine",
                    range: range,
                },
                {
                    label: "atan",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "atan ${1:1}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the arc tangent (result in degrees)",
                    detail: "🟧 Operators: Arc tangent",
                    range: range,
                },
                {
                    label: "ln (natural log)",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "ln ${1:10}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the natural logarithm",
                    detail: "🟧 Operators: Natural log",
                    range: range,
                },
                {
                    label: "log (base 10)",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "log ${1:100}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the base 10 logarithm",
                    detail: "🟧 Operators: Log base 10",
                    range: range,
                },
                {
                    label: "e^ (e to the power)",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "ePowerOf ${1:1}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get e raised to a power",
                    detail: "🟧 Operators: e^",
                    range: range,
                },
                {
                    label: "10^ (10 to the power)",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "tenPowerOf ${1:2}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get 10 raised to a power",
                    detail: "🟧 Operators: 10^",
                    range: range,
                },
                {
                    label: "and",
                    kind: monacoInstance.languages.CompletionItemKind.Operator,
                    insertText: "${1:condition1} and ${2:condition2}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Logical AND - true if both conditions are true",
                    detail: "🟧 Operators: And",
                    range: range,
                },
                {
                    label: "or",
                    kind: monacoInstance.languages.CompletionItemKind.Operator,
                    insertText: "${1:condition1} or ${2:condition2}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Logical OR - true if either condition is true",
                    detail: "🟧 Operators: Or",
                    range: range,
                },
                {
                    label: "not",
                    kind: monacoInstance.languages.CompletionItemKind.Operator,
                    insertText: "not ${1:condition}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Logical NOT - inverts condition",
                    detail: "🟧 Operators: Not",
                    range: range,
                },

                // ==================== VARIABLES ====================
                {
                    label: "var (create variable)",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "var ${1:myVar} = ${2:0}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Declare a new variable",
                    detail: "🟨 Variables: Create variable",
                    range: range,
                },
                {
                    label: "set variable to",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "set [${1:myVar}] to ${2:0}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set a variable to a value",
                    detail: "🟨 Variables: Set variable",
                    range: range,
                },
                {
                    label: "change variable by",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "change [${1:myVar}] by ${2:1}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Change a variable by an amount",
                    detail: "🟨 Variables: Change variable",
                    range: range,
                },
                {
                    label: "show variable",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "showVariable [${1:myVar}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Show a variable monitor on stage",
                    detail: "🟨 Variables: Show variable",
                    range: range,
                },
                {
                    label: "hide variable",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "hideVariable [${1:myVar}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Hide a variable monitor",
                    detail: "🟨 Variables: Hide variable",
                    range: range,
                },

                // ==================== LISTS ====================
                {
                    label: "list (create list)",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "list ${1:myList} = []",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Declare a new list",
                    detail: "🟨 Lists: Create list",
                    range: range,
                },
                {
                    label: "add item to list",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "add \"${1:thing}\" to [${2:myList}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Add an item to the end of a list",
                    detail: "🟨 Lists: Add item",
                    range: range,
                },
                {
                    label: "delete item of list",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "delete ${1:1} of [${2:myList}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Delete an item from a list at index",
                    detail: "🟨 Lists: Delete item",
                    range: range,
                },
                {
                    label: "delete all of list",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "deleteAll of [${1:myList}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Delete all items from a list",
                    detail: "🟨 Lists: Delete all",
                    range: range,
                },
                {
                    label: "insert item at index of list",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "insert \"${1:thing}\" at ${2:1} of [${3:myList}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Insert an item at a position in a list",
                    detail: "🟨 Lists: Insert item",
                    range: range,
                },
                {
                    label: "replace item of list with",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "replace item ${1:1} of [${2:myList}] with \"${3:thing}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Replace an item in a list",
                    detail: "🟨 Lists: Replace item",
                    range: range,
                },
                {
                    label: "item of list",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "item ${1:1} of [${2:myList}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get an item from a list by index",
                    detail: "🟨 Lists: Item of list",
                    range: range,
                },
                {
                    label: "item # of in list",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "itemNumberOf \"${1:thing}\" in [${2:myList}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the index of an item in a list",
                    detail: "🟨 Lists: Item number",
                    range: range,
                },
                {
                    label: "length of list",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "lengthOf [${1:myList}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Get the number of items in a list",
                    detail: "🟨 Lists: Length of list",
                    range: range,
                },
                {
                    label: "list contains item?",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "[${1:myList}] contains \"${2:thing}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Check if a list contains an item",
                    detail: "🟨 Lists: Contains item?",
                    range: range,
                },
                {
                    label: "show list",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "showList [${1:myList}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Show a list monitor on stage",
                    detail: "🟨 Lists: Show list",
                    range: range,
                },
                {
                    label: "hide list",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "hideList [${1:myList}]",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Hide a list monitor",
                    detail: "🟨 Lists: Hide list",
                    range: range,
                },

                // ==================== MY BLOCKS (CUSTOM) ====================
                {
                    label: "define custom block",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "define ${1:myBlock}\n    ${2:// block code}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Define a custom block (procedure)",
                    detail: "🟥 My Blocks: Define block",
                    range: range,
                },
                {
                    label: "define custom block with args",
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: "define ${1:myBlock} (${2:arg1})\n    ${3:// block code}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Define a custom block with arguments",
                    detail: "🟥 My Blocks: Define with args",
                    range: range,
                },
                {
                    label: "call custom block",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "${1:myBlock}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Call a custom block",
                    detail: "🟥 My Blocks: Call block",
                    range: range,
                },

                // ==================== PEN EXTENSION ====================
                {
                    label: "erase all",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "erase",
                    documentation: "Erase all pen marks",
                    detail: "🟩 Pen: Erase all",
                    range: range,
                },
                {
                    label: "stamp",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "stamp",
                    documentation: "Stamp sprite image on stage",
                    detail: "🟩 Pen: Stamp",
                    range: range,
                },
                {
                    label: "pen down",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "penDown",
                    documentation: "Start drawing when sprite moves",
                    detail: "🟩 Pen: Pen down",
                    range: range,
                },
                {
                    label: "pen up",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "penUp",
                    documentation: "Stop drawing when sprite moves",
                    detail: "🟩 Pen: Pen up",
                    range: range,
                },
                {
                    label: "set pen color to",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "setPenColor \"${1:#ff0000}\"",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set the pen color",
                    detail: "🟩 Pen: Set pen color",
                    range: range,
                },
                {
                    label: "change pen color by",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "changePenColor ${1:10}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Change the pen color",
                    detail: "🟩 Pen: Change pen color",
                    range: range,
                },
                {
                    label: "set pen size to",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "setPenSize ${1:1}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Set the pen size",
                    detail: "🟩 Pen: Set pen size",
                    range: range,
                },
                {
                    label: "change pen size by",
                    kind: monacoInstance.languages.CompletionItemKind.Function,
                    insertText: "changePenSize ${1:1}",
                    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: "Change the pen size",
                    detail: "🟩 Pen: Change pen size",
                    range: range,
                },
            ];

            return { suggestions: suggestions };
        },
    };
};

export const initialCode = `// Welcome to CatScript Playground! 🐱
// Click the green flag to see this code in action

when flagClicked
    say "Hello! I'm going to dance!"
    wait 1
    
    // Do a fun dance pattern
    repeat 4
        move 50
        turn right 90
        wait 0.3
    
    say "Now watch me spin!"
    wait 1
    
    // Spin around
    repeat 12
        turn right 30
        wait 0.1
    
    say "Try editing this code!"
    wait 2
    say ""

// You can also use keyboard controls!
when keyPressed space
    say "You pressed space!" for 1 seconds

when keyPressed up
    move 20

when keyPressed down
    move -20

when keyPressed left
    turn left 15

when keyPressed right
    turn right 15
`;

// Toolbox categories with color-coded commands for the sidebar
export interface ToolboxCommand {
    label: string;
    code: string;
    needsIndent?: boolean; // Whether this command expects indented code below it
    description?: string;
}

export interface ToolboxCategory {
    name: string;
    color: string;
    icon: string;
    commands: ToolboxCommand[];
}

export const toolboxCategories: ToolboxCategory[] = [
    {
        name: "Events",
        color: SCRATCH_COLORS.events,
        icon: "",
        commands: [
            { label: "when flagClicked", code: "when flagClicked", needsIndent: true, description: "Run when flag is clicked" },
            { label: "when keyPressed [key]", code: 'when keyPressed space', needsIndent: true, description: "Run when a key is pressed" },
            { label: "when spriteClicked", code: "when spriteClicked", needsIndent: true, description: "Run when sprite is clicked" },
            { label: 'when receive "message"', code: 'when receive "message1"', needsIndent: true, description: "Run when message received" },
            { label: "when cloneStarted", code: "when cloneStarted", needsIndent: true, description: "Run when clone starts" },
            { label: 'broadcast "message"', code: 'broadcast "message1"', description: "Send a message" },
            { label: 'broadcastAndWait "message"', code: 'broadcastAndWait "message1"', description: "Send and wait for handlers" },
        ],
    },
    {
        name: "Control",
        color: SCRATCH_COLORS.control,
        icon: "",
        commands: [
            { label: "wait [n]", code: "wait 1", description: "Pause for seconds" },
            { label: "repeat [n]", code: "repeat 10", needsIndent: true, description: "Repeat code N times" },
            { label: "forever", code: "forever", needsIndent: true, description: "Repeat forever" },
            { label: "if [condition] then", code: "if condition then", needsIndent: true, description: "Run if condition is true" },
            { label: "if / else", code: "if condition then\n    // then code\nelse\n    // else code", description: "If-else statement" },
            { label: "waitUntil [condition]", code: "waitUntil condition", description: "Wait until condition is true" },
            { label: "repeatUntil [condition]", code: "repeatUntil condition", needsIndent: true, description: "Repeat until condition" },
            { label: "stop all", code: "stop all", description: "Stop all scripts" },
            { label: "stop this script", code: "stop this script", description: "Stop this script" },
            { label: "createClone myself", code: "createClone myself", description: "Create a clone of this sprite" },
            { label: "deleteThisClone", code: "deleteThisClone", description: "Delete this clone" },
        ],
    },
    {
        name: "Motion",
        color: SCRATCH_COLORS.motion,
        icon: "",
        commands: [
            { label: "move [n]", code: "move 10", description: "Move forward" },
            { label: "turn right [n]", code: "turn right 15", description: "Turn clockwise" },
            { label: "turn left [n]", code: "turn left 15", description: "Turn counter-clockwise" },
            { label: "goTo x [n] y [n]", code: "goTo x 0 y 0", description: "Go to position" },
            { label: "goTo random", code: "goTo random", description: "Go to random position" },
            { label: "goTo mouse", code: "goTo mouse", description: "Go to mouse" },
            { label: "glideTo [n] secs x [n] y [n]", code: "glideTo 1 secs x 0 y 0", description: "Glide to position" },
            { label: "pointInDirection [n]", code: "pointInDirection 90", description: "Point in direction" },
            { label: "pointTowards mouse", code: "pointTowards mouse", description: "Point towards mouse" },
            { label: "changeX [n]", code: "changeX 10", description: "Change x position" },
            { label: "setX [n]", code: "setX 0", description: "Set x position" },
            { label: "changeY [n]", code: "changeY 10", description: "Change y position" },
            { label: "setY [n]", code: "setY 0", description: "Set y position" },
            { label: "bounceOnEdge", code: "bounceOnEdge", description: "Bounce off edge" },
            { label: "setRotationStyle [style]", code: "setRotationStyle all around", description: "Set rotation style" },
        ],
    },
    {
        name: "Looks",
        color: SCRATCH_COLORS.looks,
        icon: "",
        commands: [
            { label: 'say "text"', code: 'say "Hello!"', description: "Show speech bubble" },
            { label: 'say "text" for [n] seconds', code: 'say "Hello!" for 2 seconds', description: "Say for duration" },
            { label: 'think "text"', code: 'think "Hmm..."', description: "Show thought bubble" },
            { label: 'think "text" for [n] seconds', code: 'think "Hmm..." for 2 seconds', description: "Think for duration" },
            { label: 'switchCostume "name"', code: 'switchCostume "costume1"', description: "Change costume" },
            { label: "nextCostume", code: "nextCostume", description: "Next costume" },
            { label: 'switchBackdrop "name"', code: 'switchBackdrop "backdrop1"', description: "Change backdrop" },
            { label: "nextBackdrop", code: "nextBackdrop", description: "Next backdrop" },
            { label: "changeSizeBy [n]", code: "changeSizeBy 10", description: "Change size" },
            { label: "setSize [n] %", code: "setSize 100 %", description: "Set size percentage" },
            { label: "show", code: "show", description: "Show sprite" },
            { label: "hide", code: "hide", description: "Hide sprite" },
            { label: "goToFront", code: "goToFront", description: "Go to front" },
            { label: "goToBack", code: "goToBack", description: "Go to back" },
        ],
    },
    {
        name: "Sound",
        color: SCRATCH_COLORS.sound,
        icon: "",
        commands: [
            { label: 'playSoundUntilDone "name"', code: 'playSoundUntilDone "meow"', description: "Play sound and wait" },
            { label: 'startSound "name"', code: 'startSound "meow"', description: "Start playing sound" },
            { label: "stopAllSounds", code: "stopAllSounds", description: "Stop all sounds" },
            { label: "changeVolumeBy [n]", code: "changeVolumeBy -10", description: "Change volume" },
            { label: "setVolumeTo [n]", code: "setVolumeTo 100", description: "Set volume" },
        ],
    },
    {
        name: "Sensing",
        color: SCRATCH_COLORS.sensing,
        icon: "",
        commands: [
            { label: "touching mouse", code: "touching mouse", description: "Check touching mouse" },
            { label: 'touching "sprite"', code: 'touching "Sprite1"', description: "Check touching sprite" },
            { label: "touching edge", code: "touching edge", description: "Check touching edge" },
            { label: 'touchingColor "#hex"', code: 'touchingColor "#ff0000"', description: "Check touching color" },
            { label: 'askAndWait "question"', code: 'askAndWait "What\'s your name?"', description: "Ask user for input" },
            { label: "answer", code: "answer", description: "Get user's answer" },
            { label: "keyPressed [key]", code: "keyPressed space", description: "Check key pressed" },
            { label: "mouseDown", code: "mouseDown", description: "Check mouse button" },
            { label: "mouseX", code: "mouseX", description: "Get mouse x position" },
            { label: "mouseY", code: "mouseY", description: "Get mouse y position" },
            { label: 'distanceTo "sprite"', code: 'distanceTo "Sprite1"', description: "Get distance to sprite" },
            { label: "timer", code: "timer", description: "Get timer value" },
            { label: "resetTimer", code: "resetTimer", description: "Reset timer to 0" },
        ],
    },
    {
        name: "Operators",
        color: SCRATCH_COLORS.operators,
        icon: "",
        commands: [
            { label: "(a + b)", code: "( + )", description: "Add numbers" },
            { label: "(a - b)", code: "( - )", description: "Subtract numbers" },
            { label: "(a * b)", code: "( * )", description: "Multiply numbers" },
            { label: "(a / b)", code: "( / )", description: "Divide numbers" },
            { label: "random [n] to [n]", code: "random 1 to 10", description: "Random number" },
            { label: "(a > b)", code: "( > )", description: "Greater than" },
            { label: "(a < b)", code: "( < )", description: "Less than" },
            { label: "(a = b)", code: "( = )", description: "Equal to" },
            { label: "(a and b)", code: "( and )", description: "Logical AND" },
            { label: "(a or b)", code: "( or )", description: "Logical OR" },
            { label: "not (a)", code: "not ( )", description: "Logical NOT" },
            { label: 'join "a" "b"', code: 'join "hello " "world"', description: "Join strings" },
            { label: 'letter [n] of "text"', code: 'letter 1 of "hello"', description: "Get letter" },
            { label: 'length of "text"', code: 'length of "hello"', description: "String length" },
            { label: "(a mod b)", code: "( mod )", description: "Modulo (remainder)" },
            { label: "round [n]", code: "round 3.5", description: "Round number" },
            { label: "abs [n]", code: "abs -5", description: "Absolute value" },
        ],
    },
    {
        name: "Variables",
        color: SCRATCH_COLORS.variables,
        icon: "",
        commands: [
            { label: "var name = value", code: "var myVar = 0", description: "Create a variable" },
            { label: "set [var] to value", code: "set [myVar] to 0", description: "Set variable value" },
            { label: "change [var] by [n]", code: "change [myVar] by 1", description: "Change variable" },
            { label: "showVariable [var]", code: "showVariable [myVar]", description: "Show variable monitor" },
            { label: "hideVariable [var]", code: "hideVariable [myVar]", description: "Hide variable monitor" },
            { label: "list name = []", code: "list myList = []", description: "Create a list" },
            { label: 'add "item" to [list]', code: 'add "thing" to [myList]', description: "Add to list" },
            { label: "delete [n] of [list]", code: "delete 1 of [myList]", description: "Delete from list" },
            { label: 'insert "item" at [n] of [list]', code: 'insert "thing" at 1 of [myList]', description: "Insert in list" },
            { label: 'replace item [n] of [list] with "item"', code: 'replace item 1 of [myList] with "thing"', description: "Replace in list" },
            { label: "item [n] of [list]", code: "item 1 of [myList]", description: "Get list item" },
            { label: "lengthOf [list]", code: "lengthOf [myList]", description: "List length" },
            { label: '[list] contains "item"', code: '[myList] contains "thing"', description: "Check if in list" },
        ],
    },
    {
        name: "My Blocks",
        color: SCRATCH_COLORS.myBlocks,
        icon: "",
        commands: [
            { label: "define blockName", code: "define myBlock", needsIndent: true, description: "Define custom block" },
            { label: "define blockName (args)", code: "define myBlock (arg1)", needsIndent: true, description: "Define with arguments" },
            { label: "blockName", code: "myBlock", description: "Call custom block" },
        ],
    },
    {
        name: "Pen",
        color: SCRATCH_COLORS.pen,
        icon: "",
        commands: [
            { label: "erase", code: "erase", description: "Clear all pen marks" },
            { label: "stamp", code: "stamp", description: "Stamp sprite" },
            { label: "penDown", code: "penDown", description: "Start drawing" },
            { label: "penUp", code: "penUp", description: "Stop drawing" },
            { label: 'setPenColor "#hex"', code: 'setPenColor "#ff0000"', description: "Set pen color" },
            { label: "changePenSize [n]", code: "changePenSize 1", description: "Change pen size" },
            { label: "setPenSize [n]", code: "setPenSize 1", description: "Set pen size" },
        ],
    },
];
