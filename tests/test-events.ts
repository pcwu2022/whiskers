/**
 * Test Cases: Event Blocks
 * Tests: when green flag clicked, when key pressed, broadcast, when I receive
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "when green flag clicked",
        code: `when green flag clicked
    say "Started!"
`,
        expectContains: ["onGreenFlag", "say"]
    },
    {
        name: "when key pressed",
        code: `when space key pressed
    move 10 steps
`,
        expectContains: ["onEvent", "keyPressed_space", "move"]
    },
    {
        name: "when this sprite clicked",
        code: `when this sprite clicked
    say "Clicked!"
`,
        expectContains: ["onSpriteClicked", "say"]
    },
    {
        name: "broadcast and receive",
        code: `when green flag clicked
    broadcast "start"

when I receive "start"
    say "Received!"
`,
        expectContains: ["broadcast", "onBroadcast", "start"]
    },
    {
        name: "broadcast and wait",
        code: `when green flag clicked
    broadcast "message" and wait
    say "Done waiting"
`,
        expectContains: ["broadcastAndWait"]
    }
];

console.log("=== Event Blocks Test Suite ===\n");

const compiler = new ScratchTextCompiler();
let passed = 0;
let failed = 0;

for (const test of testCases) {
    const result = compiler.compile(test.code);
    const allFound = test.expectContains.every(str => result.js.includes(str));
    const hasError = result.errors && result.errors.some(e => e.severity === "error");
    
    if (allFound && !hasError) {
        console.log(`✅ PASS: ${test.name}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Expected to contain: ${test.expectContains.join(", ")}`);
        console.log(`   Output: ${result.js.substring(0, 200)}...`);
        if (hasError) console.log(`   Errors: ${result.errors.map(e => e.message).join(", ")}`);
        failed++;
    }
}

console.log(`\n=== Results: ${passed}/${passed + failed} passed ===`);
process.exit(failed > 0 ? 1 : 0);
