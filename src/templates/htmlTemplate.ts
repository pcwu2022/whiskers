// HTML Template for Scratch Program Output
// This template wraps the generated JavaScript code in an HTML page

export function generateHTMLTemplate(jsCode: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scratch Preview</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f0f0f0;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .stage-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 8px;
            gap: 8px;
        }
        
        .controls {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        
        .flag-btn {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #4CAF50;
            transition: all 0.15s;
        }
        .flag-btn:hover {
            background-color: #45a049;
            transform: scale(1.05);
        }
        .flag-btn:active {
            transform: scale(0.95);
        }
        
        .stop-btn {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #e53935;
            transition: all 0.15s;
        }
        .stop-btn:hover {
            background-color: #c62828;
            transform: scale(1.05);
        }
        .stop-btn:active {
            transform: scale(0.95);
        }
        
        #stage {
            flex: 1;
            background-color: white;
            border: 2px solid #d0d0d0;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
            min-height: 200px;
        }
        
        #console {
            height: 100px;
            border: 1px solid #d0d0d0;
            border-radius: 6px;
            padding: 6px 8px;
            overflow-y: auto;
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 11px;
            background-color: #1a1a2e;
            color: #eee;
        }
        
        #console:empty::before {
            content: 'Console...';
            color: #555;
        }
        
        .log-line {
            padding: 1px 0;
            border-bottom: 1px solid #2a2a3e;
        }
        .log-line:last-child {
            border-bottom: none;
        }
        .log-line.say {
            color: #4fc3f7;
        }
        .log-line.flag {
            color: #81c784;
        }
        .log-line.stop {
            color: #e57373;
        }
    </style>
</head>
<body>
    <div class="stage-container">
        <div class="controls">
            <button id="flag-btn" class="flag-btn" title="Green Flag - Start">🚩</button>
            <button id="stop-btn" class="stop-btn" title="Stop and Reset">🛑</button>
        </div>
        <div id="stage"></div>
        <div id="console"></div>
    </div>

    <script>
        // Console logging override
        const originalLog = console.log;
        const originalError = console.error;
        
        function log(msg, cls) {
            const c = document.getElementById('console');
            if (c) {
                const line = document.createElement('div');
                line.className = 'log-line' + (cls ? ' ' + cls : '');
                line.textContent = msg;
                c.appendChild(line);
                c.scrollTop = c.scrollHeight;
            }
        }
        
        console.log = function() {
            originalLog.apply(console, arguments);
            const msg = Array.from(arguments).join(' ');
            let cls = '';
            if (msg.includes('says:')) cls = 'say';
            else if (msg.includes('🚩')) cls = 'flag';
            else if (msg.includes('🛑')) cls = 'stop';
            log(msg, cls);
        };
        
        console.error = function() {
            originalError.apply(console, arguments);
            log('Error: ' + Array.from(arguments).join(' '), 'stop');
        };
        
        // Green Flag button
        document.getElementById('flag-btn').addEventListener('click', function() {
            document.getElementById('console').innerHTML = '';
            if (typeof scratchRuntime !== 'undefined') {
                scratchRuntime.greenFlag();
            }
        });
        
        // Stop button (also resets)
        document.getElementById('stop-btn').addEventListener('click', function() {
            if (typeof scratchRuntime !== 'undefined') {
                scratchRuntime.stopAll();
            }
            // Reset by reloading
            setTimeout(function() { location.reload(); }, 100);
        });
        
        // Generated program code
        ${jsCode}
    </script>
</body>
</html>`;
}
