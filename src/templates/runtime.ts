// Scratch Runtime Template
// This template contains the base runtime code that is generated for all Scratch programs

export const SCRATCH_RUNTIME = `// Generated Scratch-like JavaScript code
// Runtime support functions
// Use window.scratchRuntime to make it globally accessible (needed for message handlers outside try block)
window.scratchRuntime = {
    sprites: {},
    stage: { 
        width: 480, 
        height: 360, 
        backgroundColor: 'white',
        currentBackdrop: 0,
        backdrops: ['backdrop1'], // Placeholder for costume names
        volume: 100
    },
    currentSprite: 'Sprite1',
    variables: {},
    initialVariables: {},  // Store initial variable values for reset
    variableDisplays: {},  // Track variable display elements and their positions
    lists: {},
    initialLists: {},  // Store initial list values for reset
    procedures: {},
    events: {},
    greenFlagHandlers: [],
    onStopAllCallback: null,  // Callback for when stopAll is called from code
    answer: '',
    broadcasts: {},
    running: false,
    clones: [],
    timer: Date.now(),
    mouse: { x: 0, y: 0, down: false },
    pressedKeys: {},
    dragMode: 'not draggable',
    activeSounds: [],  // Track currently playing audio elements
    
    // Script tracking for auto-stop feature
    activeScripts: 0,           // Number of currently running scripts
    activeForeverLoops: 0,      // Number of currently running forever loops
    hasInteractiveHandlers: false,  // True if there are key/click/broadcast handlers
    autoStopEnabled: true,      // Whether to auto-stop when all scripts finish

    // Initialize a sprite with full Scratch capabilities
    initSprite: function(name, options) {
        options = options || {};
        const self = this;
        this.sprites[name] = {
            name: name,
            x: options.x || 0,
            y: options.y || 0,
            direction: options.direction || 90,
            visible: options.visible !== false,
            size: options.size || 100,
            rotationStyle: options.rotationStyle || 'all around',
            draggable: options.draggable || false,
            costumes: options.costumes || ['costume1'],
            costumeUrls: options.costumeUrls || [],
            currentCostume: options.currentCostume || 0,
            sounds: options.sounds || [],
            soundUrls: options.soundUrls || [],
            effects: {
                color: 0,
                fisheye: 0,
                whirl: 0,
                pixelate: 0,
                mosaic: 0,
                brightness: 0,
                ghost: 0
            },
            isClone: options.isClone || false,
            cloneOf: options.cloneOf || null,
            layer: Object.keys(self.sprites).length,
            
            // Motion methods
            move: function(steps) {
                const radians = (this.direction - 90) * Math.PI / 180;
                this.x += steps * Math.cos(radians);
                this.y -= steps * Math.sin(radians);
                self.updateSpritePosition(name);
            },
            turnRight: function(degrees) {
                this.direction = (this.direction + degrees) % 360;
                if (this.direction < 0) this.direction += 360;
                self.updateSpriteTransform(name);
            },
            turnLeft: function(degrees) {
                this.direction = (this.direction - degrees + 360) % 360;
                self.updateSpriteTransform(name);
            },
            pointInDirection: function(dir) {
                this.direction = dir % 360;
                if (this.direction < 0) this.direction += 360;
                self.updateSpriteTransform(name);
            },
            pointTowards: function(target) {
                let targetX, targetY;
                if (target === 'mouse-pointer') {
                    targetX = self.mouse.x;
                    targetY = self.mouse.y;
                } else if (self.sprites[target]) {
                    targetX = self.sprites[target].x;
                    targetY = self.sprites[target].y;
                } else {
                    return;
                }
                const dx = targetX - this.x;
                const dy = targetY - this.y;
                this.direction = (Math.atan2(dx, dy) * 180 / Math.PI + 90) % 360;
                if (this.direction < 0) this.direction += 360;
                self.updateSpriteTransform(name);
            },
            goTo: function(x, y) {
                this.x = x;
                this.y = y;
                self.updateSpritePosition(name);
            },
            goToTarget: function(target) {
                if (target === 'mouse-pointer') {
                    this.x = self.mouse.x;
                    this.y = self.mouse.y;
                } else if (target === 'random') {
                    this.x = Math.floor(Math.random() * self.stage.width) - (self.stage.width / 2);
                    this.y = Math.floor(Math.random() * self.stage.height) - (self.stage.height / 2);
                } else if (self.sprites[target]) {
                    this.x = self.sprites[target].x;
                    this.y = self.sprites[target].y;
                }
                self.updateSpritePosition(name);
            },
            setX: function(x) {
                this.x = x;
                self.updateSpritePosition(name);
            },
            setY: function(y) {
                this.y = y;
                self.updateSpritePosition(name);
            },
            changeX: function(dx) {
                this.x += dx;
                self.updateSpritePosition(name);
            },
            changeY: function(dy) {
                this.y += dy;
                self.updateSpritePosition(name);
            },
            ifOnEdgeBounce: function() {
                const halfWidth = 15 * (this.size / 100);
                const halfHeight = 15 * (this.size / 100);
                const stageHalfWidth = self.stage.width / 2;
                const stageHalfHeight = self.stage.height / 2;
                const epsilon = 0.5; // Small buffer to prevent re-triggering
                
                let bounced = false;
                
                // Check left/right edges (vertical walls) - flip X component: direction = -direction
                if (this.x + halfWidth > stageHalfWidth) {
                    this.x = stageHalfWidth - halfWidth - epsilon;
                    this.direction = -this.direction;
                    bounced = true;
                } else if (this.x - halfWidth < -stageHalfWidth) {
                    this.x = -stageHalfWidth + halfWidth + epsilon;
                    this.direction = -this.direction;
                    bounced = true;
                }
                
                // Check top/bottom edges (horizontal walls) - flip Y component: direction = 180 - direction
                if (this.y + halfHeight > stageHalfHeight) {
                    this.y = stageHalfHeight - halfHeight - epsilon;
                    this.direction = 180 - this.direction;
                    bounced = true;
                } else if (this.y - halfHeight < -stageHalfHeight) {
                    this.y = -stageHalfHeight + halfHeight + epsilon;
                    this.direction = 180 - this.direction;
                    bounced = true;
                }
                
                if (bounced) {
                    this.direction = ((this.direction % 360) + 360) % 360;
                    self.updateSpritePosition(name);
                    self.updateSpriteTransform(name);
                }
            },
            setRotationStyle: function(style) {
                this.rotationStyle = style;
                self.updateSpriteTransform(name);
            },
            
            // Looks methods
            say: function(message, seconds) {
                self.showSpeechBubble(name, message, seconds, false);
            },
            think: function(message, seconds) {
                self.showSpeechBubble(name, message, seconds, true);
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
                this.size = Math.max(1, size);
                self.updateSpriteTransform(name);
            },
            changeSize: function(change) {
                this.size = Math.max(1, this.size + change);
                self.updateSpriteTransform(name);
            },
            setEffect: function(effect, value) {
                if (this.effects.hasOwnProperty(effect)) {
                    this.effects[effect] = value;
                    self.updateSpriteEffects(name);
                }
            },
            changeEffect: function(effect, change) {
                if (this.effects.hasOwnProperty(effect)) {
                    this.effects[effect] += change;
                    self.updateSpriteEffects(name);
                }
            },
            clearEffects: function() {
                for (let key in this.effects) {
                    this.effects[key] = 0;
                }
                self.updateSpriteEffects(name);
            },
            switchCostume: function(costume) {
                if (typeof costume === 'number') {
                    this.currentCostume = ((costume - 1) % this.costumes.length + this.costumes.length) % this.costumes.length;
                } else {
                    const idx = this.costumes.indexOf(costume);
                    if (idx >= 0) this.currentCostume = idx;
                }
                console.log(name + ' switched to costume: ' + this.costumes[this.currentCostume]);
                self.updateSpriteCostume(name);
            },
            nextCostume: function() {
                this.currentCostume = (this.currentCostume + 1) % this.costumes.length;
                console.log(name + ' switched to costume: ' + this.costumes[this.currentCostume]);
                self.updateSpriteCostume(name);
            },
            goToFrontLayer: function() {
                const maxLayer = Object.keys(self.sprites).length;
                this.layer = maxLayer;
                self.updateSpriteLayers();
            },
            goToBackLayer: function() {
                this.layer = 0;
                self.updateSpriteLayers();
            },
            goForwardLayers: function(n) {
                this.layer += n;
                self.updateSpriteLayers();
            },
            goBackwardLayers: function(n) {
                this.layer = Math.max(0, this.layer - n);
                self.updateSpriteLayers();
            },
            
            // Sensing helpers
            isTouching: function(target) {
                if (target === 'edge') {
                    const halfWidth = 15 * (this.size / 100);
                    const halfHeight = 15 * (this.size / 100);
                    return Math.abs(this.x) + halfWidth >= self.stage.width / 2 ||
                           Math.abs(this.y) + halfHeight >= self.stage.height / 2;
                }
                if (target === 'mouse-pointer') {
                    const dx = self.mouse.x - this.x;
                    const dy = self.mouse.y - this.y;
                    return Math.sqrt(dx*dx + dy*dy) < 30 * (this.size / 100);
                }
                if (self.sprites[target]) {
                    const other = self.sprites[target];
                    const dx = other.x - this.x;
                    const dy = other.y - this.y;
                    const dist = 30 * (this.size / 100) + 30 * (other.size / 100);
                    return Math.sqrt(dx*dx + dy*dy) < dist;
                }
                return false;
            },
            distanceTo: function(target) {
                let targetX, targetY;
                if (target === 'mouse-pointer') {
                    targetX = self.mouse.x;
                    targetY = self.mouse.y;
                } else if (self.sprites[target]) {
                    targetX = self.sprites[target].x;
                    targetY = self.sprites[target].y;
                } else {
                    return 0;
                }
                const dx = targetX - this.x;
                const dy = targetY - this.y;
                return Math.sqrt(dx*dx + dy*dy);
            }
        };
        
        // Create visual element if stage is ready
        this.createSpriteElement(name);
    },

    // Update sprite position in DOM
    updateSpritePosition: function(name) {
        const sprite = this.sprites[name];
        const spriteDiv = document.getElementById('sprite-' + name);
        if (spriteDiv && sprite) {
            // Get actual dimensions (for costume images)
            const width = spriteDiv.offsetWidth || 30;
            const height = spriteDiv.offsetHeight || 30;
            spriteDiv.style.left = (sprite.x + this.stage.width/2 - width/2) + 'px';
            spriteDiv.style.bottom = (sprite.y + this.stage.height/2 - height/2) + 'px';
        }
        // Also update speech bubble position if it exists
        const bubble = document.getElementById('speech-' + name);
        if (bubble && sprite) {
            bubble.style.left = (sprite.x + this.stage.width/2 + 20) + 'px';
            bubble.style.bottom = (sprite.y + this.stage.height/2 + 30) + 'px';
        }
    },

    // Update sprite costume
    updateSpriteCostume: function(name) {
        const sprite = this.sprites[name];
        const spriteDiv = document.getElementById('sprite-' + name);
        if (!spriteDiv || !sprite) return;
        
        const hasImage = sprite.costumeUrls && sprite.costumeUrls.length > 0 && sprite.costumeUrls[sprite.currentCostume];
        
        if (hasImage) {
            // Update existing image or create new one
            let img = spriteDiv.querySelector('.sprite-costume');
            if (!img) {
                // Create image if it doesn't exist (sprite was using fallback)
                img = document.createElement('img');
                img.className = 'sprite-costume';
                img.style.pointerEvents = 'none';
                img.style.userSelect = 'none';
                img.draggable = false;
                spriteDiv.innerHTML = '';  // Clear fallback content
                spriteDiv.style.backgroundColor = 'transparent';
                spriteDiv.style.borderRadius = '0';
                spriteDiv.appendChild(img);
            }
            
            const self = this;
            img.onload = function() {
                const width = img.naturalWidth * (sprite.size / 100);
                const height = img.naturalHeight * (sprite.size / 100);
                spriteDiv.style.width = width + 'px';
                spriteDiv.style.height = height + 'px';
                img.style.width = width + 'px';
                img.style.height = height + 'px';
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                self.updateSpritePosition(name);
            };
            img.src = sprite.costumeUrls[sprite.currentCostume];
        }
    },

    // Update sprite transform (rotation and size)
    updateSpriteTransform: function(name) {
        const sprite = this.sprites[name];
        const spriteDiv = document.getElementById('sprite-' + name);
        if (spriteDiv && sprite) {
            const scale = sprite.size / 100;
            let rotation = sprite.direction - 90;
            
            if (sprite.rotationStyle === "don't rotate") {
                rotation = 0;
            } else if (sprite.rotationStyle === 'left-right') {
                rotation = 0;
                if (sprite.direction > 180) {
                    spriteDiv.style.transform = 'scaleX(-1) scale(' + scale + ')';
                    return;
                }
            }
            
            spriteDiv.style.transform = 'rotate(' + rotation + 'deg) scale(' + scale + ')';
        }
    },

    // Update sprite effects (color, ghost, etc.)
    updateSpriteEffects: function(name) {
        const sprite = this.sprites[name];
        const spriteDiv = document.getElementById('sprite-' + name);
        if (spriteDiv && sprite) {
            const effects = sprite.effects;
            let filter = '';
            
            if (effects.brightness !== 0) {
                filter += 'brightness(' + (100 + effects.brightness) + '%) ';
            }
            if (effects.ghost !== 0) {
                spriteDiv.style.opacity = (100 - Math.min(100, Math.max(0, effects.ghost))) / 100;
            }
            if (effects.color !== 0) {
                filter += 'hue-rotate(' + (effects.color * 3.6) + 'deg) ';
            }
            if (effects.fisheye !== 0) {
                // Fisheye approximation
                const scale = 1 + effects.fisheye / 100;
                filter += 'scale(' + scale + ') ';
            }
            if (effects.whirl !== 0) {
                filter += 'rotate(' + effects.whirl + 'deg) ';
            }
            if (effects.pixelate !== 0) {
                // Pixelate is hard in CSS, we approximate with blur
                filter += 'blur(' + Math.max(0, effects.pixelate / 10) + 'px) ';
            }
            
            spriteDiv.style.filter = filter.trim() || 'none';
        }
    },

    // Update sprite layer ordering
    updateSpriteLayers: function() {
        const sortedSprites = Object.values(this.sprites).sort(function(a, b) {
            return a.layer - b.layer;
        });
        sortedSprites.forEach(function(sprite, index) {
            const spriteDiv = document.getElementById('sprite-' + sprite.name);
            if (spriteDiv) {
                spriteDiv.style.zIndex = index + 1;
            }
        });
    },

    // Show speech bubble
    showSpeechBubble: function(spriteName, message, seconds, isThought) {
        const sprite = this.sprites[spriteName];
        const stageContent = document.getElementById('stage-content');
        if (!stageContent || !sprite) return;

        // Remove existing bubble
        const existingBubble = document.getElementById('speech-' + spriteName);
        if (existingBubble) existingBubble.remove();

        if (message === '' || message === null || message === undefined) return;

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
        bubble.textContent = isThought ? '💭 ' + message : message;
        stageContent.appendChild(bubble);

        console.log(spriteName + (isThought ? ' thinks: ' : ' says: ') + message);

        if (seconds) {
            setTimeout(function() { bubble.remove(); }, seconds * 1000);
        }
    },

    // Create DOM element for a sprite
    createSpriteElement: function(name) {
        const stageContent = document.getElementById('stage-content');
        if (!stageContent) return;
        
        // Don't create duplicate elements
        if (document.getElementById('sprite-' + name)) return;
        
        const sprite = this.sprites[name];
        if (!sprite) return;
        
        // Use different colors for different sprites (fallback when no costume image)
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8d8ea'];
        const colorIndex = Object.keys(this.sprites).indexOf(name) % colors.length;
        
        const spriteDiv = document.createElement('div');
        spriteDiv.id = 'sprite-' + name;
        spriteDiv.style.position = 'absolute';
        spriteDiv.style.display = sprite.visible ? 'flex' : 'none';
        spriteDiv.style.alignItems = 'center';
        spriteDiv.style.justifyContent = 'center';
        spriteDiv.style.cursor = 'grab';  // Always show grab cursor (draggable when not running)
        spriteDiv.style.zIndex = sprite.layer || 1;
        spriteDiv.style.transformOrigin = 'center center';
        
        // Check if sprite has costume images
        const hasImage = sprite.costumeUrls && sprite.costumeUrls.length > 0 && sprite.costumeUrls[sprite.currentCostume];
        
        if (hasImage) {
            // Create image element for costume
            const img = document.createElement('img');
            img.className = 'sprite-costume';
            img.src = sprite.costumeUrls[sprite.currentCostume];
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.pointerEvents = 'none';
            img.style.userSelect = 'none';
            img.draggable = false;
            spriteDiv.appendChild(img);
            
            // Wait for image to load to get dimensions
            img.onload = () => {
                const width = img.naturalWidth * (sprite.size / 100);
                const height = img.naturalHeight * (sprite.size / 100);
                spriteDiv.style.width = width + 'px';
                spriteDiv.style.height = height + 'px';
                img.style.width = width + 'px';
                img.style.height = height + 'px';
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                // Update position based on actual size
                spriteDiv.style.left = (sprite.x + this.stage.width/2 - width/2) + 'px';
                spriteDiv.style.bottom = (sprite.y + this.stage.height/2 - height/2) + 'px';
            };
            
            // Initial position (will be updated when image loads)
            spriteDiv.style.left = (sprite.x + this.stage.width/2 - 50) + 'px';
            spriteDiv.style.bottom = (sprite.y + this.stage.height/2 - 50) + 'px';
        } else {
            // Fallback: colored circle with letter
            spriteDiv.style.width = '30px';
            spriteDiv.style.height = '30px';
            spriteDiv.style.backgroundColor = colors[colorIndex];
            spriteDiv.style.borderRadius = '50%';
            spriteDiv.style.left = (sprite.x + this.stage.width/2 - 15) + 'px';
            spriteDiv.style.bottom = (sprite.y + this.stage.height/2 - 15) + 'px';
            spriteDiv.style.fontSize = '10px';
            spriteDiv.style.fontWeight = 'bold';
            spriteDiv.style.color = 'white';
            spriteDiv.style.textShadow = '0 0 2px black';
            spriteDiv.textContent = name.charAt(0);
        }
        
        spriteDiv.style.transform = 'rotate(0deg)';
        spriteDiv.style.transition = 'left 0.05s, bottom 0.05s';
        
        // Make draggable - when not running, all sprites can be dragged
        // When running, only sprites with draggable=true can be dragged
        const self = this;
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        
        spriteDiv.addEventListener('mousedown', function(e) {
            // Allow dragging if: not running, OR (running AND sprite.draggable is true)
            const canDrag = !self.running || sprite.draggable || self.dragMode === 'draggable';
            if (canDrag) {
                isDragging = true;
                dragOffsetX = e.clientX - spriteDiv.getBoundingClientRect().left - 15;
                dragOffsetY = e.clientY - spriteDiv.getBoundingClientRect().top - 15;
                spriteDiv.style.cursor = 'grabbing';
                e.stopPropagation(); // Prevent stage click event
            }
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const stageDiv = document.getElementById('stage');
                const rect = stageDiv.getBoundingClientRect();
                // Account for scaling when converting mouse to sprite coordinates
                const scale = stageDiv.clientWidth / 480;
                sprite.x = ((e.clientX - rect.left) / scale - self.stage.width/2) - dragOffsetX;
                sprite.y = (self.stage.height/2 - (e.clientY - rect.top) / scale) + dragOffsetY;
                self.updateSpritePosition(name);
            }
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                spriteDiv.style.cursor = 'grab';
                // Log position after drag (only when not running, as that's when user is positioning)
                if (!self.running) {
                    console.log('📍 ' + name + ' moved to x: ' + Math.round(sprite.x) + ', y: ' + Math.round(sprite.y));
                }
            }
        });
        
        stageContent.appendChild(spriteDiv);
    },

    // Clone management
    createClone: function(spriteName) {
        const original = this.sprites[spriteName];
        if (!original) return null;
        
        const cloneId = spriteName + '_clone_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        this.initSprite(cloneId, {
            x: original.x,
            y: original.y,
            direction: original.direction,
            visible: original.visible,
            size: original.size,
            rotationStyle: original.rotationStyle,
            costumes: original.costumes.slice(),
            costumeUrls: original.costumeUrls ? original.costumeUrls.slice() : [],
            currentCostume: original.currentCostume,
            isClone: true,
            cloneOf: spriteName
        });
        
        this.clones.push(cloneId);
        
        // Trigger clone start event
        if (this.events['cloneStart_' + spriteName]) {
            const self = this;
            this.events['cloneStart_' + spriteName].forEach(function(callback) {
                self.currentSprite = cloneId;
                self.trackScript(callback)();
            });
        }
        
        return cloneId;
    },
    
    deleteClone: function(cloneName) {
        const sprite = this.sprites[cloneName];
        if (!sprite || !sprite.isClone) return;
        
        // Remove visual element
        const spriteDiv = document.getElementById('sprite-' + cloneName);
        if (spriteDiv) spriteDiv.remove();
        
        // Remove speech bubble
        const bubble = document.getElementById('speech-' + cloneName);
        if (bubble) bubble.remove();
        
        // Remove from tracking
        delete this.sprites[cloneName];
        const idx = this.clones.indexOf(cloneName);
        if (idx >= 0) this.clones.splice(idx, 1);
    },

    // Stage/Backdrop methods
    switchBackdrop: function(backdrop) {
        if (typeof backdrop === 'number') {
            this.stage.currentBackdrop = ((backdrop - 1) % this.stage.backdrops.length + this.stage.backdrops.length) % this.stage.backdrops.length;
        } else {
            const idx = this.stage.backdrops.indexOf(backdrop);
            if (idx >= 0) this.stage.currentBackdrop = idx;
        }
        const backdropName = this.stage.backdrops[this.stage.currentBackdrop];
        console.log('Switched to backdrop: ' + backdropName);
        
        // Trigger backdrop change event
        if (this.events['backdropSwitch_' + backdropName]) {
            this.events['backdropSwitch_' + backdropName].forEach(function(callback) { callback(); });
        }
    },
    
    nextBackdrop: function() {
        this.stage.currentBackdrop = (this.stage.currentBackdrop + 1) % this.stage.backdrops.length;
        console.log('Switched to backdrop: ' + this.stage.backdrops[this.stage.currentBackdrop]);
    },

    // Initialize the runtime
    init: function() {
        const self = this;
        
        // Stage is always logical 480x360 (scaling is handled by CSS)
        self.stage.width = 480;
        self.stage.height = 360;
        
        // Setup UI when DOM is ready
        const setupUI = function() {
            const stageDiv = document.getElementById('stage');
            const stageContent = document.getElementById('stage-content');
            if (stageDiv && stageContent) {
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

        // Track mouse position (accounting for stage scaling)
        document.addEventListener('mousemove', function(e) {
            const stageDiv = document.getElementById('stage');
            if (stageDiv) {
                const rect = stageDiv.getBoundingClientRect();
                // Calculate scale factor (CSS scales the 480x360 content)
                const scale = stageDiv.clientWidth / 480;
                // Convert screen coordinates to logical Scratch coordinates
                self.mouse.x = (e.clientX - rect.left) / scale - 240;
                self.mouse.y = 180 - (e.clientY - rect.top) / scale;
            }
        });
        
        document.addEventListener('mousedown', function() { self.mouse.down = true; });
        document.addEventListener('mouseup', function() { self.mouse.down = false; });

        // Register keyboard event handlers
        document.addEventListener('keydown', function(e) {
            self.pressedKeys[e.key.toLowerCase()] = true;
            const keyEvent = 'keyPressed_' + e.key.toLowerCase();
            if (self.running && self.events[keyEvent] && Array.isArray(self.events[keyEvent])) {
                self.events[keyEvent].forEach(function(callback) { 
                    self.trackScript(callback)(); 
                });
            }
        });
        
        document.addEventListener('keyup', function(e) {
            delete self.pressedKeys[e.key.toLowerCase()];
        });
        
        // Click on sprite events
        document.addEventListener('click', function(e) {
            const target = e.target;
            if (target && target.id && target.id.startsWith('sprite-')) {
                const spriteName = target.id.replace('sprite-', '');
                if (self.running && self.events['spriteClicked_' + spriteName]) {
                    self.events['spriteClicked_' + spriteName].forEach(function(callback) { 
                        self.trackScript(callback)(); 
                    });
                }
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
        this.timer = Date.now();
        
        // Reset variables to initial values
        for (const varName in this.initialVariables) {
            this.variables[varName] = this.initialVariables[varName];
            this.updateVariableDisplay(varName);
        }
        
        // Reset lists to initial values (deep copy)
        for (const listName in this.initialLists) {
            this.lists[listName] = this.initialLists[listName].slice();
        }
        
        // Delete all existing clones
        this.clones.slice().forEach(function(clone) {
            self.deleteClone(clone);
        });
        
        // Reset sprite positions and properties to initial state
        for (const spriteName in this.sprites) {
            const sprite = this.sprites[spriteName];
            if (sprite.isClone) continue;  // Skip clones (they were deleted above)
            if (sprite.initialState) {
                sprite.x = sprite.initialState.x;
                sprite.y = sprite.initialState.y;
                sprite.direction = sprite.initialState.direction;
                sprite.visible = sprite.initialState.visible;
                sprite.size = sprite.initialState.size;
                sprite.currentCostume = sprite.initialState.currentCostume;
                // Reset effects
                for (const effect in sprite.effects) {
                    sprite.effects[effect] = 0;
                }
                self.updateSpritePosition(spriteName);
                self.updateSpriteTransform(spriteName);
                self.updateSpriteEffects(spriteName);
                self.updateSpriteCostume(spriteName);
                // Show sprite if it was visible initially
                const spriteDiv = document.getElementById('sprite-' + spriteName);
                if (spriteDiv) {
                    spriteDiv.style.display = sprite.visible ? 'flex' : 'none';
                }
            }
        }
        
        // Remove all speech bubbles
        document.querySelectorAll('[id^="speech-"]').forEach(function(el) {
            el.remove();
        });
        
        // Reset script tracking
        this.activeScripts = 0;
        this.activeForeverLoops = 0;
        
        console.log('🚩 Green flag clicked!');
        this.greenFlagHandlers.forEach(function(handler) {
            try {
                // Wrap handler in tracking
                self.trackScript(handler)();
            } catch (e) {
                console.error('Error in green flag handler:', e);
            }
        });
    },

    // Stop all scripts
    stopAll: function() {
        this.running = false;
        this.activeScripts = 0;  // Reset active scripts count
        this.activeForeverLoops = 0;  // Reset forever loops count
        // Delete all clones
        const self = this;
        this.clones.slice().forEach(function(clone) {
            self.deleteClone(clone);
        });
        console.log('🛑 All scripts stopped');
        // Notify UI to update button states
        if (this.onStopAllCallback) {
            this.onStopAllCallback();
        }
    },

    // Timer functions
    getTimer: function() {
        return (Date.now() - this.timer) / 1000;
    },
    
    resetTimer: function() {
        this.timer = Date.now();
    },

    // Keyboard sensing
    isKeyPressed: function(key) {
        if (key === 'any') {
            return Object.keys(this.pressedKeys).length > 0;
        }
        return !!this.pressedKeys[key.toLowerCase()];
    },

    // Broadcasting system
    broadcast: function(message) {
        const self = this;
        console.log('📢 Broadcasting: ' + message);
        if (this.broadcasts[message] && Array.isArray(this.broadcasts[message])) {
            this.broadcasts[message].forEach(function(callback) { 
                self.trackScript(callback)(); 
            });
        }
    },
    
    broadcastAndWait: async function(message) {
        const self = this;
        console.log('📢 Broadcasting and waiting: ' + message);
        if (this.broadcasts[message] && Array.isArray(this.broadcasts[message])) {
            const promises = this.broadcasts[message].map(function(callback) {
                return Promise.resolve(self.trackScript(callback)());
            });
            await Promise.all(promises);
        }
    },

    // Register a broadcast receiver
    onBroadcast: function(message, callback) {
        if (!this.broadcasts[message]) {
            this.broadcasts[message] = [];
        }
        this.broadcasts[message].push(callback);
        // Broadcasts can be triggered at any time, so they're interactive
        this.hasInteractiveHandlers = true;
    },

    // Register an event handler
    onEvent: function(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Check if this is an interactive event handler that should keep the program alive
        // Interactive events: key presses, sprite clicks, clone start (clones can be created anytime)
        if (event.startsWith('keyPressed_') || 
            event.startsWith('spriteClicked_') || 
            event.startsWith('cloneStart_')) {
            this.hasInteractiveHandlers = true;
        }
    },
    
    // Script tracking - wrap a script function to track when it starts/finishes
    trackScript: function(scriptFn) {
        const self = this;
        return async function() {
            self.activeScripts++;
            try {
                await scriptFn.apply(this, arguments);
            } catch (e) {
                // Script might be interrupted by stopAll, that's OK
                if (self.running) {
                    console.error('Script error:', e);
                }
            } finally {
                self.activeScripts--;
                self.checkAutoStop();
            }
        };
    },
    
    // Track forever loop start/end
    startForeverLoop: function() {
        this.activeForeverLoops++;
    },
    
    endForeverLoop: function() {
        this.activeForeverLoops--;
        this.checkAutoStop();
    },
    
    // Check if we should auto-stop (all scripts done, no forever loops, no interactive handlers)
    checkAutoStop: function() {
        if (this.autoStopEnabled && 
            this.running && 
            this.activeScripts === 0 && 
            this.activeForeverLoops === 0 &&
            !this.hasInteractiveHandlers) {
            console.log('✨ All scripts finished, auto-stopping');
            this.stopAll();
        }
    },

    // Variable display management
    nextVarDisplayY: 10,  // Track Y position for stacking variable displays
    
    createVariableDisplay: function(varName) {
        const self = this;
        const stageContent = document.getElementById('stage-content');
        if (!stageContent) return;
        
        // Don't create if already exists
        if (document.getElementById('var-' + varName)) return;
        
        const display = document.createElement('div');
        display.id = 'var-' + varName;
        display.className = 'scratch-variable-display';
        display.style.position = 'absolute';
        display.style.left = '10px';
        display.style.top = this.nextVarDisplayY + 'px';
        display.style.backgroundColor = 'rgba(255, 140, 0, 0.9)';
        display.style.color = 'white';
        display.style.padding = '4px 10px';
        display.style.borderRadius = '12px';
        display.style.fontSize = '12px';
        display.style.fontFamily = 'sans-serif';
        display.style.fontWeight = 'bold';
        display.style.cursor = 'grab';
        display.style.userSelect = 'none';
        display.style.zIndex = '500';
        display.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        display.style.minWidth = '60px';
        display.innerHTML = '<span class="var-name">' + varName + '</span>: <span class="var-value">' + (this.variables[varName] !== undefined ? this.variables[varName] : 0) + '</span>';
        
        // Store position info
        this.variableDisplays[varName] = { x: 10, y: this.nextVarDisplayY, visible: true };
        this.nextVarDisplayY += 28;  // Stack next variable below
        
        // Make draggable
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        
        display.addEventListener('mousedown', function(e) {
            isDragging = true;
            const rect = display.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            display.style.cursor = 'grabbing';
            e.stopPropagation();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const stageContentRect = stageContent.getBoundingClientRect();
                const scale = stageContent.parentElement.clientWidth / 480;
                const newX = (e.clientX - stageContentRect.left) / scale - dragOffsetX;
                const newY = (e.clientY - stageContentRect.top) / scale - dragOffsetY;
                display.style.left = newX + 'px';
                display.style.top = newY + 'px';
                self.variableDisplays[varName].x = newX;
                self.variableDisplays[varName].y = newY;
            }
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                display.style.cursor = 'grab';
            }
        });
        
        stageContent.appendChild(display);
    },
    
    updateVariableDisplay: function(varName) {
        const display = document.getElementById('var-' + varName);
        if (display) {
            const valueSpan = display.querySelector('.var-value');
            if (valueSpan) {
                valueSpan.textContent = this.variables[varName] !== undefined ? this.variables[varName] : 0;
            }
        }
    },
    
    showVariableDisplay: function(varName) {
        const display = document.getElementById('var-' + varName);
        if (display) {
            display.style.display = 'block';
            this.variableDisplays[varName].visible = true;
        } else {
            // Create if doesn't exist
            this.createVariableDisplay(varName);
        }
    },
    
    hideVariableDisplay: function(varName) {
        const display = document.getElementById('var-' + varName);
        if (display) {
            display.style.display = 'none';
            if (this.variableDisplays[varName]) {
                this.variableDisplays[varName].visible = false;
            }
        }
    },
    
    // Set variable with automatic display update
    setVariable: function(varName, value) {
        this.variables[varName] = value;
        this.updateVariableDisplay(varName);
    },
    
    // Change variable with automatic display update
    changeVariable: function(varName, delta) {
        this.variables[varName] = Number(this.variables[varName] || 0) + Number(delta);
        this.updateVariableDisplay(varName);
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
            const stageContent = document.getElementById('stage-content');
            if (!stageContent) { resolve(''); return; }

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

            stageContent.appendChild(askDiv);
            inputField.focus();
        });
    },
    
    // Utility functions for math operations
    pickRandom: function(from, to) {
        if (Number.isInteger(from) && Number.isInteger(to)) {
            return Math.floor(Math.random() * (to - from + 1)) + from;
        }
        return Math.random() * (to - from) + from;
    },
    
    // List operations
    addToList: function(listName, item) {
        if (!this.lists[listName]) this.lists[listName] = [];
        this.lists[listName].push(item);
    },
    
    deleteOfList: function(listName, index) {
        if (!this.lists[listName]) return;
        if (index === 'all') {
            this.lists[listName] = [];
        } else if (index === 'last') {
            this.lists[listName].pop();
        } else {
            const idx = parseInt(index) - 1;
            if (idx >= 0 && idx < this.lists[listName].length) {
                this.lists[listName].splice(idx, 1);
            }
        }
    },
    
    insertAtList: function(listName, index, item) {
        if (!this.lists[listName]) this.lists[listName] = [];
        const idx = index === 'last' ? this.lists[listName].length : parseInt(index) - 1;
        this.lists[listName].splice(idx, 0, item);
    },
    
    replaceItemOfList: function(listName, index, item) {
        if (!this.lists[listName]) return;
        const idx = index === 'last' ? this.lists[listName].length - 1 : parseInt(index) - 1;
        if (idx >= 0 && idx < this.lists[listName].length) {
            this.lists[listName][idx] = item;
        }
    },
    
    itemOfList: function(listName, index) {
        if (!this.lists[listName]) return '';
        const idx = index === 'last' ? this.lists[listName].length - 1 : parseInt(index) - 1;
        return (idx >= 0 && idx < this.lists[listName].length) ? this.lists[listName][idx] : '';
    },
    
    itemNumberInList: function(listName, item) {
        if (!this.lists[listName]) return 0;
        const idx = this.lists[listName].indexOf(item);
        return idx >= 0 ? idx + 1 : 0;
    },
    
    lengthOfList: function(listName) {
        return this.lists[listName] ? this.lists[listName].length : 0;
    },
    
    listContains: function(listName, item) {
        return this.lists[listName] ? this.lists[listName].includes(item) : false;
    },
    
    // Sound - find sound URL by name across all sprites
    findSoundUrl: function(soundName) {
        const lowerName = soundName.toLowerCase();
        // Check current sprite first
        const currentSprite = this.sprites[this.currentSprite];
        if (currentSprite && currentSprite.sounds) {
            const idx = currentSprite.sounds.findIndex(s => s.toLowerCase() === lowerName);
            if (idx !== -1 && currentSprite.soundUrls[idx]) {
                return currentSprite.soundUrls[idx];
            }
        }
        // Check all sprites
        for (const spriteName of Object.keys(this.sprites)) {
            const sprite = this.sprites[spriteName];
            if (sprite.sounds) {
                const idx = sprite.sounds.findIndex(s => s.toLowerCase() === lowerName);
                if (idx !== -1 && sprite.soundUrls[idx]) {
                    return sprite.soundUrls[idx];
                }
            }
        }
        return null;
    },
    
    playSound: function(soundName) {
        const url = this.findSoundUrl(soundName);
        if (url) {
            try {
                const audio = new Audio(url);
                audio.volume = this.stage.volume / 100;
                this.activeSounds.push(audio);
                audio.addEventListener('ended', () => {
                    const idx = this.activeSounds.indexOf(audio);
                    if (idx !== -1) this.activeSounds.splice(idx, 1);
                });
                audio.play().catch(err => console.warn('Could not play sound:', err));
                console.log('🔊 Playing sound: ' + soundName);
            } catch (err) {
                console.warn('Error playing sound:', err);
            }
        } else {
            console.log('🔊 Sound not found: ' + soundName);
        }
    },
    
    playSoundUntilDone: async function(soundName) {
        const url = this.findSoundUrl(soundName);
        if (url) {
            try {
                const audio = new Audio(url);
                audio.volume = this.stage.volume / 100;
                this.activeSounds.push(audio);
                
                return new Promise((resolve) => {
                    audio.addEventListener('ended', () => {
                        const idx = this.activeSounds.indexOf(audio);
                        if (idx !== -1) this.activeSounds.splice(idx, 1);
                        resolve();
                    });
                    audio.addEventListener('error', () => {
                        const idx = this.activeSounds.indexOf(audio);
                        if (idx !== -1) this.activeSounds.splice(idx, 1);
                        resolve();
                    });
                    audio.play().catch(err => {
                        console.warn('Could not play sound:', err);
                        resolve();
                    });
                    console.log('🔊 Playing sound until done: ' + soundName);
                });
            } catch (err) {
                console.warn('Error playing sound:', err);
            }
        } else {
            console.log('🔊 Sound not found: ' + soundName);
        }
    },
    
    stopAllSounds: function() {
        for (const audio of this.activeSounds) {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (e) {}
        }
        this.activeSounds = [];
        console.log('🔇 Stopping all sounds');
    },
    
    setVolume: function(volume) {
        this.stage.volume = Math.max(0, Math.min(100, volume));
        // Update volume for all playing sounds
        for (const audio of this.activeSounds) {
            audio.volume = this.stage.volume / 100;
        }
        console.log('🔊 Volume set to: ' + this.stage.volume + '%');
    },
    
    changeVolume: function(change) {
        this.stage.volume = Math.max(0, Math.min(100, this.stage.volume + change));
        // Update volume for all playing sounds
        for (const audio of this.activeSounds) {
            audio.volume = this.stage.volume / 100;
        }
        console.log('🔊 Volume changed to: ' + this.stage.volume + '%');
    },
    
    // Username (placeholder)
    getUsername: function() {
        return 'ScratchUser';
    }
};

// Create local alias for convenience (all generated code uses scratchRuntime)
const scratchRuntime = window.scratchRuntime;

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

