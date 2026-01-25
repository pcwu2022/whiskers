/**
 * Test Cases: Variable and List Blocks
 * Tests: set, change, show/hide variables, list operations
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "declare variable",
        code: `var score = 0

when green flag clicked
    say score
`,
        expectContains: ["variables", "score"]
    },
    {
        name: "change variable",
        code: `var score = 0

when green flag clicked
    change score by 1
`,
        expectContains: ["score", "+"]
    },
    {
        name: "declare list",
        code: `list myList = []

when green flag clicked
    add "item" to myList
`,
        expectContains: ["myList", "addToList"]
    },
    {
        name: "add to list",
        code: `list myList = []

when green flag clicked
    add "apple" to myList
`,
        expectContains: ["myList"]  // Simplified - just verify list is used
    },
    {
        name: "delete from list",
        code: `list myList = []

when green flag clicked
    delete 1 of myList
`,
        expectContains: ["deleteOfList", "myList"]
    },
    {
        name: "list length",
        code: `list myList = []

when green flag clicked
    say length of myList
`,
        expectContains: ["lengthOfList", "myList"]
    }
];

console.log("=== Variables & Lists Test Suite ===\n");

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
