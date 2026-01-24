# Text-Based Scratch Compiler Documentation

## Overview

The Text-Based Scratch Compiler converts Scratch-like syntax written in text form into executable JavaScript code with an HTML preview. It provides a way to write Scratch programs using text rather than the drag-and-drop visual interface, while maintaining Scratch's approachable syntax and semantics.

## Architecture

```
Source Code → Lexer → Tokens → Parser → AST → CodeGenerator → JavaScript + HTML
```

## Core Components

### Files

| File | Description |
|------|-------------|
| `compiler.ts` | Main compiler class that orchestrates the compilation pipeline |
| `lexer.ts` | Tokenizes source code into tokens |
| `parser.ts` | Converts tokens into an Abstract Syntax Tree (AST) |
| `codeGenerator.ts` | Converts AST to JavaScript code |
| `debugger.ts` | Debug logging utilities |

### ScratchTextCompiler

Main compiler class that orchestrates the compilation process.

**Methods:**
- `compile(code: string): { js: string; html: string }` - Compiles single-sprite code
- `compileMultiSprite(sprites: SpriteInput[]): { js: string; html: string; parsedSprites: unknown }` - Compiles multiple sprites

### Lexer

Tokenizes source code into tokens for parsing.

**Token Types:**
- `KEYWORD` - Reserved words (when, if, say, move, etc.)
- `IDENTIFIER` - Variable/sprite names
- `STRING` - Quoted strings
- `NUMBER` - Numeric literals
- `OPERATOR` - Mathematical and comparison operators
- `INDENT`/`DEDENT` - Indentation changes
- `NEWLINE` - Line breaks
- `EOF` - End of file

### Parser

Converts tokens into an Abstract Syntax Tree (AST).

**Key Features:**
- Multi-word keyword handling (`when I receive`, `when I start as a clone`)
- Indentation-based block nesting
- Variable and list declarations
- Custom procedure definitions

### CodeGenerator

Converts AST to JavaScript code.

**Output:**
- `js` - JavaScript code with Scratch runtime
- `html` - Complete HTML page with stage, sprites, and controls

## Data Types

### BlockType
```typescript
type BlockType = 'event' | 'motion' | 'looks' | 'sound' | 'control' | 
                 'sensing' | 'operators' | 'variables' | 'pen' | 'custom';
```

### BlockNode
```typescript
interface BlockNode {
  type: BlockType;
  name: string;
  args: (string | number | BlockNode)[];
  next?: BlockNode;
  body?: BlockNode[];
  elseBody?: BlockNode[];
}
```

### Program
```typescript
interface Program {
  scripts: Script[];
  variables: Map<string, any>;
  lists: Map<string, any[]>;
}
```

## Supported Syntax

### Multi-Sprite Structure
```
sprite SpriteName
    // sprite scripts here

sprite AnotherSprite
    // another sprite's scripts
```

### Events
```
when flag clicked
when I receive "message"
when key space pressed
when this sprite clicked
when I start as a clone
```

### Motion
```
move 10 steps
turn right 15 degrees
turn left 15 degrees
go to x: 0 y: 0
glide 1 secs to x: 100 y: 100
point in direction 90
point towards mouse-pointer
set x to 0
set y to 0
change x by 10
change y by 10
if on edge, bounce
```

### Looks
```
say "Hello!"
say "Hello!" for 2 seconds
think "Hmm..."
think "Hmm..." for 2 seconds
show
hide
switch costume to "costume1"
next costume
set size to 100%
change size by 10
set color effect to 25
change color effect by 5
clear graphic effects
go to front layer
go to back layer
```

### Sound
```
play sound "meow"
play sound "meow" until done
stop all sounds
set volume to 100%
change volume by -10
```

### Control
```
wait 1 seconds
repeat 10
    // blocks
forever
    // blocks
if <condition>
    // blocks
if <condition>
    // blocks
else
    // blocks
wait until <condition>
repeat until <condition>
    // blocks
stop all
stop this script
create clone of myself
delete this clone
```

### Sensing
```
touching mouse-pointer?
touching "Sprite2"?
touching edge?
ask "What's your name?" and wait
key space pressed?
mouse down?
mouse x
mouse y
timer
reset timer
distance to mouse-pointer
```

### Operators
```
(1 + 2)
(5 - 3)
(4 * 2)
(10 / 2)
(10 mod 3)
(pick random 1 to 10)
(1 < 2)
(1 > 2)
(1 = 1)
<condition1> and <condition2>
<condition1> or <condition2>
not <condition>
(join "hello" "world")
(letter 1 of "hello")
(length of "hello")
(round 3.5)
(abs -5)
(floor 3.7)
(ceiling 3.2)
(sqrt 16)
(sin 90)
(cos 0)
```

### Variables
```
var score = 0
set score to 10
change score by 1
```

### Lists
```
list myList [1, 2, 3]
add "thing" to myList
delete 1 of myList
insert "thing" at 1 of myList
replace item 1 of myList with "new"
item 1 of myList
length of myList
myList contains "thing"?
```

### Broadcasting
```
broadcast "message"
broadcast "message" and wait
when I receive "message"
```

### Custom Blocks
```
define myBlock param1 param2
    // blocks

myBlock "arg1" "arg2"
```

### Pen (Extension)
```
pen down
pen up
erase all
stamp
set pen color to #FF0000
set pen size to 3
change pen size by 1
```

## Runtime Features

The generated JavaScript includes a `scratchRuntime` object that provides:

- **Sprite Management**: Multiple sprites with position, direction, size, effects
- **Stage**: 480x360 coordinate system with visual rendering
- **Motion**: Movement, rotation, gliding with edge bouncing
- **Looks**: Speech bubbles, costumes, visual effects
- **Sound**: Placeholder audio system
- **Events**: Green flag, key press, sprite click, broadcast/receive
- **Cloning**: Dynamic sprite cloning with clone-specific scripts
- **Sensing**: Mouse tracking, keyboard input, collision detection
- **Variables/Lists**: Global variable and list storage

## Usage

### API Endpoint
```typescript
POST /api/compile
Content-Type: application/json

// Single code (legacy)
{ "code": "sprite Sprite1\n    when flag clicked\n        say \"hello\"" }

// Multi-sprite
{ 
  "sprites": [
    { "name": "Sprite1", "code": "when flag clicked\n    say \"hello\"" },
    { "name": "Sprite2", "code": "when I receive \"msg\"\n    move 10 steps" }
  ]
}
```

### Programmatic
```typescript
import { compile, compileMultiSprite } from "@/lib/compiler";

// Single code
const result = await compile(code);

// Multi-sprite
const result = await compileMultiSprite([
  { name: "Sprite1", code: "..." },
  { name: "Sprite2", code: "..." }
]);
```

## Example

```
sprite Cat
    when flag clicked
        say "Hello!" for 2 seconds
        broadcast "start"
    
    when I receive "done"
        say "Goodbye!"

sprite Dog
    when I receive "start"
        repeat 4
            move 50 steps
            wait 0.5 seconds
        broadcast "done"
```

This creates two sprites that communicate via broadcasting. When the green flag is clicked, Cat says "Hello!" and broadcasts "start". Dog receives the message, moves 4 times, then broadcasts "done". Cat receives "done" and says "Goodbye!".
