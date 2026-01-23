import { ScratchTextCompiler } from '@/lib/compiler';

// Test the updated sample code
const code = `when flagClicked
    say "Hello! Watch me dance!"
    wait 1
    repeat 4
        move 50
        turn right 90
        wait 0.3

when keyPressed space
    say "You pressed space!"

when keyPressed up
    move 20

when keyPressed left
    turn left 15`;

const compiler = new ScratchTextCompiler();
const result = compiler.compileMultiSprite([
    { name: "Sprite1", code: code, isStage: false }
]);

console.log('=== Generated JavaScript (Scripts section only) ===');
// Extract just the scripts section
const scriptsMatch = result.js.match(/\/\/ Scripts[\s\S]*/);
if (scriptsMatch) {
    console.log(scriptsMatch[0]);
}

if (result.error) {
    console.error('\n=== Errors ===');
    console.error(result.error);
}
