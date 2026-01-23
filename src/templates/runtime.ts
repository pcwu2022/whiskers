// Scratch Runtime Template
// This template contains the base runtime code that is generated for all Scratch programs

export const SCRATCH_RUNTIME = `// Generated Scratch-like JavaScript code
// Runtime support functions
const scratchRuntime = {
    sprites: {},
    stage: { width: 480, height: 360, backgroundColor: 'white' },
    currentSprite: 'Sprite1',
    variables: {},
    lists: {},
    procedures: {},
    events: {},
    greenFlagHandlers: [],
    answer: '',
    broadcasts: {},
    running: false,

    // Initialize the default sprite
    initSprite: function(name) {
        this.sprites[name] = {
            x: 0,
            y: 0,
            direction: 90,
            visible: true,
            size: 100,
            move: function(steps) {
                const radians = (this.direction - 90) * Math.PI / 180;
                this.x += steps * Math.cos(radians);
                this.y -= steps * Math.sin(radians);
                scratchRuntime.updateSpritePosition(name);
            },
            turnRight: function(degrees) {
                this.direction = (this.direction + degrees) % 360;
                scratchRuntime.updateSpriteRotation(name);
            },
            turnLeft: function(degrees) {
                this.direction = (this.direction - degrees + 360) % 360;
                scratchRuntime.updateSpriteRotation(name);
            },
            pointInDirection: function(dir) {
                this.direction = dir % 360;
                if (this.direction < 0) this.direction += 360;
                scratchRuntime.updateSpriteRotation(name);
            },
            goTo: function(x, y) {
                this.x = x;
                this.y = y;
                scratchRuntime.updateSpritePosition(name);
            },
            setX: function(x) {
                this.x = x;
                scratchRuntime.updateSpritePosition(name);
            },
            setY: function(y) {
                this.y = y;
                scratchRuntime.updateSpritePosition(name);
            },
            changeX: function(dx) {
                this.x += dx;
                scratchRuntime.updateSpritePosition(name);
            },
            changeY: function(dy) {
                this.y += dy;
                scratchRuntime.updateSpritePosition(name);
            },
            hide: function() {
                this.visible = false;
                const spriteDiv = document.getElementById('sprite-' + name);
                if (spriteDiv) spriteDiv.style.display = 'none';
            },
            show: function() {
                this.visible = true;
                const spriteDiv = document.getElementById('sprite-' + name);
                if (spriteDiv) spriteDiv.style.display = 'block';
            },
            setSize: function(size) {
                this.size = size;
                scratchRuntime.updateSpriteSize(name);
            },
            changeSize: function(change) {
                this.size += change;
                scratchRuntime.updateSpriteSize(name);
            },
            say: function(message, seconds) {
                scratchRuntime.showSpeechBubble(name, message, seconds);
            },
            think: function(message, seconds) {
                scratchRuntime.showSpeechBubble(name, message, seconds, true);
            }
        };
        // Create visual element if stage is already rendered
        this.createSpriteElement(name);
    },

    // Update sprite position in DOM
    updateSpritePosition: function(name) {
        const sprite = this.sprites[name];
        const spriteDiv = document.getElementById('sprite-' + name);
        if (spriteDiv && sprite) {
            spriteDiv.style.left = (sprite.x + this.stage.width/2 - 15) + 'px';
            spriteDiv.style.bottom = (sprite.y + this.stage.height/2 - 15) + 'px';
        }
    },

    // Update sprite rotation in DOM
    updateSpriteRotation: function(name) {
        const sprite = this.sprites[name];
        const spriteDiv = document.getElementById('sprite-' + name);
        if (spriteDiv && sprite) {
            spriteDiv.style.transform = 'rotate(' + (sprite.direction - 90) + 'deg)';
        }
    },

    // Update sprite size in DOM
    updateSpriteSize: function(name) {
        const sprite = this.sprites[name];
        const spriteDiv = document.getElementById('sprite-' + name);
        if (spriteDiv && sprite) {
            const scale = sprite.size / 100;
            spriteDiv.style.transform = 'rotate(' + (sprite.direction - 90) + 'deg) scale(' + scale + ')';
        }
    },

    // Show speech bubble
    showSpeechBubble: function(spriteName, message, seconds, isThought) {
        const sprite = this.sprites[spriteName];
        const stageDiv = document.getElementById('stage');
        if (!stageDiv || !sprite) return;

        // Remove existing bubble
        const existingBubble = document.getElementById('speech-' + spriteName);
        if (existingBubble) existingBubble.remove();

        // Create bubble
        const bubble = document.createElement('div');
        bubble.id = 'speech-' + spriteName;
        bubble.style.position = 'absolute';
        bubble.style.backgroundColor = 'white';
        bubble.style.border = '2px solid black';
        bubble.style.borderRadius = isThought ? '20px' : '10px';
        bubble.style.padding = '8px 12px';
        bubble.style.left = (sprite.x + this.stage.width/2 + 20) + 'px';
        bubble.style.bottom = (sprite.y + this.stage.height/2 + 30) + 'px';
        bubble.style.whiteSpace = 'nowrap';
        bubble.style.zIndex = '100';
        bubble.style.fontSize = '14px';
        bubble.textContent = message;
        stageDiv.appendChild(bubble);

        console.log(spriteName + ' says: ' + message);

        if (seconds) {
            setTimeout(function() { bubble.remove(); }, seconds * 1000);
        }
    },

    // Create DOM element for a sprite
    createSpriteElement: function(name) {
        const stageDiv = document.getElementById('stage');
        if (!stageDiv) return;
        
        // Don't create duplicate elements
        if (document.getElementById('sprite-' + name)) return;
        
        const sprite = this.sprites[name];
        if (!sprite) return;
        
        // Use different colors for different sprites
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da'];
        const colorIndex = Object.keys(this.sprites).indexOf(name) % colors.length;
        
        const spriteDiv = document.createElement('div');
        spriteDiv.id = 'sprite-' + name;
        spriteDiv.style.position = 'absolute';
        spriteDiv.style.width = '30px';
        spriteDiv.style.height = '30px';
        spriteDiv.style.backgroundColor = colors[colorIndex];
        spriteDiv.style.borderRadius = '50%';
        spriteDiv.style.left = (sprite.x + this.stage.width/2 - 15) + 'px';
        spriteDiv.style.bottom = (sprite.y + this.stage.height/2 - 15) + 'px';
        spriteDiv.style.transform = 'rotate(0deg)';
        spriteDiv.style.transition = 'left 0.05s, bottom 0.05s';
        spriteDiv.style.display = 'flex';
        spriteDiv.style.alignItems = 'center';
        spriteDiv.style.justifyContent = 'center';
        spriteDiv.style.fontSize = '10px';
        spriteDiv.style.fontWeight = 'bold';
        spriteDiv.style.color = 'white';
        spriteDiv.style.textShadow = '0 0 2px black';
        spriteDiv.textContent = name.charAt(0);
        stageDiv.appendChild(spriteDiv);
    },

    // Initialize the runtime
    init: function() {
        // Initialize default sprite
        this.initSprite('Sprite1');
        
        // Setup UI when DOM is ready
        const self = this;
        const setupUI = function() {
            const stageDiv = document.getElementById('stage');
            if (stageDiv) {
                // Use the actual rendered size of the stage (set by CSS flex)
                // Store for coordinate calculations
                const rect = stageDiv.getBoundingClientRect();
                self.stage.width = rect.width || 480;
                self.stage.height = rect.height || 360;
                
                stageDiv.style.backgroundColor = self.stage.backgroundColor;
                stageDiv.style.position = 'relative';
                stageDiv.style.overflow = 'hidden';

                // Create sprite elements for all initialized sprites
                Object.keys(self.sprites).forEach(function(name) {
                    self.createSpriteElement(name);
                });
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupUI);
        } else {
            setupUI();
        }

        // Register keyboard event handlers
        document.addEventListener('keydown', function(e) {
            const keyEvent = 'keyPressed_' + e.key;
            if (self.events[keyEvent] && Array.isArray(self.events[keyEvent])) {
                self.events[keyEvent].forEach(function(callback) { callback(); });
            }
        });
    },

    // Register green flag handler
    onGreenFlag: function(callback) {
        this.greenFlagHandlers.push(callback);
    },

    // Trigger green flag
    greenFlag: function() {
        const self = this;
        this.running = true;
        console.log('🚩 Green flag clicked!');
        this.greenFlagHandlers.forEach(function(handler) {
            try {
                handler();
            } catch (e) {
                console.error('Error in green flag handler:', e);
            }
        });
    },

    // Stop all scripts
    stopAll: function() {
        this.running = false;
        console.log('🛑 All scripts stopped');
    },

    // Broadcasting system
    broadcast: function(message) {
        console.log('📢 Broadcasting: ' + message);
        if (this.broadcasts[message] && Array.isArray(this.broadcasts[message])) {
            this.broadcasts[message].forEach(function(callback) { callback(); });
        }
    },

    // Register a broadcast receiver
    onBroadcast: function(message, callback) {
        if (!this.broadcasts[message]) {
            this.broadcasts[message] = [];
        }
        this.broadcasts[message].push(callback);
    },

    // Register an event handler
    onEvent: function(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },

    // Wait for seconds
    wait: function(seconds) {
        return new Promise(function(resolve) {
            setTimeout(resolve, seconds * 1000);
        });
    },

    // Ask a question and get an answer
    ask: async function(question) {
        const self = this;
        return new Promise(function(resolve) {
            const stageDiv = document.getElementById('stage');
            if (!stageDiv) { resolve(''); return; }

            const askDiv = document.createElement('div');
            askDiv.id = 'ask-prompt';
            askDiv.style.position = 'absolute';
            askDiv.style.bottom = '10px';
            askDiv.style.left = '10px';
            askDiv.style.right = '10px';
            askDiv.style.backgroundColor = 'white';
            askDiv.style.border = '2px solid black';
            askDiv.style.borderRadius = '8px';
            askDiv.style.padding = '10px';
            askDiv.style.zIndex = '200';

            const questionText = document.createElement('div');
            questionText.textContent = question;
            questionText.style.marginBottom = '8px';
            askDiv.appendChild(questionText);

            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.style.width = 'calc(100% - 70px)';
            inputField.style.padding = '5px';
            inputField.style.border = '1px solid #ccc';
            inputField.style.borderRadius = '4px';
            askDiv.appendChild(inputField);

            const submitButton = document.createElement('button');
            submitButton.textContent = '✓';
            submitButton.style.marginLeft = '5px';
            submitButton.style.padding = '5px 15px';
            submitButton.style.backgroundColor = '#4CAF50';
            submitButton.style.color = 'white';
            submitButton.style.border = 'none';
            submitButton.style.borderRadius = '4px';
            submitButton.style.cursor = 'pointer';
            askDiv.appendChild(submitButton);

            const submit = function() {
                self.answer = inputField.value;
                askDiv.remove();
                resolve(self.answer);
            };

            submitButton.onclick = submit;
            inputField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') submit();
            });

            stageDiv.appendChild(askDiv);
            inputField.focus();
        });
    }
};

// Initialize the runtime
scratchRuntime.init();
`;

// Legacy exports for backward compatibility  
export const RUNTIME_HEADER = SCRATCH_RUNTIME;
export const RUNTIME_INIT_START = '';
export const SPRITE_METHODS = '';
export const EVENT_HANDLERS = '';
export const BROADCAST_SYSTEM = '';
export const ASK_FUNCTION = '';
export const RUNTIME_FOOTER = '';

