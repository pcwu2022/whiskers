// Test: Sensing Blocks
// Tests: touching, mouse, keyboard, timer, ask

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "Touching Detection",
        code: `
when flagClicked
    forever
        if <touching "edge"> then
            turn 180
        if <touching "Sprite2"> then
            say "Collision!"
        if <touching "mouse-pointer"> then
            say "Mouse over!"
`,
    },
    {
        name: "Mouse Input",
        code: `
when flagClicked
    forever
        go to x: (mouse x) y: (mouse y)
        if <mouse down> then
            say "Clicking!"
`,
    },
    {
        name: "Keyboard Input",
        code: `
when flagClicked
    forever
        if <key "space" pressed> then
            say "Space!"
        if <key "up arrow" pressed> then
            change y by 5
`,
    },
    {
        name: "Timer",
        code: `
when flagClicked
    reset timer
    wait until <(timer) > (5)>
    say "5 seconds passed!"
`,
    },
    {
        name: "Ask and Answer",
        code: `
when flagClicked
    ask "What's your name?" and wait
    say (join "Hello, " (answer))
`,
    },
    {
        name: "Distance To",
        code: `
when flagClicked
    if <(distance to "Sprite2") < (50)> then
        say "Getting close!"
`,
    },
    {
        name: "Current Date/Time",
        code: `
when flagClicked
    say (join "Year: " (current year))
    say (join "Month: " (current month))
`,
    },
];

console.log("=== SENSING BLOCKS TEST ===\n");

const compiler = new ScratchTextCompiler();

for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    const result = compiler.compile(test.code);
    
    if (result.error) {
        console.log("❌ ERROR:", result.error);
    } else {
        console.log("✅ Compiled successfully");
        const lines = result.js.split('\n').filter(l => 
            l.includes('isTouching') || 
            l.includes('mouse') || 
            l.includes('isKeyPressed') ||
            l.includes('timer') ||
            l.includes('answer') ||
            l.includes('distanceTo') ||
            l.includes('Date')
        );
        if (lines.length > 0) {
            console.log("   Generated:", lines.slice(0, 3).map(l => l.trim()).join('\n   '));
        }
    }
    console.log();
}

console.log("=== SENSING TESTS COMPLETE ===");
