/**
 * Test Cases: Motion Blocks
 * Tests: move, turn, go to, glide, set x/y, change x/y, point, bounce, rotation style
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "move steps",
        code: `when flagClicked
    move 10
`,
        expectContains: ["move(10)"]
    },
    {
        name: "turn right",
        code: `when flagClicked
    turn right 15
`,
        expectContains: ["turnRight(15)"]
    },
    {
        name: "turn left",
        code: `when flagClicked
    turn left 15
`,
        expectContains: ["turnLeft(15)"]
    },
    {
        name: "go to x y",
        code: `when flagClicked
    go to x: 100 y: 50
`,
        expectContains: ["goTo(100", "50)"]
    },
    {
        name: "go to mouse-pointer",
        code: `when flagClicked
    go to mouse-pointer
`,
        expectContains: ["goToTarget"]
    },
    {
        name: "glide to x y",
        code: `when flagClicked
    glide 1 secs to x: 0 y: 0
`,
        expectContains: ["Glide", "await"]
    },
    {
        name: "set x",
        code: `when flagClicked
    set x to 100
`,
        expectContains: ["setX(100)"]
    },
    {
        name: "set y",
        code: `when flagClicked
    set y to -50
`,
        expectContains: ["setY(-50)"]
    },
    {
        name: "change x",
        code: `when flagClicked
    change x by 10
`,
        expectContains: ["changeX(10)"]
    },
    {
        name: "change y",
        code: `when flagClicked
    change y by -10
`,
        expectContains: ["changeY(-10)"]
    },
    {
        name: "point in direction",
        code: `when flagClicked
    point in direction 90
`,
        expectContains: ["pointInDirection(90)"]
    },
    {
        name: "point towards",
        code: `when flagClicked
    point towards mouse-pointer
`,
        expectContains: ["pointTowards"]
    },
    {
        name: "if on edge bounce",
        code: `when flagClicked
    if on edge, bounce
`,
        expectContains: ["ifOnEdgeBounce"]
    },
    {
        name: "set rotation style",
        code: `when flagClicked
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
