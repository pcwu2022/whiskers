// Test: Multi-Sprite Projects
// Tests: Multiple sprites, backdrop/stage, inter-sprite communication

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "Two Sprites Basic",
        sprites: [
            {
                name: "Stage",
                code: `when flagClicked\n    // Stage ready`,
                isStage: true,
            },
            {
                name: "Cat",
                code: `
when flagClicked
    say "I'm the cat!"
    move 50
`,
            },
            {
                name: "Dog",
                code: `
when flagClicked
    say "I'm the dog!"
    move -50
`,
            },
        ],
    },
    {
        name: "Broadcast Between Sprites",
        sprites: [
            {
                name: "Stage",
                code: `when flagClicked`,
                isStage: true,
            },
            {
                name: "Button",
                code: `
when this sprite clicked
    broadcast "buttonClicked"
`,
            },
            {
                name: "Player",
                code: `
when I receive "buttonClicked"
    say "Button was clicked!"
    move 20
`,
            },
        ],
    },
    {
        name: "Backdrop Switching",
        sprites: [
            {
                name: "Stage",
                code: `
when flagClicked
    switch backdrop to "day"
    wait 2
    switch backdrop to "night"
`,
                isStage: true,
            },
            {
                name: "Sun",
                code: `
when backdrop switches to "day"
    show

when backdrop switches to "night"
    hide
`,
            },
        ],
    },
    {
        name: "Clone Communication",
        sprites: [
            {
                name: "Stage",
                code: `when flagClicked`,
                isStage: true,
            },
            {
                name: "Spawner",
                code: `
when flagClicked
    repeat 5
        create clone of "Enemy"
        wait 1
`,
            },
            {
                name: "Enemy",
                code: `
when I start as a clone
    go to x: (pick random -200 to 200) y: 150
    show
    repeat 30
        change y by -5
    delete this clone
`,
            },
        ],
    },
    {
        name: "Full Game Structure",
        sprites: [
            {
                name: "Stage",
                code: `
when flagClicked
    switch backdrop to "game"
    broadcast "gameStart"
`,
                isStage: true,
            },
            {
                name: "Player",
                code: `
when flagClicked
    go to x: 0 y: -100
    set [score] to 0

when I receive "gameStart"
    forever
        if <key "left arrow" pressed> then
            change x by -5
        if <key "right arrow" pressed> then
            change x by 5
`,
            },
            {
                name: "Coin",
                code: `
when I receive "gameStart"
    forever
        go to x: (pick random -200 to 200) y: (pick random -100 to 100)
        wait until <touching "Player">
        change [score] by 10
        broadcast "coinCollected"
`,
            },
            {
                name: "ScoreDisplay",
                code: `
when flagClicked
    go to x: -200 y: 160

when I receive "coinCollected"
    say (join "Score: " (score)) for 0.5 secs
`,
            },
        ],
    },
];

console.log("=== MULTI-SPRITE TEST ===\n");

const compiler = new ScratchTextCompiler();

for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    console.log(`   Sprites: ${test.sprites.map(s => s.name).join(', ')}`);
    
    const result = compiler.compileMultiSprite(test.sprites);
    
    if (result.error) {
        console.log("❌ ERROR:", result.error);
    } else {
        console.log("✅ Compiled successfully");
        
        // Count sprite initializations
        const spriteInits = (result.js.match(/initSprite\(/g) || []).length;
        console.log(`   Sprite initializations: ${spriteInits}`);
        
        // Count event handlers
        const eventHandlers = (result.js.match(/addEventListener|whenReceived/g) || []).length;
        console.log(`   Event handlers: ${eventHandlers}`);
        
        // Show HTML has canvas
        const hasCanvas = result.html.includes('canvas');
        console.log(`   Has canvas: ${hasCanvas ? '✅' : '❌'}`);
    }
    console.log();
}

console.log("=== MULTI-SPRITE TESTS COMPLETE ===");
