/**
 * Test Cases: Motion Blocks
 * Tests: move, turn, go to, glide, set x/y, change x/y, point, bounce, rotation style
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "move steps",
        code: `when green flag clicked
    move 10 steps
`,
        expectContains: ["move(10)"]
    },
    {
        name: "turn right",
        code: `when green flag clicked
    turn right 15 degrees
`,
        expectContains: ["turnRight(15)"]
    },
    {
        name: "turn left",
        code: `when green flag clicked
    turn left 15 degrees
`,
        expectContains: ["turnLeft(15)"]
    },
    {
        name: "go to x y",
        code: `when green flag clicked
    go to x: 100 y: 50
`,
        expectContains: ["goTo(100", "50)"]
    },
    {
        name: "go to random position",
        code: `when green flag clicked
    go to random position
`,
        expectContains: ["goTo(Math.floor"]
    },
    {
        name: "go to mouse-pointer",
        code: `when green flag clicked
    go to mouse-pointer
`,
        expectContains: ["goTo(scratchRuntime.mouseX"]
    },
    {
        name: "glide to x y",
        code: `when green flag clicked
    glide 1 secs to x: 0 y: 0
`,
        expectContains: ["Glide", "await"]
    },
    {
        name: "set x",
        code: `when green flag clicked
    set x to 100
`,
        expectContains: ["setX(100)"]
    },
    {
        name: "set y",
        code: `when green flag clicked
    set y to -50
`,
        expectContains: ["setY(-50)"]
    },
    {
        name: "change x",
        code: `when green flag clicked
    change x by 10
`,
        expectContains: ["changeX(10)"]
    },
    {
        name: "change y",
        code: `when green flag clicked
    change y by -10
`,
        expectContains: ["changeY(-10)"]
    },
    {
        name: "point in direction",
        code: `when green flag clicked
    point in direction 90
`,
        expectContains: ["pointInDirection(90)"]
    },
    {
        name: "point towards mouse-pointer",
        code: `when green flag clicked
    point towards mouse-pointer
`,
        expectContains: ["pointTowards"]
    },
    {
        name: "if on edge bounce",
        code: `when green flag clicked
    if on edge, bounce
`,
        expectContains: ["ifOnEdgeBounce"]
    },
    {
        name: "set rotation style",
        code: `when green flag clicked
    set rotation style left-right
`,
        expectContains: ["setRotationStyle"]
    }
];

console.log("=== Motion Blocks Test Suite ===\n");

const compiler = new ScratchTextCompiler();
let passed = 0;
let failed = 0;

for (const test of testCases) {
    const result = compiler.compile(test.code);
    const allFound = test.expectContains.every(str => result.js.includes(str));
    
    if (allFound && result.success) {
        console.log(`✅ PASS: ${test.name}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Expected to contain: ${test.expectContains.join(", ")}`);
        console.log(`   Output: ${result.js.substring(0, 300)}...`);
        if (result.errors.length > 0) console.log(`   Errors: ${result.errors.map(e => e.message).join(", ")}`);
        failed++;
    }
}

console.log(`\n=== Results: ${passed}/${passed + failed} passed ===`);
process.exit(failed > 0 ? 1 : 0);
