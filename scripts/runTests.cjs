// Test runner for scratch compiler - CommonJS version
// Run with: node scripts/runTests.cjs

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Simple test that directly requires the compiled files
async function runTest() {
    console.log("=== SCRATCH COMPILER TESTS ===\n");
    
    // We need to build first, then test against the built output
    // Or we can use the compiler directly
    
    // For now, let's do a simple inline test
    const testCode = `
when flagClicked
    say "Hello World!"
    repeat 3
        move 10
        turn 15
`;

    console.log("Test Input:");
    console.log(testCode);
    console.log("\n--- Running compilation test ---\n");
    
    // Import the lexer and parser directly
    try {
        // Use dynamic import for ES modules
        const { Lexer } = await import('../src/lib/lexer.js');
        const { Parser } = await import('../src/lib/parser.js');
        const { CodeGenerator } = await import('../src/lib/codeGenerator.js');
        
        const lexer = new Lexer(testCode);
        const tokens = lexer.tokenize();
        console.log("✅ Lexer: Tokenized successfully");
        console.log(`   Token count: ${tokens.length}`);
        
        const parser = new Parser(tokens);
        const ast = parser.parse();
        console.log("✅ Parser: AST generated successfully");
        console.log(`   Block count: ${ast.blocks.length}`);
        
        const generator = new CodeGenerator(ast);
        const output = generator.generate();
        console.log("✅ Generator: JavaScript generated successfully");
        console.log(`   Output length: ${output.js.length} chars`);
        
        console.log("\n=== ALL TESTS PASSED ===");
    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error.stack);
    }
}

runTest();
