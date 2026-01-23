// Test: Custom Blocks (Procedures)
// Tests: define, call with arguments

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "Simple Custom Block",
        code: `
define greet
    say "Hello!"

when flagClicked
    greet
`,
    },
    {
        name: "Custom Block with One Parameter",
        code: `
define sayMessage (message)
    say (message)

when flagClicked
    sayMessage "Hello World!"
    sayMessage "Goodbye!"
`,
    },
    {
        name: "Custom Block with Multiple Parameters",
        code: `
define moveAndTurn (steps) (degrees)
    move (steps)
    turn (degrees)

when flagClicked
    repeat 4
        moveAndTurn 100 90
`,
    },
    {
        name: "Custom Block for Drawing",
        code: `
define drawSquare (size)
    repeat 4
        move (size)
        turn 90

when flagClicked
    drawSquare 50
    drawSquare 100
`,
    },
    {
        name: "Nested Custom Block Calls",
        code: `
define jump
    change y by 50
    wait 0.2
    change y by -50

define doubleJump
    jump
    jump

when flagClicked
    doubleJump
`,
    },
];

console.log("=== CUSTOM BLOCKS TEST ===\n");

const compiler = new ScratchTextCompiler();

for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    const result = compiler.compile(test.code);
    
    if (result.error) {
        console.log("❌ ERROR:", result.error);
    } else {
        console.log("✅ Compiled successfully");
        const lines = result.js.split('\n').filter(l => 
            l.includes('function ') || 
            l.includes('async function') || 
            l.includes('procedures[')
        );
        if (lines.length > 0) {
            console.log("   Generated:", lines.slice(0, 3).map(l => l.trim()).join('\n   '));
        }
    }
    console.log();
}

console.log("=== CUSTOM BLOCKS TESTS COMPLETE ===");
