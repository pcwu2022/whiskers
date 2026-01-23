import { ScratchTextCompiler } from '../src/lib/compiler';

const code = `when flagClicked
    repeat 3
        repeat 2
            move 10
            wait 0.1
        say "inner"
    say "outer"
`;

const compiler = new ScratchTextCompiler();
const out = compiler.compile(code);
console.log('=== JS Output ===');
console.log(out.js);
console.log('=== HTML Output ===');
console.log(out.html);
