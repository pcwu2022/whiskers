// Test: Control Blocks
// Tests: wait, repeat, forever, if, ifElse, waitUntil, repeatUntil, stop, clones

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "Wait",
        code: `
when flagClicked
    wait 1
    say "Done waiting"
`,
    },
    {
        name: "Repeat",
        code: `
when flagClicked
    repeat 10
        move 10
        turn 36
`,
    },
    {
        name: "Forever",
        code: `
when flagClicked
    forever
        move 1
        if on edge, bounce
`,
    },
    {
        name: "If Statement",
        code: `
when flagClicked
    if <touching "edge"> then
        turn 180
`,
    },
    {
        name: "If-Else Statement",
        code: `
when flagClicked
    if <(score) > (10)> then
        say "You win!"
    else
        say "Keep playing!"
`,
    },
    {
        name: "Wait Until",
        code: `
when flagClicked
    wait until <key "space" pressed>
    say "Space pressed!"
`,
    },
    {
        name: "Repeat Until",
        code: `
when flagClicked
    repeat until <touching "edge">
        move 5
`,
    },
    {
        name: "Stop",
        code: `
when flagClicked
    if <(lives) = (0)> then
        stop all
`,
    },
    {
        name: "Clone Management",
        code: `
when flagClicked
    create clone of "myself"

when I start as a clone
    show
    repeat 10
        move 5
    delete this clone
`,
    },
];

console.log("=== CONTROL BLOCKS TEST ===\n");

const compiler = new ScratchTextCompiler();

for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    const result = compiler.compile(test.code);
    
    if (result.error) {
        console.log("❌ ERROR:", result.error);
    } else {
        console.log("✅ Compiled successfully");
        const lines = result.js.split('\n').filter(l => 
            l.includes('wait') || 
            l.includes('for (') || 
            l.includes('while') ||
            l.includes('if (') ||
            l.includes('else') ||
            l.includes('clone') ||
            l.includes('stop')
        );
        if (lines.length > 0) {
            console.log("   Generated:", lines.slice(0, 3).map(l => l.trim()).join('\n   '));
        }
    }
    console.log();
}

console.log("=== CONTROL TESTS COMPLETE ===");
