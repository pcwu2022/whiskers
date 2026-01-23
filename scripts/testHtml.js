const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

const out = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/debug/compilerOutput.json'), 'utf8'));
const entry = out.find(e => e.message && e.message.includes('Generator output'));
const html = entry.context.html;

(async () => {
    try {
        const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
        // wait short time for scripts to execute
        await new Promise((resolve) => setTimeout(resolve, 200));
        console.log('DOM loaded');
        const consoleDiv = dom.window.document.getElementById('console');
        if (consoleDiv) {
            console.log('Console contents:\n', consoleDiv.textContent.trim());
        } else {
            console.log('No console div found');
        }
    } catch (err) {
        console.error('Error running HTML in jsdom:', err);
    }
})();
