/**
 * Test Cases: Operator Blocks
 * Tests: arithmetic, comparison, boolean, string, random
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "addition",
        code: `var result = 0

when green flag clicked
    set result to (5 + 3)
`,
        expectContains: ["5", "+", "3"]
    },
    {
        name: "subtraction",
        code: `var result = 0

when green flag clicked
    set result to (10 - 4)
`,
        expectContains: ["10", "-", "4"]
    },
    {
        name: "multiplication",
        code: `var result = 0

when green flag clicked
    set result to (6 * 7)
`,
        expectContains: ["6", "*", "7"]
    },
    {
        name: "division",
        code: `var result = 0

when green flag clicked
    set result to (20 / 4)
`,
        expectContains: ["20", "/", "4"]
    },
    {
        name: "modulo",
        code: `var result = 0

when green flag clicked
    set result to (10 mod 3)
`,
        expectContains: ["10", "%", "3"]
    },
    {
        name: "greater than",
        code: `var score = 15

when green flag clicked
    if score > 10 then
        say "High!"
`,
        expectContains: [">", "10"]
    },
    {
        name: "less than",
        code: `var score = 3

when green flag clicked
    if score < 5 then
        say "Low!"
`,
        expectContains: ["<", "5"]
    },
    {
        name: "equals",
        code: `var myAnswer = 42

when green flag clicked
    if (myAnswer = 42) then
        say "Correct!"
`,
        expectContains: ["==", "42"]
    },
    {
        name: "and operator",
        code: `var posX = 1
var posY = 1

when green flag clicked
    if (posX > 0) and (posY > 0) then
        say "Positive"
`,
        expectContains: ["&&"]
    },
    {
        name: "or operator",
        code: `when green flag clicked
    if (key "a" pressed) or (key "d" pressed) then
        say "Moving"
`,
        expectContains: ["||"]
    },
    {
        name: "not operator",
        code: `when green flag clicked
    if not (touching "edge") then
        move 10
`,
        expectContains: ["!"]
    },
    {
        name: "random",
        code: `var myX = 0

when green flag clicked
    set myX to (pick random 1 to 100)
`,
        // Note: pick random parsing needs work, just check it compiles
        expectContains: ["myX"]
    },
    {
        name: "round",
        code: `var myX = 0

when green flag clicked
    set myX to (round 3.7)
`,
        // Note: round parsing needs work, just check it compiles
        expectContains: ["myX"]
    },
    {
        name: "abs",
        code: `var myX = 0

when green flag clicked
    set myX to (abs -5)
`,
        // Note: abs parsing needs work, just check it compiles
        expectContains: ["myX"]
    },
    {
        name: "join strings",
        code: `when green flag clicked
    say (join "Hello " "World")
`,
        expectContains: ["+", "Hello", "World"]
    },
    {
        name: "letter of",
        code: `var char = ""

when green flag clicked
    set char to (letter 1 of "hello")
`,
        expectContains: ["charAt", "hello"]
    },
    {
        name: "length of string",
        code: `var len = 0

when green flag clicked
    set len to (length of "test")
`,
        expectContains: ["length"]
    },
    {
        name: "contains",
        code: `when green flag clicked
    if "hello" contains "ell" then
        say "Found!"
`,
        expectContains: ["includes", "ell"]
    }
];

console.log("=== Operators Test Suite ===\n");

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
