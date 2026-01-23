/**
 * Test Cases: Variable and List Blocks
 * Tests: set, change, show/hide variables, list operations
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "set variable",
        code: `when flagClicked
    set [score] to 0
`,
        expectContains: ["variables", "score", "= 0"]
    },
    {
        name: "change variable",
        code: `when flagClicked
    change [score] by 1
`,
        expectContains: ["score", "+= 1"]
    },
    {
        name: "show variable",
        code: `when flagClicked
    show variable [score]
`,
        expectContains: ["showVariable", "score"]
    },
    {
        name: "hide variable",
        code: `when flagClicked
    hide variable [score]
`,
        expectContains: ["hideVariable", "score"]
    },
    {
        name: "add to list",
        code: `when flagClicked
    add "item" to [myList]
`,
        expectContains: ["addToList", "myList"]
    },
    {
        name: "delete from list",
        code: `when flagClicked
    delete 1 of [myList]
`,
        expectContains: ["deleteOfList", "myList"]
    },
    {
        name: "delete all of list",
        code: `when flagClicked
    delete all of [myList]
`,
        expectContains: ["deleteAllOfList", "myList"]
    },
    {
        name: "insert at list",
        code: `when flagClicked
    insert "new" at 1 of [myList]
`,
        expectContains: ["insertAtList", "myList"]
    },
    {
        name: "replace item of list",
        code: `when flagClicked
    replace item 1 of [myList] with "updated"
`,
        expectContains: ["replaceItemOfList", "myList"]
    },
    {
        name: "show list",
        code: `when flagClicked
    show list [myList]
`,
        expectContains: ["showList", "myList"]
    },
    {
        name: "hide list",
        code: `when flagClicked
    hide list [myList]
`,
        expectContains: ["hideList", "myList"]
    }
];

console.log("=== Variables & Lists Test Suite ===\n");

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
