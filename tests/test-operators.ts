/**
 * Test Cases: Operator Blocks
 * Tests: arithmetic, comparison, boolean, string, random
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "addition",
        code: `when flagClicked
    set [result] to ((5) + (3))
`,
        expectContains: ["5", "+", "3"]
    },
    {
        name: "subtraction",
        code: `when flagClicked
    set [result] to ((10) - (4))
`,
        expectContains: ["10", "-", "4"]
    },
    {
        name: "multiplication",
        code: `when flagClicked
    set [result] to ((6) * (7))
`,
        expectContains: ["6", "*", "7"]
    },
    {
        name: "division",
        code: `when flagClicked
    set [result] to ((20) / (4))
`,
        expectContains: ["20", "/", "4"]
    },
    {
        name: "modulo",
        code: `when flagClicked
    set [result] to ((10) mod (3))
`,
        expectContains: ["10", "%", "3"]
    },
    {
        name: "greater than",
        code: `when flagClicked
    if <(score) > (10)> then
        say "High!"
`,
        expectContains: [">", "10"]
    },
    {
        name: "less than",
        code: `when flagClicked
    if <(score) < (5)> then
        say "Low!"
`,
        expectContains: ["<", "5"]
    },
    {
        name: "equals",
        code: `when flagClicked
    if <(answer) = (42)> then
        say "Correct!"
`,
        expectContains: ["===", "42"]
    },
    {
        name: "and operator",
        code: `when flagClicked
    if <<(x) > (0)> and <(y) > (0)>> then
        say "Positive"
`,
        expectContains: ["&&"]
    },
    {
        name: "or operator",
        code: `when flagClicked
    if <<key "a" pressed> or <key "d" pressed>> then
        say "Moving"
`,
        expectContains: ["||"]
    },
    {
        name: "not operator",
        code: `when flagClicked
    if <not <touching "edge">> then
        move 10
`,
        expectContains: ["!"]
    },
    {
        name: "random",
        code: `when flagClicked
    set [x] to (pick random 1 to 100)
`,
        expectContains: ["Math.random", "1", "100"]
    },
    {
        name: "round",
        code: `when flagClicked
    set [x] to (round (3.7))
`,
        expectContains: ["Math.round"]
    },
    {
        name: "abs",
        code: `when flagClicked
    set [x] to (abs (-5))
`,
        expectContains: ["Math.abs"]
    },
    {
        name: "join strings",
        code: `when flagClicked
    say (join "Hello " "World")
`,
        expectContains: ["+", "Hello", "World"]
    },
    {
        name: "letter of",
        code: `when flagClicked
    set [char] to (letter 1 of "hello")
`,
        expectContains: ["charAt", "hello"]
    },
    {
        name: "length of string",
        code: `when flagClicked
    set [len] to (length of "test")
`,
        expectContains: ["length"]
    },
    {
        name: "contains",
        code: `when flagClicked
    if <"hello" contains "ell"> then
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
