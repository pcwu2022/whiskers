import { ScratchTextCompiler } from "../src/lib/compiler";
import * as fs from 'fs';

const compiler = new ScratchTextCompiler();
const code = `when green flag clicked
    move 100 steps
    say "Hello!"
end`;

const result = compiler.compile(code);
console.log("=== SUCCESS:", result.success);
console.log("=== ERRORS:", JSON.stringify(result.errors, null, 2));

// Save the HTML to a file for testing
fs.writeFileSync('/tmp/test_preview.html', result.html);
console.log("=== Saved HTML to /tmp/test_preview.html");

// Print the generated JS code portion
const jsMatch = result.js?.match(/\/\/ Scripts[\s\S]+$/);
if (jsMatch) {
    console.log("\n=== Generated Script Code:\n", jsMatch[0]);
}
