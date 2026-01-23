# Scratch Text Compiler

A web-based compiler that transforms text-based Scratch-like syntax into executable JavaScript. Built with Next.js and Monaco Editor.

## 🎯 Overview

This project provides a text-based alternative to Scratch's visual block programming. Write Scratch programs using a clean, readable syntax and compile them to JavaScript that runs in the browser.

### Features

- **Multi-Sprite Support**: Create projects with multiple sprites and a backdrop/stage
- **Full Scratch 3.0 Syntax**: Events, Control, Motion, Looks, Sound, Sensing, Operators, Variables, Lists, Custom Blocks
- **Monaco Editor**: Syntax highlighting, autocompletion, and error detection
- **Project Management**: Save, load, import/export projects as ZIP files
- **Live Preview**: Run compiled code directly in the browser
- **Clone Support**: Create and manage sprite clones at runtime
- **Backdrop/Stage**: Dedicated stage sprite for backdrop scripts

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/compile/route.ts    # API endpoint for compilation
│   ├── components/
│   │   ├── CodeEditor.tsx      # Main editor component with Monaco
│   │   ├── FileTabs.tsx        # Sprite tab management (backdrop + sprites)
│   │   └── ProjectToolbar.tsx  # Import/export functionality
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── lexer.ts                # Tokenizes input code (~170 keywords)
│   ├── parser.ts               # Builds AST from tokens
│   ├── codeGenerator.ts        # Generates JavaScript from AST
│   │                           #   - CodeGenerator (single sprite)
│   │                           #   - MultiSpriteCodeGenerator (full projects)
│   ├── compiler.ts             # Orchestrates compilation pipeline
│   ├── codeEditorConfig.ts     # Monaco syntax highlighting & autocomplete
│   └── debugger.ts             # Debug logging utilities
├── templates/
│   └── runtime.ts              # Scratch runtime (~700 lines)
│                               #   - Sprite management & cloning
│                               #   - Event system (broadcast, key press, etc.)
│                               #   - Motion, Looks, Sound, Sensing methods
│                               #   - Variable & List operations
│                               #   - Timer, Mouse, Keyboard tracking
├── types/
│   ├── compilerTypes.ts        # Block type mappings (~150 block types)
│   └── projectTypes.ts         # Project/sprite/costume interfaces
└── debug/
    └── compilerOutput.json     # Debug output from compiler
```

### Compilation Pipeline

```
Source Code → Lexer → Tokens → Parser → AST → CodeGenerator → JavaScript + HTML
```

1. **Lexer** (`lexer.ts`): Tokenizes input into keywords, identifiers, numbers, strings, operators
2. **Parser** (`parser.ts`): Builds an Abstract Syntax Tree (AST) representing program structure
3. **CodeGenerator** (`codeGenerator.ts`): 
   - Traverses AST and generates JavaScript
   - `MultiSpriteCodeGenerator` handles multiple sprites with backdrop
   - Generates sprite initializations, event handlers, and block code
4. **Runtime** (`runtime.ts`): 
   - Provides `scratchRuntime` object injected into generated code
   - Manages sprites, clones, events, variables, lists
   - Implements all Scratch-like methods (move, say, broadcast, etc.)

### Block Type Categories

| Category | Examples |
|----------|----------|
| **Events** | `whenFlagClicked`, `whenKeyPressed`, `whenClicked`, `whenReceived`, `broadcast` |
| **Control** | `wait`, `repeat`, `forever`, `if`, `ifElse`, `waitUntil`, `repeatUntil`, `stop`, `createClone`, `deleteClone` |
| **Motion** | `move`, `turn`, `goTo`, `glide`, `pointInDirection`, `pointTowards`, `ifOnEdgeBounce`, `setRotationStyle` |
| **Looks** | `say`, `think`, `show`, `hide`, `switchCostume`, `switchBackdrop`, `changeEffect`, `setSize`, `goToLayer` |
| **Sound** | `playSound`, `playSoundUntilDone`, `stopAllSounds`, `setVolume`, `changeVolume` |
| **Sensing** | `touching`, `touchingColor`, `distanceTo`, `ask`, `keyPressed`, `mouseDown`, `mouseX/Y`, `timer` |
| **Operators** | `+`, `-`, `*`, `/`, `mod`, `round`, `abs`, `random`, `join`, `letterOf`, `length`, `contains` |
| **Variables** | `set`, `change`, `showVariable`, `hideVariable` |
| **Lists** | `addToList`, `deleteOfList`, `insertAtList`, `replaceItemOfList`, `itemOfList`, `lengthOfList`, `listContains` |
| **Custom Blocks** | `define`, `call` (procedures with arguments) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd scratch_compiler

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the compiler.

### Build for Production

```bash
npm run build
npm start
```

## 🔧 Debugging in Terminal

### Method 1: Using Test Scripts

Run the comprehensive test suite:

```bash
# Run a specific test
npx ts-node -r tsconfig-paths/register --project tsconfig.test.json tests/testEvents.ts

# Run all tests
for f in tests/test*.ts; do echo "=== $f ==="; npx ts-node -r tsconfig-paths/register --project tsconfig.test.json "$f"; done
```

### Method 2: Quick Inline Test

Create a quick test file:

```typescript
// test.ts
import { ScratchTextCompiler } from './src/lib/compiler';

const code = `
when flagClicked
    say "Hello World!"
    repeat 3
        move 10
        turn 15
`;

const compiler = new ScratchTextCompiler();
const result = compiler.compile(code);

console.log('=== Generated JavaScript ===');
console.log(result.js);

if (result.error) {
    console.error('\\n=== Errors ===');
    console.error(result.error);
}
```

Run with:
```bash
npx ts-node --project tsconfig.json test.ts
```

### Method 3: Multi-Sprite Compilation Test

```typescript
import { ScratchTextCompiler } from './src/lib/compiler';

const sprites = [
    {
        name: "Stage",
        code: `when flagClicked\\n    switch backdrop to "night"`,
        isStage: true
    },
    {
        name: "Cat",
        code: `when flagClicked\\n    say "Meow!"\\n    move 50`
    },
    {
        name: "Dog", 
        code: `when I receive "bark"\\n    say "Woof!"`
    }
];

const compiler = new ScratchTextCompiler();
const result = compiler.compileMultiSprite(sprites);
console.log(result.js);
```

### Method 4: Debug Output File

The compiler automatically writes debug output to `src/debug/compilerOutput.json`:

```bash
# Watch debug output in real-time
tail -f src/debug/compilerOutput.json | jq .

# Or view after compilation
cat src/debug/compilerOutput.json | jq .
```

The debug file contains:
- Lexer tokens
- Parser AST structure
- Generated JavaScript code

### Method 5: Test API with curl

```bash
# Start the dev server
npm run dev

# In another terminal, test the compile endpoint
curl -X POST http://localhost:3000/api/compile \\
  -H "Content-Type: application/json" \\
  -d '{
    "sprites": [
      {"name": "Stage", "code": "when flagClicked", "isStage": true},
      {"name": "Sprite1", "code": "when flagClicked\\n    say \\"Hello\\""}
    ]
  }' | jq .
```

### Method 6: Step-by-Step Pipeline Debug

```typescript
import { Lexer } from './src/lib/lexer';
import { Parser } from './src/lib/parser';
import { CodeGenerator } from './src/lib/codeGenerator';

const code = `when flagClicked\\n    move 10`;

// Step 1: Tokenize
const lexer = new Lexer(code);
const tokens = lexer.tokenize();
console.log('=== TOKENS ===');
console.log(JSON.stringify(tokens, null, 2));

// Step 2: Parse
const parser = new Parser(tokens);
const ast = parser.parse();
console.log('\\n=== AST ===');
console.log(JSON.stringify(ast, null, 2));

// Step 3: Generate
const generator = new CodeGenerator(ast);
const output = generator.generate();
console.log('\\n=== OUTPUT ===');
console.log(output.js);
```

### Common Debug Commands

```bash
# Check for TypeScript errors
npm run build

# Lint the code
npm run lint

# Run specific test file
npx ts-node -r tsconfig-paths/register --project tsconfig.test.json tests/testEvents.ts

# Check compiler output structure
cat src/debug/compilerOutput.json | jq 'keys'
```

## 🧪 Test Cases

Test files are located in `tests/`. Each test covers a major feature category:

| Test File | Coverage |
|-----------|----------|
| `tests/testEvents.ts` | Event blocks (flag clicked, key pressed, broadcast) |
| `tests/testMotion.ts` | Motion blocks (move, turn, glide, position) |
| `tests/testLooks.ts` | Looks blocks (say, costumes, effects, layers) |
| `tests/testControl.ts` | Control blocks (loops, conditionals, clones) |
| `tests/testVariables.ts` | Variables and lists |
| `tests/testOperators.ts` | Math, string, and logic operators |
| `tests/testSensing.ts` | Sensing blocks (touch, mouse, keyboard) |
| `tests/testCustomBlocks.ts` | Custom block definitions and calls |
| `tests/testMultiSprite.ts` | Multi-sprite projects with backdrop |

Run all tests:
```bash
for f in tests/test*.ts; do echo "=== $f ==="; npx ts-node -r tsconfig-paths/register --project tsconfig.test.json "$f"; done
```

## 📝 Syntax Reference

See [SCRATCH_SYNTAX.md](./SCRATCH_SYNTAX.md) for complete syntax documentation.

### Quick Examples

```scratch
// Events
when flagClicked
when [space] key pressed
when this sprite clicked
when I receive "message"
broadcast "message"

// Motion
move 10
turn 15
go to x: 100 y: 50
glide 1 secs to x: 0 y: 0
point towards "mouse-pointer"
if on edge, bounce

// Looks
say "Hello!"
say "Hello" for 2 secs
think "Hmm..."
hide
show
switch costume to "costume2"
next costume
change [color] effect by 25
set size to 150 %

// Control
wait 1
repeat 10
    move 5
forever
    if <touching "edge"> then
        turn 180
    else
        move 1
wait until <key "space" pressed>
create clone of "myself"
when I start as a clone
    show
delete this clone

// Variables
set [score] to 0
change [score] by 1
show variable [score]

// Lists
add "item" to [myList]
delete 1 of [myList]
insert "item" at 1 of [myList]
replace item 1 of [myList] with "new"
item 1 of [myList]
length of [myList]

// Operators
(pick random 1 to 10)
((2) + (3))
<(score) > (10)>
(join "Hello " "World")
(letter 1 of "Hello")
<"Hello" contains "ell">

// Custom Blocks
define myBlock (param1) (param2)
    say (param1)
    move (param2)

myBlock "Hello" 50
```

### Complete Working Example

This example demonstrates motion, speech, loops, and keyboard controls. It's the default code shown when you first open the compiler:

```scratch
// Welcome to Scratch Compiler! 🐱
// Click the green "Run" button to see this code in action

when flagClicked
    say "Hello! Watch me dance!"
    wait 1
    repeat 4
        move 50
        turn right 90
        wait 0.3

// Keyboard controls - try pressing these keys!
when keyPressed space
    say "You pressed space!"

when keyPressed up
    move 20

when keyPressed down
    move -20

when keyPressed left
    turn left 15

when keyPressed right
    turn right 15
```

**What this example demonstrates:**
- `when flagClicked` - Main program entry point
- `say` - Display speech bubbles
- `wait` - Pause execution
- `repeat` - Loop a block of code
- `move` / `turn` - Sprite motion
- `when keyPressed` - Keyboard event handlers
- Comments with `//`

## 📦 Project Structure

Projects are saved as `.scratch.zip` files containing:
```
project.scratch.zip
├── project.json          # Project metadata (name, version, active sprite)
└── sprites/
    ├── Stage.scratch     # Backdrop/stage code
    ├── Stage.meta.json   # Stage metadata
    ├── Sprite1.scratch   # Sprite code files
    └── Sprite1.meta.json # Sprite metadata (id, timestamps)
```

### SpriteFile Interface

```typescript
interface SpriteFile {
    id: string;
    name: string;
    code: string;
    type: "sprite" | "backdrop";
    isStage: boolean;
    costumes: Costume[];      // Placeholder for future image support
    currentCostume: number;
    sounds: string[];         // Placeholder for future audio support
    x: number;
    y: number;
    direction: number;
    size: number;
    visible: boolean;
    draggable: boolean;
    rotationStyle: "all around" | "left-right" | "don't rotate";
    createdAt: number;
    updatedAt: number;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to ensure no errors
5. Run tests to verify functionality
6. Submit a pull request

## 📄 License

MIT License
