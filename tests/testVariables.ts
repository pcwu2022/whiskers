// Test: Variables and Lists
// Tests: set, change, showVariable, hideVariable, list operations

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "Set Variable",
        code: `
when flagClicked
    set [score] to 0
    set [name] to "Player"
`,
    },
    {
        name: "Change Variable",
        code: `
when flagClicked
    set [score] to 0
    change [score] by 1
    change [score] by 10
`,
    },
    {
        name: "Show/Hide Variable",
        code: `
when flagClicked
    show variable [score]
    hide variable [lives]
`,
    },
    {
        name: "Add to List",
        code: `
when flagClicked
    add "apple" to [fruits]
    add "banana" to [fruits]
`,
    },
    {
        name: "Delete from List",
        code: `
when flagClicked
    delete 1 of [fruits]
    delete all of [fruits]
`,
    },
    {
        name: "Insert into List",
        code: `
when flagClicked
    insert "orange" at 1 of [fruits]
`,
    },
    {
        name: "Replace in List",
        code: `
when flagClicked
    replace item 1 of [fruits] with "grape"
`,
    },
    {
        name: "List Reporters",
        code: `
when flagClicked
    say (item 1 of [fruits])
    say (length of [fruits])
    if <[fruits] contains "apple"> then
        say "Found apple!"
`,
    },
];

console.log("=== VARIABLES & LISTS TEST ===\n");

const compiler = new ScratchTextCompiler();

for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    const result = compiler.compile(test.code);
    
    if (result.error) {
        console.log("❌ ERROR:", result.error);
    } else {
        console.log("✅ Compiled successfully");
        const lines = result.js.split('\n').filter(l => 
            l.includes('variables[') || 
            l.includes('lists[') || 
            l.includes('addToList') ||
            l.includes('deleteOfList') ||
            l.includes('itemOfList') ||
            l.includes('lengthOfList')
        );
        if (lines.length > 0) {
            console.log("   Generated:", lines.slice(0, 3).map(l => l.trim()).join('\n   '));
        }
    }
    console.log();
}

console.log("=== VARIABLES & LISTS TESTS COMPLETE ===");
