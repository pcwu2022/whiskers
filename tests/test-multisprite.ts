/**
 * Test Cases: Multi-Sprite Compilation
 * Tests: Multiple sprites, stage/backdrop, inter-sprite communication
 */

import { ScratchTextCompiler } from '../src/lib/compiler';

const testCases = [
    {
        name: "Two sprites",
        sprites: [
            { name: "Cat", code: `when flagClicked\n    say "Meow!"` },
            { name: "Dog", code: `when flagClicked\n    say "Woof!"` }
        ],
        expectContains: ["Cat", "Dog", "Meow", "Woof"]
    },
    {
        name: "Stage and sprite",
        sprites: [
            { name: "Stage", code: `when flagClicked\n    // Stage init`, isStage: true },
            { name: "Player", code: `when flagClicked\n    move 10` }
        ],
        expectContains: ["Stage", "Player", "move"]
    },
    {
        name: "Broadcast between sprites",
        sprites: [
            { name: "Sender", code: `when flagClicked\n    broadcast "hello"` },
            { name: "Receiver", code: `when I receive "hello"\n    say "Got it!"` }
        ],
        expectContains: ["broadcast", "whenReceived", "hello"]
    },
    {
        name: "Clone communication",
        sprites: [
            { 
                name: "Parent", 
                code: `when flagClicked
    repeat 3
        create clone of myself

when I start as a clone
    go to x: (pick random -200 to 200) y: 0
    show` 
            }
        ],
        expectContains: ["createClone", "whenCloneStarts"]
    },
    {
        name: "Multiple event handlers per sprite",
        sprites: [
            { 
                name: "MultiHandler", 
                code: `when flagClicked
    say "Started"

when [space] key pressed
    jump

when this sprite clicked
    say "Ouch!"` 
            }
        ],
        expectContains: ["whenFlagClicked", "whenKeyPressed", "whenSpriteClicked"]
    }
];

console.log("=== Multi-Sprite Test Suite ===\n");

const compiler = new ScratchTextCompiler();
let passed = 0;
let failed = 0;

for (const test of testCases) {
    const result = compiler.compileMultiSprite(test.sprites);
    const allFound = test.expectContains.every(str => result.js.includes(str));
    
    if (allFound && !result.error) {
        console.log(`✅ PASS: ${test.name}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Expected to contain: ${test.expectContains.join(", ")}`);
        console.log(`   Output: ${result.js.substring(0, 400)}...`);
        if (result.error) console.log(`   Error: ${result.error}`);
        failed++;
    }
}

console.log(`\n=== Results: ${passed}/${passed + failed} passed ===`);
process.exit(failed > 0 ? 1 : 0);
