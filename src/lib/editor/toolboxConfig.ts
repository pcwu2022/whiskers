import { SCRATCH_COLORS } from "./scratchColors";

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
        name: "Motion",
        color: SCRATCH_COLORS.motion,
        icon: "",
        commands: [
            { label: "move _ steps", code: "move █ steps", description: "Move forward" },
            { label: "turn right _ degrees", code: "turn right █ degrees", description: "Turn clockwise" },
            { label: "turn left _ degrees", code: "turn left █ degrees", description: "Turn counter-clockwise" },
            { label: "go to x: _ y: _", code: "go to x: █ y: █", description: "Go to position" },
            { label: "go to random position", code: "go to random position", description: "Go to random position" },
            { label: "go to mouse-pointer", code: "go to mouse-pointer", description: "Go to mouse" },
            { label: "glide _ secs to x: _ y: _", code: "glide █ secs to x: █ y: █", description: "Glide to position" },
            { label: "point in direction _", code: "point in direction █", description: "Point in direction" },
            { label: "point towards mouse-pointer", code: "point towards mouse-pointer", description: "Point towards mouse" },
            { label: "change x by _", code: "change x by █", description: "Change x position" },
            { label: "set x to _", code: "set x to █", description: "Set x position" },
            { label: "change y by _", code: "change y by █", description: "Change y position" },
            { label: "set y to _", code: "set y to █", description: "Set y position" },
            { label: "if on edge, bounce", code: "if on edge, bounce", description: "Bounce off edge" },
            { label: "set rotation style _", code: "set rotation style █", description: "Set rotation style" },
        ],
    },
    {
        name: "Looks",
        color: SCRATCH_COLORS.looks,
        icon: "",
        commands: [
            { label: "say _", code: 'say "█"', description: "Show speech bubble" },
            { label: "say _ for _ seconds", code: 'say "█" for █ seconds', description: "Say for duration" },
            { label: "think _", code: 'think "█"', description: "Show thought bubble" },
            { label: "think _ for _ seconds", code: 'think "█" for █ seconds', description: "Think for duration" },
            { label: "switch costume to _", code: 'switch costume to "█"', description: "Change costume" },
            { label: "next costume", code: "next costume", description: "Next costume" },
            { label: "switch backdrop to _", code: 'switch backdrop to "█"', description: "Change backdrop" },
            { label: "next backdrop", code: "next backdrop", description: "Next backdrop" },
            { label: "change size by _", code: "change size by █", description: "Change size" },
            { label: "set size to _", code: "set size to █", description: "Set size percentage" },
            { label: "change ghost effect by _", code: "change ghost effect by █", description: "Change ghost effect" },
            { label: "set ghost effect to _", code: "set ghost effect to █", description: "Set ghost effect" },
            { label: "clear graphic effects", code: "clear graphic effects", description: "Clear all effects" },
            { label: "show", code: "show", description: "Show sprite" },
            { label: "hide", code: "hide", description: "Hide sprite" },
            { label: "go to front layer", code: "go to front layer", description: "Go to front" },
            { label: "go to back layer", code: "go to back layer", description: "Go to back" },
        ],
    },
    {
        name: "Sound",
        color: SCRATCH_COLORS.sound,
        icon: "",
        commands: [
            { label: "play sound _ until done", code: 'play sound "█" until done', description: "Play sound and wait" },
            { label: "start sound _", code: 'start sound "█"', description: "Start playing sound" },
            { label: "stop all sounds", code: "stop all sounds", description: "Stop all sounds" },
            { label: "change volume by _", code: "change volume by █", description: "Change volume" },
            { label: "set volume to _", code: "set volume to █", description: "Set volume" },
        ],
    },
    {
        name: "Events",
        color: SCRATCH_COLORS.events,
        icon: "",
        commands: [
            { label: "when green flag clicked", code: "when green flag clicked", needsIndent: true, description: "Run when flag is clicked" },
            { label: "when _ key pressed", code: 'when █ key pressed', needsIndent: true, description: "Run when a key is pressed" },
            { label: "when this sprite clicked", code: "when this sprite clicked", needsIndent: true, description: "Run when sprite is clicked" },
            { label: "when I receive _", code: 'when I receive "█"', needsIndent: true, description: "Run when message received" },
            { label: "when I start as a clone", code: "when I start as a clone", needsIndent: true, description: "Run when clone starts" },
            { label: "broadcast _", code: 'broadcast "█"', description: "Send a message" },
            { label: "broadcast _ and wait", code: 'broadcast "█" and wait', description: "Send and wait for handlers" },
        ],
    },
    {
        name: "Control",
        color: SCRATCH_COLORS.control,
        icon: "",
        commands: [
            { label: "wait _ seconds", code: "wait █ seconds", description: "Pause for seconds" },
            { label: "repeat _", code: "repeat █", needsIndent: true, description: "Repeat code N times" },
            { label: "forever", code: "forever", needsIndent: true, description: "Repeat forever" },
            { label: "if _ then", code: "if █ then", needsIndent: true, description: "Run if condition is true" },
            { label: "if _ then / else", code: "if █ then\n    // then code\nelse\n    // else code\nend", description: "If-else statement" },
            { label: "wait until _", code: "wait until █", description: "Wait until condition is true" },
            { label: "repeat until _", code: "repeat until █", needsIndent: true, description: "Repeat until condition" },
            { label: "stop all", code: "stop all", description: "Stop all scripts" },
            { label: "stop this script", code: "stop this script", description: "Stop this script" },
            { label: "create clone of myself", code: "create clone of myself", description: "Create a clone of this sprite" },
            { label: "create clone of _", code: 'create clone of "█"', description: "Create a clone of sprite" },
            { label: "delete this clone", code: "delete this clone", description: "Delete this clone" },
        ],
    },
    {
        name: "Sensing",
        color: SCRATCH_COLORS.sensing,
        icon: "",
        commands: [
            { label: "touching mouse-pointer", code: "touching mouse-pointer", description: "Check touching mouse" },
            { label: "touching _", code: 'touching "█"', description: "Check touching sprite" },
            { label: "touching edge", code: "touching edge", description: "Check touching edge" },
            { label: "touching color _", code: 'touching color "█"', description: "Check touching color" },
            { label: "ask _ and wait", code: 'ask "█" and wait', description: "Ask user for input" },
            { label: "answer", code: "answer", description: "Get user's answer" },
            { label: "key _ pressed", code: "key █ pressed", description: "Check key pressed" },
            { label: "mouse down", code: "mouse down", description: "Check mouse button" },
            { label: "mouse x", code: "mouse x", description: "Get mouse x position" },
            { label: "mouse y", code: "mouse y", description: "Get mouse y position" },
            { label: "distance to _", code: 'distance to "█"', description: "Get distance to sprite" },
            { label: "timer", code: "timer", description: "Get timer value" },
            { label: "reset timer", code: "reset timer", description: "Reset timer to 0" },
        ],
    },
    {
        name: "Operators",
        color: SCRATCH_COLORS.operators,
        icon: "",
        commands: [
            { label: "_ + _", code: "█ + █", description: "Add numbers" },
            { label: "_ - _", code: "█ - █", description: "Subtract numbers" },
            { label: "_ * _", code: "█ * █", description: "Multiply numbers" },
            { label: "_ / _", code: "█ / █", description: "Divide numbers" },
            { label: "pick random _ to _", code: "pick random █ to █", description: "Random number" },
            { label: "_ > _", code: "█ > █", description: "Greater than" },
            { label: "_ < _", code: "█ < █", description: "Less than" },
            { label: "_ = _", code: "█ = █", description: "Equal to" },
            { label: "_ and _", code: "█ and █", description: "Logical AND" },
            { label: "_ or _", code: "█ or █", description: "Logical OR" },
            { label: "not _", code: "not █", description: "Logical NOT" },
            { label: "join _ _", code: 'join "█" "█"', description: "Join strings" },
            { label: "letter _ of _", code: 'letter █ of "█"', description: "Get letter" },
            { label: "length of _", code: 'length of "█"', description: "String length" },
            { label: "_ mod _", code: "█ mod █", description: "Modulo (remainder)" },
            { label: "round _", code: "round █", description: "Round number" },
            { label: "abs of _", code: "abs of █", description: "Absolute value" },
        ],
    },
    {
        name: "Variables",
        color: SCRATCH_COLORS.variables,
        icon: "",
        commands: [
            { label: "var _ = _", code: "var █ = █", description: "Create a variable" },
            { label: "set _ to _", code: "set █ to █", description: "Set variable value" },
            { label: "change _ by _", code: "change █ by █", description: "Change variable" },
            { label: "show variable _", code: "show variable █", description: "Show variable monitor" },
            { label: "hide variable _", code: "hide variable █", description: "Hide variable monitor" },
            { label: "list _ = []", code: "list █ = []", description: "Create a list" },
            { label: "add _ to _", code: "add █ to █", description: "Add to list" },
            { label: "delete _ of _", code: "delete █ of █", description: "Delete from list" },
            { label: "delete all of _", code: "delete all of █", description: "Clear list" },
            { label: "insert _ at _ of _", code: "insert █ at █ of █", description: "Insert in list" },
            { label: "replace item _ of _ with _", code: "replace item █ of █ with █", description: "Replace in list" },
            { label: "item _ of _", code: "item █ of █", description: "Get list item" },
            { label: "length of _", code: "length of █", description: "List length" },
            { label: "_ contains _", code: "█ contains █", description: "Check if in list" },
        ],
    },
    {
        name: "My Blocks",
        color: SCRATCH_COLORS.myBlocks,
        icon: "",
        commands: [
            { label: "define _", code: "define █", needsIndent: true, description: "Define custom block" },
            { label: "define _ _", code: "define █ █", needsIndent: true, description: "Define with arguments" },
            { label: "call _", code: "call █", description: "Call custom block" },
        ],
    },
    {
        name: "Pen",
        color: SCRATCH_COLORS.pen,
        icon: "",
        commands: [
            { label: "erase all", code: "erase all", description: "Clear all pen marks" },
            { label: "stamp", code: "stamp", description: "Stamp sprite" },
            { label: "pen down", code: "pen down", description: "Start drawing" },
            { label: "pen up", code: "pen up", description: "Stop drawing" },
            { label: "set pen color to _", code: 'set pen color to "█"', description: "Set pen color" },
            { label: "change pen size by _", code: "change pen size by █", description: "Change pen size" },
            { label: "set pen size to _", code: "set pen size to █", description: "Set pen size" },
        ],
    },
];
