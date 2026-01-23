const fs = require('fs');
const path = require('path');

const out = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/debug/compilerOutput.json'), 'utf8'));
const entry = out.find(e => e.message && e.message.includes('Generator output'));
if (!entry) {
    console.error('No generator output found');
    process.exit(1);
}
const js = entry.context.js;

const safeCode = js.replace(/console.log\(/g, 'console.log(');

try {
    const lines = safeCode.split(/\n/);
    let accumulated = '';
    for (let i = 0; i < lines.length; i++) {
        accumulated += lines[i] + '\n';
        try {
            // try parse only
                const testBody = 'return (async () => { ' + accumulated + ' })()';
                // show the raw test body for the failing iteration
                console.log('testing body (truncated):', testBody.slice(0, 500));
                new Function('saveOutput', testBody);
        } catch (err) {
            console.error('parse error at line', i + 1);
            const contextStart = Math.max(0, i - 5);
            console.error('---- context ----');
            console.error(lines.slice(contextStart, i + 5).join('\n'));
            console.error('---- end context ----');
            console.error(err);
            process.exit(1);
        }
    }
    // If parsing never failed, run it
    const body = 'return (async () => { ' + safeCode + ' })()';
    const fn = new Function('saveOutput', body);
    fn((...args)=> console.log('OUTPUT:', ...args)).then(()=> console.log('done')).catch(err => console.error('runtime error', err));
} catch (err) {
    console.error('unexpected error', err);
}
