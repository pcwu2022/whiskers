/**
 * Test Cases: Control Blocks
 * Tests: wait, repeat, forever, if, if-else, wait until, repeat until, stop, clones
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "wait",
        code: `when flagClicked
    wait 1
    say "Done"
`,
        expectContains: ["wait(1)"]
    },
    {
        name: "repeat",
        code: `when flagClicked
    repeat 5
        move 10
`,
        expectContains: ["for", "_i < 5"]
    },
    {
        name: "forever loop",
        code: `when flagClicked
    forever
        move 1
`,
        expectContains: ["while", "running"]
    },
    {
        name: "if condition",
        code: `when flagClicked
    if <touching "edge"> then
        turn 180
`,
        expectContains: ["if"]
    },
    {
        name: "if-else",
        code: `when flagClicked
    if <(x) > (100)> then
        say "Right side"
    else
        say "Left side"
`,
        expectContains: ["if", "else"]
    },
    {
        name: "wait until",
        code: `when flagClicked
    wait until <key "space" pressed>
    say "Space was pressed!"
`,
        expectContains: ["while", "!("]
    },
    {
        name: "repeat until",
        code: `when flagClicked
    repeat until <touching "edge">
        move 5
`,
        expectContains: ["while", "!("]
    },
    {
        name: "stop all",
        code: `when flagClicked
    stop all
`,
        expectContains: ["stopAll"]
    },
    {
        name: "create clone",
        code: `when flagClicked
    create clone of myself
`,
        expectContains: ["createClone"]
    },
    {
        name: "when clone starts",
        code: `when I start as a clone
    say "I'm a clone!"
`,
        expectContains: ["whenCloneStarts"]
    },
    {
        name: "delete clone",
        code: `when I start as a clone
    wait 1
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
    
    if (allFound && !result.error) {
        console.log(`✅ PASS: ${test.name}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Expected to contain: ${test.expectContains.join(", ")}`);
        console.log(`   Output: ${result.js.substring(0, 300)}...`);
        if (result.error) console.log(`   Error: ${result.error}`);
        failed++;
    }
}

console.log(`\n=== Results: ${passed}/${passed + failed} passed ===`);
process.exit(failed > 0 ? 1 : 0);
