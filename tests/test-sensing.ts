/**
 * Test Cases: Sensing Blocks
 * Tests: touching, key pressed, mouse, ask, timer
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "touching sprite",
        code: `when flagClicked
    if <touching "Sprite2"> then
        say "Collision!"
`,
        expectContains: ["isTouching", "Sprite2"]
    },
    {
        name: "touching edge",
        code: `when flagClicked
    if <touching "edge"> then
        turn 180
`,
        expectContains: ["isTouching", "edge"]
    },
    {
        name: "touching mouse-pointer",
        code: `when flagClicked
    if <touching "mouse-pointer"> then
        say "Mouse over me!"
`,
        expectContains: ["isTouching", "mouse-pointer"]
    },
    {
        name: "key pressed",
        code: `when flagClicked
    if <key "space" pressed> then
        say "Jump!"
`,
        expectContains: ["isKeyPressed", "space"]
    },
    {
        name: "mouse down",
        code: `when flagClicked
    if <mouse down?> then
        say "Clicking!"
`,
        expectContains: ["mouse", "down"]
    },
    {
        name: "mouse x",
        code: `when flagClicked
    go to x: (mouse x) y: 0
`,
        expectContains: ["mouse", "x"]
    },
    {
        name: "mouse y",
        code: `when flagClicked
    go to x: 0 y: (mouse y)
`,
        expectContains: ["mouse", "y"]
    },
    {
        name: "ask and wait",
        code: `when flagClicked
    ask "What's your name?" and wait
    say (answer)
`,
        expectContains: ["say", "What's your name"]
    },
    {
        name: "timer",
        code: `when flagClicked
    if <(timer) > (10)> then
        say "10 seconds passed!"
`,
        expectContains: ["getTimer"]
    },
    {
        name: "reset timer",
        code: `when flagClicked
    reset timer
`,
        expectContains: ["resetTimer"]
    },
    {
        name: "distance to",
        code: `when flagClicked
    if <(distance to "Sprite2") < (50)> then
        say "Close!"
`,
        expectContains: ["distanceTo", "Sprite2"]
    },
    {
        name: "current date/time",
        code: `when flagClicked
    set [hour] to (current hour)
`,
        expectContains: ["getHours"]
    }
];

console.log("=== Sensing Blocks Test Suite ===\n");

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
