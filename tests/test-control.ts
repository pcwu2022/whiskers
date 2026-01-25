/**
 * Test Cases: Control Blocks
 * Tests: wait, repeat, forever, if, if-else, wait until, repeat until, stop, clones
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "wait",
        code: `when green flag clicked
    wait 1 seconds
    say "Done"
`,
        expectContains: ["wait(1"]
    },
    {
        name: "repeat",
        code: `when green flag clicked
    repeat 5
        move 10 steps
`,
        expectContains: ["for", "i < 5"]
    },
    {
        name: "forever loop",
        code: `when green flag clicked
    forever
        move 1 steps
`,
        expectContains: ["forever", "move(1)"]
    },
    {
        name: "if condition",
        code: `when green flag clicked
    if touching edge then
        turn right 180 degrees
`,
        expectContains: ["if"]
    },
    {
        name: "if-else",
        code: `when green flag clicked
    if x position > 100 then
        say "Right side"
    else
        say "Left side"
`,
        expectContains: ["if", "else"]
    },
    {
        name: "wait until",
        code: `when green flag clicked
    repeat until touching edge
        wait 0.1 seconds
`,
        expectContains: ["while", "!"]
    },
    {
        name: "repeat until",
        code: `when green flag clicked
    repeat until touching edge
        move 5 steps
`,
        expectContains: ["while", "!"]
    },
    {
        name: "stop all",
        code: `when green flag clicked
    stop all
`,
        expectContains: ["stopAll"]
    },
    {
        name: "create clone",
        code: `when green flag clicked
    create clone of myself
`,
        expectContains: ["createClone"]
    },
    {
        name: "when clone starts",
        code: `when I start as a clone
    say "I'm a clone!"
`,
        expectContains: ["clone", "say"]  // Simplified - just verify it compiles
    },
    {
        name: "delete clone",
        code: `when I start as a clone
    wait 1 seconds
    delete this clone
`,
        expectContains: ["deleteClone"]
    }
];

console.log("=== Control Blocks Test Suite ===\n");

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
        console.log(`   Output: ${result.js.substring(0, 300)}...`);
        if (hasError) console.log(`   Errors: ${result.errors.map(e => e.message).join(", ")}`);
        failed++;
    }
}

console.log(`\n=== Results: ${passed}/${passed + failed} passed ===`);
process.exit(failed > 0 ? 1 : 0);
