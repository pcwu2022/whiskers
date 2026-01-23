// Test: Motion Blocks
// Tests: move, turn, goTo, glide, setX/Y, changeX/Y, pointInDirection, ifOnEdgeBounce

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "Basic Movement",
        code: `
when flagClicked
    move 10
    turn 15
    turn left 15
`,
    },
    {
        name: "Go To Position",
        code: `
when flagClicked
    go to x: 100 y: 50
    go to "mouse-pointer"
    go to "random"
`,
    },
    {
        name: "Glide",
        code: `
when flagClicked
    glide 1 secs to x: 0 y: 0
    glide 2 secs to "mouse-pointer"
`,
    },
    {
        name: "Set and Change Position",
        code: `
when flagClicked
    set x to 100
    set y to 50
    change x by 10
    change y by -10
`,
    },
    {
        name: "Point Direction",
        code: `
when flagClicked
    point in direction 90
    point towards "mouse-pointer"
`,
    },
    {
        name: "Edge Bounce and Rotation",
        code: `
when flagClicked
    forever
        move 5
        if on edge, bounce
    set rotation style "left-right"
`,
    },
];

console.log("=== MOTION BLOCKS TEST ===\n");

const compiler = new ScratchTextCompiler();

for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    const result = compiler.compile(test.code);
    
    if (result.error) {
        console.log("❌ ERROR:", result.error);
    } else {
        console.log("✅ Compiled successfully");
        const lines = result.js.split('\n').filter(l => 
            l.includes('.move') || 
            l.includes('.turn') || 
            l.includes('.goTo') ||
            l.includes('.setX') ||
            l.includes('.setY') ||
            l.includes('.glide') ||
            l.includes('ifOnEdgeBounce')
        );
        if (lines.length > 0) {
            console.log("   Generated:", lines.slice(0, 3).map(l => l.trim()).join('\n   '));
        }
    }
    console.log();
}

console.log("=== MOTION TESTS COMPLETE ===");
