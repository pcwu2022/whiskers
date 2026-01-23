/**
 * Test Cases: Event Blocks
 * Tests: when flagClicked, when key pressed, broadcast, when I receive
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "when flagClicked",
        code: `when flagClicked
    say "Started!"
`,
        expectContains: ["whenFlagClicked", "say"]
    },
    {
        name: "when key pressed",
        code: `when [space] key pressed
    move 10
`,
        expectContains: ["whenKeyPressed", "space"]
    },
    {
        name: "when this sprite clicked",
        code: `when this sprite clicked
    say "Clicked!"
`,
        expectContains: ["whenSpriteClicked"]
    },
    {
        name: "broadcast and receive",
        code: `when flagClicked
    broadcast "start"

when I receive "start"
    say "Received!"
`,
        expectContains: ["broadcast", "whenReceived", "start"]
    },
    {
        name: "broadcast and wait",
        code: `when flagClicked
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
    
    if (allFound && !result.error) {
        console.log(`✅ PASS: ${test.name}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Expected to contain: ${test.expectContains.join(", ")}`);
        console.log(`   Output: ${result.js.substring(0, 200)}...`);
        if (result.error) console.log(`   Error: ${result.error}`);
        failed++;
    }
}

console.log(`\n=== Results: ${passed}/${passed + failed} passed ===`);
process.exit(failed > 0 ? 1 : 0);
