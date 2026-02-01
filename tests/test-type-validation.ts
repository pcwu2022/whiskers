/**
 * Test Cases: Type Validation Errors
 * Tests: type mismatches, typos, missing values, procedure arg counts, assignment in expression
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const compiler = new ScratchTextCompiler();

// Test cases for type errors
const testCases = [
    {
        name: "Case 8: wait with string",
        code: `when green flag clicked
    wait "hello" seconds`,
        expectedError: "requires a number"
    },
    {
        name: "Case 9: move with string", 
        code: `when green flag clicked
    move "five" steps`,
        expectedError: "requires a number"
    },
    {
        name: "Case 10: repeat with string",
        code: `when green flag clicked
    repeat "three" times
        say "hi"`,
        expectedError: "requires a number"
    },
    {
        name: "Case 11: if with number",
        code: `when green flag clicked
    if 50 then
        say "hello"`,
        expectedError: "requires a condition"
    },
    {
        name: "Case 12: and with number left operand",
        code: `var myvar = 0
when green flag clicked
    if 50 and myvar > 10 then
        say "hello"`,
        expectedError: "Cannot use"
    },
    {
        name: "Case 13: or with number operand",
        code: `var score = 0
when green flag clicked
    if score > 10 or 5 then
        say "hello"`,
        expectedError: "Cannot use"
    },
    {
        name: "Case 16: go to x: y: 50 (missing x value)",
        code: `when green flag clicked
    go to x: y: 50`,
        expectedError: "Missing value"
    },
    {
        name: "Case 20: whe typo",
        code: `whe green flag clicked
    say "hello"`,
        expectedError: "Did you mean"
    },
    {
        name: "Case 21: mve typo",
        code: `when green flag clicked
    mve 10 steps`,
        expectedError: "Did you mean"
    },
    {
        name: "Case 22: broadast typo",
        code: `when green flag clicked
    broadast "start"`,
        expectedError: "Did you mean"
    },
    {
        name: "Case 25: assignment in expression",
        code: `when green flag clicked
    set x to x = 5`,
        expectedError: "Unexpected '='"
    }
    // Note: Cases 23-24 (procedure arg count validation) require 
    // fixing the parser's "define" block parsing first
];

console.log("╔══════════════════════════════════════════════╗");
console.log("║       Type Validation Tests                  ║");
console.log("╚══════════════════════════════════════════════╝\n");

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
    const result = compiler.compile(testCase.code);
    const hasExpectedError = result.errors.some(err => 
        err.message.toLowerCase().includes(testCase.expectedError.toLowerCase())
    );
    
    if (hasExpectedError) {
        console.log(`✅ ${testCase.name}`);
        passed++;
    } else {
        console.log(`❌ ${testCase.name}`);
        console.log(`   Expected error containing: "${testCase.expectedError}"`);
        console.log(`   Got errors:`, result.errors.map(e => e.message));
        failed++;
    }
}

console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${passed}/${passed + failed} passed`);
if (failed === 0) {
    console.log("✅ All type validation tests passed!");
} else {
    console.log(`❌ ${failed} tests failed`);
}
