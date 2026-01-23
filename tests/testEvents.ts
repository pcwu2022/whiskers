// Test: Event Blocks
// Tests: whenFlagClicked, whenKeyPressed, whenClicked, whenReceived, broadcast

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "When Flag Clicked",
        code: `
when flagClicked
    say "Game started!"
`,
    },
    {
        name: "When Key Pressed",
        code: `
when space key pressed
    move 10

when up key pressed
    change y by 10
`,
    },
    {
        name: "When Sprite Clicked",
        code: `
when this sprite clicked
    say "You clicked me!"
`,
    },
    {
        name: "Broadcast and Receive",
        code: `
when flagClicked
    broadcast "startGame"

when I receive "startGame"
    say "Game started!"
`,
    },
    {
        name: "Broadcast and Wait",
        code: `
when flagClicked
    broadcast "initialize" and wait
    say "All sprites ready!"
`,
    },
    {
        name: "When Clone Starts",
        code: `
when I start as a clone
    show
    move 50
`,
    },
];

console.log("=== EVENT BLOCKS TEST ===\n");

const compiler = new ScratchTextCompiler();

for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    const result = compiler.compile(test.code);
    
    if (result.error) {
        console.log("❌ ERROR:", result.error);
    } else {
        console.log("✅ Compiled successfully");
        // Show relevant generated code snippet
        const lines = result.js.split('\n').filter(l => 
            l.includes('addEventListener') || 
            l.includes('broadcast') || 
            l.includes('whenReceived') ||
            l.includes('say')
        );
        if (lines.length > 0) {
            console.log("   Generated:", lines.slice(0, 3).join('\n   '));
        }
    }
    console.log();
}

console.log("=== EVENT TESTS COMPLETE ===");
