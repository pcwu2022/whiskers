import { SCRATCH_COLORS } from "./scratchColors";

// Block types determine valid drop zones and visual shape
export type BlockType = 
    | "statement"   // Stack blocks (move, say, set) - connects top/bottom
    | "hat"         // Event blocks (when flag clicked) - only connects bottom
    | "cap"         // End blocks (stop all, delete clone) - only connects top
    | "reporter"    // Value blocks (x position, timer) - rounded, fits in value slots
    | "boolean"     // Boolean blocks (touching, key pressed) - hexagonal, fits in boolean slots
    | "c-block"     // C-shaped blocks (if, repeat, forever) - wraps other blocks

// Toolbox categories with color-coded commands for the sidebar
export interface ToolboxCommand {
    label: string;
    code: string;
    needsIndent?: boolean; // Whether this command expects indented code below it
    description?: string;
    blockType?: BlockType; // Type of block for drag-drop and visual styling
}

export interface ToolboxCategory {
    name: string;
    color: string;
    icon: string;
    commands: ToolboxCommand[];
}

export const toolboxCategories: ToolboxCategory[] = [
    {
        name: "Motion",
        color: SCRATCH_COLORS.motion,
        icon: "",
        commands: [
            { label: "move _ steps", code: "move ⬤ steps", description: "Move forward", blockType: "statement" },
            { label: "turn right _ degrees", code: "turn right ⬤ degrees", description: "Turn clockwise", blockType: "statement" },
            { label: "turn left _ degrees", code: "turn left ⬤ degrees", description: "Turn counter-clockwise", blockType: "statement" },
            { label: "go to x: _ y: _", code: "go to x: ⬤ y: ⬤", description: "Go to position", blockType: "statement" },
            { label: "go to random position", code: "go to random position", description: "Go to random position", blockType: "statement" },
            { label: "go to mouse-pointer", code: "go to mouse-pointer", description: "Go to mouse", blockType: "statement" },
            { label: "glide _ secs to x: _ y: _", code: "glide ⬤ secs to x: ⬤ y: ⬤", description: "Glide to position", blockType: "statement" },
            { label: "point in direction _", code: "point in direction ⬤", description: "Point in direction", blockType: "statement" },
            { label: "point towards mouse-pointer", code: "point towards mouse-pointer", description: "Point towards mouse", blockType: "statement" },
            { label: "change x by _", code: "change x by ⬤", description: "Change x position", blockType: "statement" },
            { label: "set x to _", code: "set x to ⬤", description: "Set x position", blockType: "statement" },
            { label: "change y by _", code: "change y by ⬤", description: "Change y position", blockType: "statement" },
            { label: "set y to _", code: "set y to ⬤", description: "Set y position", blockType: "statement" },
            { label: "if on edge, bounce", code: "if on edge, bounce", description: "Bounce off edge", blockType: "statement" },
            { label: "set rotation style _", code: "set rotation style ⬤", description: "Set rotation style", blockType: "statement" },
            // Motion Reporters (built-in variables)
            { label: "x position", code: "x position", description: "Sprite's x position", blockType: "reporter" },
            { label: "y position", code: "y position", description: "Sprite's y position", blockType: "reporter" },
            { label: "direction", code: "direction", description: "Sprite's direction", blockType: "reporter" },
        ],
    },
    {
        name: "Looks",
        color: SCRATCH_COLORS.looks,
        icon: "",
        commands: [
            { label: "say _", code: 'say "⬤"', description: "Show speech bubble", blockType: "statement" },
            { label: "say _ for _ seconds", code: 'say "⬤" for ⬤ seconds', description: "Say for duration", blockType: "statement" },
            { label: "think _", code: 'think "⬤"', description: "Show thought bubble", blockType: "statement" },
            { label: "think _ for _ seconds", code: 'think "⬤" for ⬤ seconds', description: "Think for duration", blockType: "statement" },
            { label: "switch costume to _", code: 'switch costume to "⬤"', description: "Change costume", blockType: "statement" },
            { label: "next costume", code: "next costume", description: "Next costume", blockType: "statement" },
            { label: "switch backdrop to _", code: 'switch backdrop to "⬤"', description: "Change backdrop", blockType: "statement" },
            { label: "next backdrop", code: "next backdrop", description: "Next backdrop", blockType: "statement" },
            { label: "change size by _", code: "change size by ⬤", description: "Change size", blockType: "statement" },
            { label: "set size to _", code: "set size to ⬤", description: "Set size percentage", blockType: "statement" },
            { label: "change ghost effect by _", code: "change ghost effect by ⬤", description: "Change ghost effect", blockType: "statement" },
            { label: "set ghost effect to _", code: "set ghost effect to ⬤", description: "Set ghost effect", blockType: "statement" },
            { label: "clear graphic effects", code: "clear graphic effects", description: "Clear all effects", blockType: "statement" },
            { label: "show", code: "show", description: "Show sprite", blockType: "statement" },
            { label: "hide", code: "hide", description: "Hide sprite", blockType: "statement" },
            { label: "go to front layer", code: "go to front layer", description: "Go to front", blockType: "statement" },
            { label: "go to back layer", code: "go to back layer", description: "Go to back", blockType: "statement" },
            // Looks Reporters (built-in variables)
            { label: "costume number", code: "costume number", description: "Current costume number", blockType: "reporter" },
            { label: "costume name", code: "costume name", description: "Current costume name", blockType: "reporter" },
            { label: "backdrop number", code: "backdrop number", description: "Current backdrop number", blockType: "reporter" },
            { label: "backdrop name", code: "backdrop name", description: "Current backdrop name", blockType: "reporter" },
            { label: "size", code: "size", description: "Sprite's size percentage", blockType: "reporter" },
        ],
    },
    {
        name: "Sound",
        color: SCRATCH_COLORS.sound,
        icon: "",
        commands: [
            { label: "play sound _ until done", code: 'play sound "⬤" until done', description: "Play sound and wait", blockType: "statement" },
            { label: "start sound _", code: 'start sound "⬤"', description: "Start playing sound", blockType: "statement" },
            { label: "stop all sounds", code: "stop all sounds", description: "Stop all sounds", blockType: "statement" },
            { label: "change volume by _", code: "change volume by ⬤", description: "Change volume", blockType: "statement" },
            { label: "set volume to _", code: "set volume to ⬤", description: "Set volume", blockType: "statement" },
            // Sound Reporters (built-in variables)
            { label: "volume", code: "volume", description: "Current volume", blockType: "reporter" },
        ],
    },
    {
        name: "Events",
        color: SCRATCH_COLORS.events,
        icon: "",
        commands: [
            { label: "when green flag clicked", code: "when green flag clicked", needsIndent: true, description: "Run when flag is clicked", blockType: "hat" },
            { label: "when _ key pressed", code: 'when ⬤ key pressed', needsIndent: true, description: "Run when a key is pressed", blockType: "hat" },
            { label: "when this sprite clicked", code: "when this sprite clicked", needsIndent: true, description: "Run when sprite is clicked", blockType: "hat" },
            { label: "when I receive _", code: 'when I receive "⬤"', needsIndent: true, description: "Run when message received", blockType: "hat" },
            { label: "when I start as a clone", code: "when I start as a clone", needsIndent: true, description: "Run when clone starts", blockType: "hat" },
            { label: "broadcast _", code: 'broadcast "⬤"', description: "Send a message", blockType: "statement" },
            { label: "broadcast _ and wait", code: 'broadcast "⬤" and wait', description: "Send and wait for handlers", blockType: "statement" },
        ],
    },
    {
        name: "Control",
        color: SCRATCH_COLORS.control,
        icon: "",
        commands: [
            { label: "wait _ seconds", code: "wait ⬤ seconds", description: "Pause for seconds", blockType: "statement" },
            { label: "repeat _", code: "repeat ⬤", needsIndent: true, description: "Repeat code N times", blockType: "c-block" },
            { label: "forever", code: "forever", needsIndent: true, description: "Repeat forever", blockType: "c-block" },
            { label: "if _ then", code: "if ⯁ then", needsIndent: true, description: "Run if condition is true", blockType: "c-block" },
            { label: "if _ then / else", code: "if ⯁ then\n    // then code\nelse\n    // else code\nend", description: "If-else statement", blockType: "c-block" },
            { label: "wait until _", code: "wait until ⯁", description: "Wait until condition is true", blockType: "statement" },
            { label: "repeat until _", code: "repeat until ⯁", needsIndent: true, description: "Repeat until condition", blockType: "c-block" },
            { label: "stop all", code: "stop all", description: "Stop all scripts", blockType: "cap" },
            { label: "stop this script", code: "stop this script", description: "Stop this script", blockType: "cap" },
            { label: "create clone of myself", code: "create clone of myself", description: "Create a clone of this sprite", blockType: "statement" },
            { label: "create clone of _", code: 'create clone of "⬤"', description: "Create a clone of sprite", blockType: "statement" },
            { label: "delete this clone", code: "delete this clone", description: "Delete this clone", blockType: "cap" },
        ],
    },
    {
        name: "Sensing",
        color: SCRATCH_COLORS.sensing,
        icon: "",
        commands: [
            { label: "touching mouse-pointer", code: "touching mouse-pointer", description: "Check touching mouse", blockType: "boolean" },
            { label: "touching _", code: 'touching "⬤"', description: "Check touching sprite", blockType: "boolean" },
            { label: "touching edge", code: "touching edge", description: "Check touching edge", blockType: "boolean" },
            { label: "touching color _", code: 'touching color "⬤"', description: "Check touching color", blockType: "boolean" },
            { label: "ask _ and wait", code: 'ask "⬤" and wait', description: "Ask user for input", blockType: "statement" },
            { label: "key _ pressed", code: "key ⬤ pressed", description: "Check key pressed", blockType: "boolean" },
            { label: "mouse down", code: "mouse down", description: "Check mouse button", blockType: "boolean" },
            { label: "distance to _", code: 'distance to "⬤"', description: "Get distance to sprite", blockType: "reporter" },
            { label: "reset timer", code: "reset timer", description: "Reset timer to 0", blockType: "statement" },
            // Sensing Reporters (built-in variables)
            { label: "answer", code: "answer", description: "User's last answer", blockType: "reporter" },
            { label: "mouse x", code: "mouse x", description: "Mouse x position", blockType: "reporter" },
            { label: "mouse y", code: "mouse y", description: "Mouse y position", blockType: "reporter" },
            { label: "loudness", code: "loudness", description: "Microphone loudness", blockType: "reporter" },
            { label: "timer", code: "timer", description: "Time since last reset", blockType: "reporter" },
            { label: "username", code: "username", description: "User's username", blockType: "reporter" },
            { label: "current year", code: "current year", description: "Current year", blockType: "reporter" },
            { label: "current month", code: "current month", description: "Current month (1-12)", blockType: "reporter" },
            { label: "current date", code: "current date", description: "Current day of month (1-31)", blockType: "reporter" },
            { label: "current day of week", code: "current day of week", description: "Day of week (1-7)", blockType: "reporter" },
            { label: "current hour", code: "current hour", description: "Current hour (0-23)", blockType: "reporter" },
            { label: "current minute", code: "current minute", description: "Current minute (0-59)", blockType: "reporter" },
            { label: "current second", code: "current second", description: "Current second (0-59)", blockType: "reporter" },
            { label: "days since 2000", code: "days since 2000", description: "Days since Jan 1, 2000", blockType: "reporter" },
        ],
    },
    {
        name: "Operators",
        color: SCRATCH_COLORS.operators,
        icon: "",
        commands: [
            { label: "_ + _", code: "⬤ + ⬤", description: "Add numbers", blockType: "reporter" },
            { label: "_ - _", code: "⬤ - ⬤", description: "Subtract numbers", blockType: "reporter" },
            { label: "_ * _", code: "⬤ * ⬤", description: "Multiply numbers", blockType: "reporter" },
            { label: "_ / _", code: "⬤ / ⬤", description: "Divide numbers", blockType: "reporter" },
            { label: "pick random _ to _", code: "pick random ⬤ to ⬤", description: "Random number", blockType: "reporter" },
            { label: "_ > _", code: "⬤ > ⬤", description: "Greater than", blockType: "boolean" },
            { label: "_ < _", code: "⬤ < ⬤", description: "Less than", blockType: "boolean" },
            { label: "_ = _", code: "⬤ = ⬤", description: "Equal to", blockType: "boolean" },
            { label: "_ and _", code: "⯁ and ⯁", description: "Logical AND", blockType: "boolean" },
            { label: "_ or _", code: "⯁ or ⯁", description: "Logical OR", blockType: "boolean" },
            { label: "not _", code: "not ⯁", description: "Logical NOT", blockType: "boolean" },
            { label: "join _ _", code: 'join "⬤" "⬤"', description: "Join strings", blockType: "reporter" },
            { label: "letter _ of _", code: 'letter ⬤ of "⬤"', description: "Get letter", blockType: "reporter" },
            { label: "length of _", code: 'length of "⬤"', description: "String length", blockType: "reporter" },
            { label: "_ mod _", code: "⬤ mod ⬤", description: "Modulo (remainder)", blockType: "reporter" },
            { label: "round _", code: "round ⬤", description: "Round number", blockType: "reporter" },
            { label: "abs of _", code: "abs of ⬤", description: "Absolute value", blockType: "reporter" },
        ],
    },
    {
        name: "Variables",
        color: SCRATCH_COLORS.variables,
        icon: "",
        commands: [
            { label: "var _ = _", code: "var ⬤ = ⬤", description: "Create a variable", blockType: "statement" },
            { label: "set _ to _", code: "set ⬤ to ⬤", description: "Set variable value", blockType: "statement" },
            { label: "change _ by _", code: "change ⬤ by ⬤", description: "Change variable", blockType: "statement" },
            { label: "show variable _", code: "show variable ⬤", description: "Show variable monitor", blockType: "statement" },
            { label: "hide variable _", code: "hide variable ⬤", description: "Hide variable monitor", blockType: "statement" },
            { label: "list _ = []", code: "list ⬤ = []", description: "Create a list", blockType: "statement" },
            { label: "add _ to _", code: "add ⬤ to ⬤", description: "Add to list", blockType: "statement" },
            { label: "delete _ of _", code: "delete ⬤ of ⬤", description: "Delete from list", blockType: "statement" },
            { label: "delete all of _", code: "delete all of ⬤", description: "Clear list", blockType: "statement" },
            { label: "insert _ at _ of _", code: "insert ⬤ at ⬤ of ⬤", description: "Insert in list", blockType: "statement" },
            { label: "replace item _ of _ with _", code: "replace item ⬤ of ⬤ with ⬤", description: "Replace in list", blockType: "statement" },
            { label: "item _ of _", code: "item ⬤ of ⬤", description: "Get list item", blockType: "reporter" },
            { label: "length of _", code: "length of ⬤", description: "List length", blockType: "reporter" },
            { label: "_ contains _", code: "⬤ contains ⬤", description: "Check if in list", blockType: "boolean" },
        ],
    },
    {
        name: "My Blocks",
        color: SCRATCH_COLORS.myBlocks,
        icon: "",
        commands: [
            { label: "define _", code: "define ⬤", needsIndent: true, description: "Define custom block", blockType: "hat" },
            { label: "define _ _", code: "define ⬤ ⬤", needsIndent: true, description: "Define with arguments", blockType: "hat" },
            { label: "call _", code: "call ⬤", description: "Call custom block", blockType: "statement" },
        ],
    },
    {
        name: "Pen",
        color: SCRATCH_COLORS.pen,
        icon: "",
        commands: [
            { label: "erase all", code: "erase all", description: "Clear all pen marks", blockType: "statement" },
            { label: "stamp", code: "stamp", description: "Stamp sprite", blockType: "statement" },
            { label: "pen down", code: "pen down", description: "Start drawing", blockType: "statement" },
            { label: "pen up", code: "pen up", description: "Stop drawing", blockType: "statement" },
            { label: "set pen color to _", code: 'set pen color to "⬤"', description: "Set pen color", blockType: "statement" },
            { label: "change pen size by _", code: "change pen size by ⬤", description: "Change pen size", blockType: "statement" },
            { label: "set pen size to _", code: "set pen size to ⬤", description: "Set pen size", blockType: "statement" },
        ],
    },
];
