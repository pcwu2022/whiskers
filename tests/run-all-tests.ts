/**
 * Run All Test Suites
 * Executes all test files and provides a summary
 */

import { execSync } from 'child_process';
import * as path from 'path';

const testFiles = [
    'test-events.ts',
    'test-control.ts',
    'test-motion.ts',
    'test-looks.ts',
    'test-variables.ts',
    'test-operators.ts',
    'test-sensing.ts',
    'test-multisprite.ts'
];

console.log('╔══════════════════════════════════════════════╗');
console.log('║     Scratch Compiler - Full Test Suite       ║');
console.log('╚══════════════════════════════════════════════╝\n');

let totalPassed = 0;
let totalFailed = 0;
const results: { name: string; passed: boolean; output: string }[] = [];

for (const testFile of testFiles) {
    const testPath = path.join(__dirname, testFile);
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`Running: ${testFile}`);
    console.log('─'.repeat(50));
    
    try {
        const output = execSync(
            `npx ts-node --project tsconfig.json -r tsconfig-paths/register ${testPath}`,
            { 
                encoding: 'utf-8',
                cwd: path.join(__dirname, '..'),
                stdio: ['pipe', 'pipe', 'pipe']
            }
        );
        console.log(output);
        
        // Parse results from output
        const match = output.match(/(\d+)\/(\d+) passed/);
        if (match) {
            const [, passed, total] = match;
            totalPassed += parseInt(passed);
            totalFailed += parseInt(total) - parseInt(passed);
        }
        
        results.push({ name: testFile, passed: true, output });
    } catch (error: unknown) {
        const execError = error as { stdout?: string; stderr?: string };
        console.log(execError.stdout || '');
        console.error(execError.stderr || '');
        
        // Parse results even from failed runs
        const match = (execError.stdout || '').match(/(\d+)\/(\d+) passed/);
        if (match) {
            const [, passed, total] = match;
            totalPassed += parseInt(passed);
            totalFailed += parseInt(total) - parseInt(passed);
        }
        
        results.push({ name: testFile, passed: false, output: execError.stdout || '' });
    }
}

console.log('\n' + '═'.repeat(50));
console.log('                  SUMMARY');
console.log('═'.repeat(50));

for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
}

console.log('─'.repeat(50));
console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
console.log('═'.repeat(50));

process.exit(totalFailed > 0 ? 1 : 0);
