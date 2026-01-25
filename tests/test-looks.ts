/**
 * Test Cases: Looks Blocks
 * Tests: say, think, show, hide, costume, size, effects
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "say",
        code: `when green flag clicked
    say "Hello!"
`,
        expectContains: ["say(", '"Hello!"']
    },
    {
        name: "say for seconds",
        code: `when green flag clicked
    say "Hi" for 2 secs
`,
        expectContains: ["say(", "2"]
    },
    {
        name: "think",
        code: `when green flag clicked
    think "Hmm..."
`,
        expectContains: ["say(", "💭", "Hmm..."]  // think uses say with 💭 prefix
    },
    {
        name: "show",
        code: `when green flag clicked
    show
`,
        expectContains: ["show()"]
    },
    {
        name: "hide",
        code: `when green flag clicked
    hide
`,
        expectContains: ["hide()"]
    },
    {
        name: "switch costume",
        code: `when green flag clicked
    switch costume to "costume2"
`,
        expectContains: ["switchCostume"]
    },
    {
        name: "next costume",
        code: `when green flag clicked
    next costume
`,
        expectContains: ["nextCostume"]
    },
    {
        name: "set size",
        code: `when green flag clicked
    set size to 150
`,
        expectContains: ["setSize(150)"]
    },
    {
        name: "change size",
        code: `when green flag clicked
    change size by 10
`,
        expectContains: ["changeSize(10)"]
    },
    {
        name: "change effect",
        code: `when green flag clicked
    change color effect by 25
`,
        expectContains: ["changeEffect", "color", "25"]
    },
    {
        name: "set effect",
        code: `when green flag clicked
    set ghost effect to 50
`,
        expectContains: ["setEffect", "ghost", "50"]
    },
    {
        name: "clear effects",
        code: `when green flag clicked
    clear graphic effects
`,
        expectContains: ["clearEffects"]
    },
    {
        name: "go to front layer",
        code: `when green flag clicked
    go to front layer
`,
        expectContains: ["goToFrontLayer"]
    },
    {
        name: "go back layers",
        code: `when green flag clicked
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
