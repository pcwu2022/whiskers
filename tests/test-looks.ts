/**
 * Test Cases: Looks Blocks
 * Tests: say, think, show, hide, costume, size, effects
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "say",
        code: `when flagClicked
    say "Hello!"
`,
        expectContains: ["say(", '"Hello!"']
    },
    {
        name: "say for seconds",
        code: `when flagClicked
    say "Hi" for 2 secs
`,
        expectContains: ["say(", "2"]
    },
    {
        name: "think",
        code: `when flagClicked
    think "Hmm..."
`,
        expectContains: ["think("]
    },
    {
        name: "show",
        code: `when flagClicked
    show
`,
        expectContains: ["show()"]
    },
    {
        name: "hide",
        code: `when flagClicked
    hide
`,
        expectContains: ["hide()"]
    },
    {
        name: "switch costume",
        code: `when flagClicked
    switch costume to "costume2"
`,
        expectContains: ["switchCostume"]
    },
    {
        name: "next costume",
        code: `when flagClicked
    next costume
`,
        expectContains: ["nextCostume"]
    },
    {
        name: "set size",
        code: `when flagClicked
    set size to 150
`,
        expectContains: ["setSize(150)"]
    },
    {
        name: "change size",
        code: `when flagClicked
    change size by 10
`,
        expectContains: ["changeSize(10)"]
    },
    {
        name: "change effect",
        code: `when flagClicked
    change color effect by 25
`,
        expectContains: ["changeEffect", "color", "25"]
    },
    {
        name: "set effect",
        code: `when flagClicked
    set ghost effect to 50
`,
        expectContains: ["setEffect", "ghost", "50"]
    },
    {
        name: "clear effects",
        code: `when flagClicked
    clear graphic effects
`,
        expectContains: ["clearEffects"]
    },
    {
        name: "go to front layer",
        code: `when flagClicked
    go to front layer
`,
        expectContains: ["goToFrontLayer"]
    },
    {
        name: "go back layers",
        code: `when flagClicked
    go back 2 layers
`,
        expectContains: ["goBackLayers"]
    }
];

console.log("=== Looks Blocks Test Suite ===\n");

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
