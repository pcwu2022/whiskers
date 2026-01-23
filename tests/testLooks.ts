// Test: Looks Blocks
// Tests: say, think, show, hide, switchCostume, effects, size, layers

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "Say and Think",
        code: `
when flagClicked
    say "Hello!"
    say "Hello" for 2 secs
    think "Hmm..."
    think "Hmm..." for 2 secs
`,
    },
    {
        name: "Show and Hide",
        code: `
when flagClicked
    hide
    wait 1
    show
`,
    },
    {
        name: "Costumes",
        code: `
when flagClicked
    switch costume to "costume2"
    next costume
`,
    },
    {
        name: "Effects",
        code: `
when flagClicked
    change color effect by 25
    set color effect to 50
    change ghost effect by 10
    clear graphic effects
`,
    },
    {
        name: "Size",
        code: `
when flagClicked
    set size to 150 %
    change size by 10
`,
    },
    {
        name: "Layers",
        code: `
when flagClicked
    go to front layer
    go to back layer
    go forward 1 layers
    go backward 2 layers
`,
    },
];

console.log("=== LOOKS BLOCKS TEST ===\n");

const compiler = new ScratchTextCompiler();

for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    const result = compiler.compile(test.code);
    
    if (result.error) {
        console.log("❌ ERROR:", result.error);
    } else {
        console.log("✅ Compiled successfully");
        const lines = result.js.split('\n').filter(l => 
            l.includes('.say') || 
            l.includes('.think') || 
            l.includes('.show') ||
            l.includes('.hide') ||
            l.includes('switchCostume') ||
            l.includes('Effect') ||
            l.includes('setSize') ||
            l.includes('Layer')
        );
        if (lines.length > 0) {
            console.log("   Generated:", lines.slice(0, 3).map(l => l.trim()).join('\n   '));
        }
    }
    console.log();
}

console.log("=== LOOKS TESTS COMPLETE ===");
