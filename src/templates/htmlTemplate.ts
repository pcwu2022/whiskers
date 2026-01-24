// HTML Template for Scratch Program Output
// This template wraps the generated JavaScript code in an HTML page

export function generateHTMLTemplate(jsCode: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CatScript Preview</title>
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
        
        .control-btn {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
            background: transparent;
        }
        .control-btn:hover {
            transform: scale(1.1);
        }
        .control-btn:active {
            transform: scale(0.95);
        }
        
        .flag-btn img, .stop-btn img {
            width: 32px;
            height: 32px;
            object-fit: contain;
        }
        
        .fullscreen-btn {
            font-size: 18px;
            margin-left: auto;
            color: #666;
        }
        .fullscreen-btn:hover {
            color: #333;
        }
        
        #stage-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 200px;
        }
        
        #stage {
            flex: 1;
            background-color: white;
            border: 2px solid #d0d0d0;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
            aspect-ratio: 4 / 3;
        }
        
        #stage-content {
            position: absolute;
            width: 480px;
            height: 360px;
            left: 50%;
            top: 50%;
            transform-origin: center center;
            /* Scale is calculated by JS based on actual stage size */
        }
        
        #stage-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            flex-direction: column;
            color: #666;
        }
        #stage-overlay.hidden {
            display: none;
        }
        #stage-overlay .message {
            font-size: 16px;
            text-align: center;
        }
        #stage-overlay .icon {
            font-size: 48px;
            margin-bottom: 12px;
        }
        
        .output-section {
            display: flex;
            flex-direction: column;
        }
        .output-section.collapsed #console {
            display: none;
        }
        .output-section.collapsed .console-header {
            border-radius: 6px;
        }
        
        .console-header {
            background-color: #2d2d44;
            color: #aaa;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 8px;
            border: 1px solid #d0d0d0;
            border-radius: 6px 6px 0 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            user-select: none;
        }
        .console-header:hover {
            background-color: #3d3d54;
        }
        .console-toggle {
            font-size: 10px;
            opacity: 0.7;
        }
        
        #console {
            height: 100px;
            border: 1px solid #d0d0d0;
            border-top: none;
            border-radius: 0 0 6px 6px;
            padding: 6px 8px;
            overflow-y: auto;
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 11px;
            background-color: #1a1a2e;
            color: #eee;
        }
        
        #console:empty::before {
            content: 'Console output will appear here...';
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
        
        /* Fullscreen styles */
        body.fullscreen {
            background-color: #1a1a2e;
        }
        body.fullscreen .stage-container {
            justify-content: center;
            align-items: center;
            padding: 16px;
        }
        body.fullscreen .controls {
            position: absolute;
            top: 16px;
            left: 16px;
            z-index: 100;
        }
        body.fullscreen #stage-wrapper {
            flex: none;
            width: 100%;
            height: 100%;
            max-width: calc(100vh * 4 / 3 - 32px);
            max-height: calc(100vw * 3 / 4 - 32px);
        }
        body.fullscreen #stage {
            width: 100%;
            height: 100%;
        }
        body.fullscreen .output-section {
            display: none;
        }
        body.fullscreen .fullscreen-btn {
            color: #e53935;
        }
        body.fullscreen .fullscreen-btn:hover {
            color: #ff5252;
        }
    </style>
</head>
<body>
    <div class="stage-container">
        <div class="controls">
            <button id="flag-btn" class="control-btn flag-btn" title="Run program"><img src="/flag.png" alt="Run"></button>
            <button id="stop-btn" class="control-btn stop-btn" title="Stop and Reset"><img src="/stop.png" alt="Stop"></button>
            <button id="fullscreen-btn" class="control-btn fullscreen-btn" title="Toggle Fullscreen">⛶</button>
        </div>
        <div id="stage-wrapper">
            <div id="stage">
                <div id="stage-content">
                    <!-- Sprites go here -->
                </div>
                <div id="stage-overlay">
                    <div class="icon"><img src="/flag.png" width="50" height="50" alt="Run"></div>
                    <div class="message">Click the green flag to run</div>
                </div>
            </div>
        </div>
        <div class="output-section" id="output-section">
            <div class="console-header" id="console-header">
                <span>Output</span>
                <span class="console-toggle" id="console-toggle">▼</span>
            </div>
            <div id="console"></div>
        </div>
    </div>

    <script>
        // State
        let outputCollapsed = false;
        const IS_FULLSCREEN = __IS_FULLSCREEN__;
        
        // Scale the stage content to fit the actual stage size
        function updateStageScale() {
            const stage = document.getElementById('stage');
            const content = document.getElementById('stage-content');
            if (!stage || !content) return;
            
            const stageWidth = stage.clientWidth;
            const stageHeight = stage.clientHeight;
            const scale = Math.min(stageWidth / 480, stageHeight / 360);
            
            content.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
        }
        
        // Update scale on window resize
        window.addEventListener('resize', updateStageScale);
        
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
        
        // Toggle output section
        document.getElementById('console-header').addEventListener('click', function() {
            outputCollapsed = !outputCollapsed;
            document.getElementById('output-section').classList.toggle('collapsed', outputCollapsed);
            document.getElementById('console-toggle').textContent = outputCollapsed ? '▶' : '▼';
        });
        
        // Toggle fullscreen - send message to parent
        document.getElementById('fullscreen-btn').addEventListener('click', function() {
            if (window.parent !== window) {
                // Toggle fullscreen - if already fullscreen, exit; otherwise enter
                window.parent.postMessage({ type: 'scratch-fullscreen', enabled: !IS_FULLSCREEN }, '*');
            } else {
                // Standalone mode - use internal fullscreen
                document.body.classList.toggle('fullscreen');
            }
        });
        
        // Update fullscreen button appearance if in fullscreen mode
        if (IS_FULLSCREEN) {
            const btn = document.getElementById('fullscreen-btn');
            btn.style.backgroundColor = '#e53935';
            btn.title = 'Exit Fullscreen';
        };
        
        // Listen for auto-start message from parent
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'scratch-autostart') {
                const overlay = document.getElementById('stage-overlay');
                if (overlay) overlay.classList.add('hidden');
                const consoleEl = document.getElementById('console');
                if (consoleEl) consoleEl.innerHTML = '';
                if (typeof scratchRuntime !== 'undefined') {
                    scratchRuntime.greenFlag();
                }
            }
        });
        
        // Green Flag button - request recompile from parent
        document.getElementById('flag-btn').addEventListener('click', function() {
            // Hide the initial overlay
            document.getElementById('stage-overlay').classList.add('hidden');
            
            // Clear console
            document.getElementById('console').innerHTML = '';
            
            // Send message to parent to recompile with latest code
            if (window.parent !== window) {
                // Show loading message
                const overlay = document.getElementById('stage-overlay');
                overlay.querySelector('.icon').textContent = '⏳';
                overlay.querySelector('.message').textContent = 'Recompiling...';
                overlay.classList.remove('hidden');
                window.parent.postMessage({ type: 'scratch-recompile' }, '*');
            } else {
                // Standalone mode - just restart
                if (typeof scratchRuntime !== 'undefined') {
                    scratchRuntime.greenFlag();
                }
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
        
        // Initial setup on load
        window.addEventListener('load', function() {
            // Initial scale calculation
            updateStageScale();
        });
        
        // Generated program code
        ${jsCode}
    </script>
</body>
</html>`;
}
