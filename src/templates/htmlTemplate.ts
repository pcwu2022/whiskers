// HTML Template for Scratch Program Output
// This template wraps the generated JavaScript code in an HTML page

// Default paths for images (used in iframe preview)
const DEFAULT_FLAG_SRC = "/flag.png";
const DEFAULT_STOP_SRC = "/stop.png";

// Generate an empty preview template (no code, but workable green flag for recompile)
export function generateEmptyPreviewTemplate(): string {
    return generateHTMLTemplate(`
        // Empty preview - no code compiled yet or compilation failed
        // The green flag will trigger a recompile from the parent editor
        console.log('⚠️ No code compiled. Fix errors in your code and click the green flag to compile.');
    `);
}

// Options for HTML generation
interface HTMLTemplateOptions {
    flagImageSrc?: string;  // Base64 data URL or path for flag image
    stopImageSrc?: string;  // Base64 data URL or path for stop image
    title?: string;         // Page title (defaults to "Whiskers Preview")
}

export function generateHTMLTemplate(jsCode: string, options?: HTMLTemplateOptions): string {
    const flagSrc = options?.flagImageSrc || DEFAULT_FLAG_SRC;
    const stopSrc = options?.stopImageSrc || DEFAULT_STOP_SRC;
    const pageTitle = options?.title || "Whiskers Preview";
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
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
        
        .flag-btn.disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        .flag-btn.disabled:hover {
            transform: none;
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
            max-height: calc(100vh - 150px); /* Limit height to maintain aspect ratio */
        }
        
        #stage {
            background-color: white;
            border: 2px solid #d0d0d0;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
            aspect-ratio: 480 / 360;
            width: 100%;
            max-width: calc((100vh - 150px) * 480 / 360); /* Maintain aspect ratio based on available height */
            margin: 0 auto; /* Center horizontally */
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
        
        /* Mouse position tooltip */
        #mouse-tooltip {
            position: fixed;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            font-size: 11px;
            font-family: monospace;
            padding: 2px 6px;
            border-radius: 4px;
            pointer-events: none;
            z-index: 1000;
            display: none;
            white-space: nowrap;
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
            max-width: none;
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
            <button id="flag-btn" class="control-btn flag-btn" title="Run program"><img src="${flagSrc}" alt="Run"></button>
            <button id="stop-btn" class="control-btn stop-btn" title="Stop and Reset"><img src="${stopSrc}" alt="Stop"></button>
            <button id="fullscreen-btn" class="control-btn fullscreen-btn" title="Toggle Fullscreen">⛶</button>
        </div>
        <div id="stage-wrapper">
            <div id="stage">
                <div id="stage-content">
                    <!-- Sprites go here -->
                </div>
                <div id="stage-overlay">
                    <div class="icon"><img src="${flagSrc}" width="50" height="50" alt="Run"></div>
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
    <div id="mouse-tooltip"></div>

    <script>
        // State
        let outputCollapsed = false;
        let isRunning = false;
        // This placeholder gets replaced by CodeEditor.tsx when rendering the iframe
        const IS_FULLSCREEN = false; // __FULLSCREEN_PLACEHOLDER__
        
        // Scale the stage content to fit the actual stage size while maintaining 480:360 aspect ratio
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
        
        // Mouse position tooltip
        const mouseTooltip = document.getElementById('mouse-tooltip');
        document.getElementById('stage').addEventListener('mousemove', function(e) {
            const stage = document.getElementById('stage');
            const rect = stage.getBoundingClientRect();
            const scale = stage.clientWidth / 480;
            const x = Math.round((e.clientX - rect.left) / scale - 240);
            const y = Math.round(180 - (e.clientY - rect.top) / scale);
            
            mouseTooltip.style.display = 'block';
            mouseTooltip.style.left = (e.clientX + 12) + 'px';
            mouseTooltip.style.top = (e.clientY + 12) + 'px';
            mouseTooltip.textContent = 'x: ' + x + ', y: ' + y;
        });
        
        document.getElementById('stage').addEventListener('mouseleave', function() {
            mouseTooltip.style.display = 'none';
        });
        
        // Stage click logging
        document.getElementById('stage').addEventListener('click', function(e) {
            // Don't log if clicking on overlay
            if (e.target.closest('#stage-overlay')) return;
            
            const stage = document.getElementById('stage');
            const rect = stage.getBoundingClientRect();
            const scale = stage.clientWidth / 480;
            const x = Math.round((e.clientX - rect.left) / scale - 240);
            const y = Math.round(180 - (e.clientY - rect.top) / scale);
            
            console.log('🖱️ Stage clicked at x: ' + x + ', y: ' + y);
        });
        
        // Update flag button state based on running status
        function updateFlagButton() {
            const flagBtn = document.getElementById('flag-btn');
            if (isRunning) {
                flagBtn.classList.add('disabled');
                flagBtn.title = 'Please stop the program before re-running';
            } else {
                flagBtn.classList.remove('disabled');
                flagBtn.title = 'Run program';
            }
        }
        
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
                if (window.scratchRuntime) {
                    isRunning = true;
                    updateFlagButton();
                    window.scratchRuntime.greenFlag();
                }
            }
        });
        
        // Green Flag button - request recompile from parent
        document.getElementById('flag-btn').addEventListener('click', function() {
            // Don't run if already running
            if (isRunning) return;
            
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
                if (window.scratchRuntime) {
                    isRunning = true;
                    updateFlagButton();
                    window.scratchRuntime.greenFlag();
                }
            }
        });
        
        // Stop button - stops animation but keeps sprites visible for debugging
        document.getElementById('stop-btn').addEventListener('click', function() {
            if (window.scratchRuntime) {
                window.scratchRuntime.stopAll();
            }
            isRunning = false;
            updateFlagButton();
            // Don't reload - allow user to move sprites for debugging
            console.log('🛑 Program stopped. Sprites can be moved for debugging.');
        });
        
        // Initial setup on load
        window.addEventListener('load', function() {
            // Initial scale calculation
            updateStageScale();
            // Initialize flag button state
            updateFlagButton();
            
            // Register callback for when stopAll is called from code
            if (window.scratchRuntime) {
                window.scratchRuntime.onStopAllCallback = function() {
                    isRunning = false;
                    updateFlagButton();
                };
            }
            
            // Notify parent that runtime is ready
            if (window.parent !== window) {
                window.parent.postMessage({ type: 'scratch-ready' }, '*');
            }
        });
        
        // Global error handler - catches runtime errors from generated code
        window.onerror = function(message, source, lineno, colno, error) {
            console.error('Runtime error:', message);
            // Notify parent IDE about the runtime error
            if (window.parent !== window) {
                window.parent.postMessage({ 
                    type: 'scratch-runtime-error', 
                    message: String(message),
                    details: error ? error.stack : null
                }, '*');
            }
            // Prevent the error from showing in browser console popup
            return true;
        };
        
        // Also catch unhandled promise rejections
        window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled promise rejection:', event.reason);
            if (window.parent !== window) {
                window.parent.postMessage({ 
                    type: 'scratch-runtime-error', 
                    message: String(event.reason),
                    details: event.reason && event.reason.stack ? event.reason.stack : null
                }, '*');
            }
        });
        
        // Wrap the generated code execution in try-catch
        try {
        // Generated program code
        ${jsCode}
        } catch (e) {
            console.error('Script initialization error:', e);
            if (window.parent !== window) {
                window.parent.postMessage({ 
                    type: 'scratch-runtime-error', 
                    message: e.message || String(e),
                    details: e.stack || null
                }, '*');
            }
        }
    </script>
</body>
</html>`;
}
