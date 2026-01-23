// Test: Operator Blocks
// Tests: math operators, comparison, logic, string operations, random

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "Math Operators",
        code: `
when flagClicked
    set [result] to ((5) + (3))
    set [result] to ((10) - (4))
    set [result] to ((6) * (7))
    set [result] to ((20) / (4))
`,
    },
    {
        name: "Advanced Math",
        code: `
when flagClicked
    set [result] to ((10) mod (3))
    set [result] to (round (3.7))
    set [result] to (abs (-5))
`,
    },
    {
        name: "Math Functions",
        code: `
when flagClicked
    set [result] to (sqrt of (16))
    set [result] to (sin of (90))
    set [result] to (cos of (0))
`,
    },
    {
        name: "Random",
        code: `
when flagClicked
    set [result] to (pick random 1 to 10)
    go to x: (pick random -240 to 240) y: (pick random -180 to 180)
`,
    },
    {
        name: "Comparison Operators",
        code: `
when flagClicked
    if <(score) > (10)> then
        say "High score!"
    if <(score) < (0)> then
        say "Negative!"
    if <(score) = (100)> then
        say "Perfect!"
`,
    },
    {
        name: "Logic Operators",
        code: `
when flagClicked
    if <<(score) > (0)> and <(lives) > (0)>> then
        say "Game on!"
    if <<key "space" pressed> or <mouse down>> then
        say "Input detected"
    if <not <touching "enemy">> then
        say "Safe!"
`,
    },
    {
        name: "String Operations",
        code: `
when flagClicked
    say (join "Hello " "World")
    say (letter 1 of "Hello")
    say (length of "Hello")
`,
    },
    {
        name: "String Contains",
        code: `
when flagClicked
    if <"Hello World" contains "World"> then
        say "Found it!"
`,
    },
];

console.log("=== OPERATOR BLOCKS TEST ===\n");

const compiler = new ScratchTextCompiler();

for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    const result = compiler.compile(test.code);
    
    if (result.error) {
        console.log("❌ ERROR:", result.error);
    } else {
        console.log("✅ Compiled successfully");
        const lines = result.js.split('\n').filter(l => 
            l.includes(' + ') || 
            l.includes(' - ') || 
            l.includes(' * ') ||
            l.includes(' / ') ||
            l.includes(' % ') ||
            l.includes('Math.') ||
            l.includes('random') ||
            l.includes(' > ') ||
            l.includes(' < ') ||
            l.includes(' && ') ||
            l.includes(' || ') ||
            l.includes('.join') ||
            l.includes('.charAt') ||
            l.includes('.length') ||
            l.includes('.includes')
        );
        if (lines.length > 0) {
            console.log("   Generated:", lines.slice(0, 3).map(l => l.trim()).join('\n   '));
        }
    }
    console.log();
}

console.log("=== OPERATOR TESTS COMPLETE ===");
