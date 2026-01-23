// Pen Methods Template
// Adds pen drawing capabilities to sprites

export const PEN_METHODS = `
        // Pen methods for drawing
        penDown: function() {
            this.penIsDown = true;
            console.log(\`\${scratchRuntime.currentSprite} pen down\`);
            
            // Create canvas for pen if it doesn't exist
            if (!document.getElementById('pen-canvas')) {
                const stageDiv = document.getElementById('stage');
                const canvas = document.createElement('canvas');
                canvas.id = 'pen-canvas';
                canvas.width = scratchRuntime.stage.width;
                canvas.height = scratchRuntime.stage.height;
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.pointerEvents = 'none';
                stageDiv.appendChild(canvas);
                
                // Store last position
                this.lastPenX = this.x + scratchRuntime.stage.width/2;
                this.lastPenY = scratchRuntime.stage.height/2 - this.y;
            }
        },
        
        penUp: function() {
            this.penIsDown = false;
            console.log(\`\${scratchRuntime.currentSprite} pen up\`);
        },
        
        setPenColor: function(color) {
            this.penColor = color;
            console.log(\`\${scratchRuntime.currentSprite} pen color set to \${color}\`);
        },
        
        changePenSize: function(change) {
            if (!this.penSize) this.penSize = 1;
            this.penSize += Number(change);
            if (this.penSize < 1) this.penSize = 1;
            console.log(\`\${scratchRuntime.currentSprite} pen size changed to \${this.penSize}\`);
        },
        
        setPenSize: function(size) {
            this.penSize = Number(size);
            if (this.penSize < 1) this.penSize = 1;
            console.log(\`\${scratchRuntime.currentSprite} pen size set to \${this.penSize}\`);
        },
        
        clearPen: function() {
            const canvas = document.getElementById('pen-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            console.log('Cleared pen marks');
        },
        
        stamp: function() {
            const canvas = document.getElementById('pen-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
                if (spriteDiv) {
                    // This is a simplified stamp implementation
                    ctx.fillStyle = 'red'; // Use sprite color
                    ctx.beginPath();
                    ctx.arc(this.x + scratchRuntime.stage.width/2, 
                        scratchRuntime.stage.height/2 - this.y, 15, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
            console.log(\`\${scratchRuntime.currentSprite} stamped\`);
        },
        
        // Update pen drawing when sprite moves
        updatePenDrawing: function() {
            if (this.penIsDown) {
                const canvas = document.getElementById('pen-canvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    
                    // Initialize pen properties if not set
                    if (!this.penColor) this.penColor = '#000000';
                    if (!this.penSize) this.penSize = 1;
                    
                    // Set drawing styles
                    ctx.strokeStyle = this.penColor;
                    ctx.lineWidth = this.penSize;
                    ctx.lineCap = 'round';
                    
                    // Calculate current position
                    const currentX = this.x + scratchRuntime.stage.width/2;
                    const currentY = scratchRuntime.stage.height/2 - this.y;
                    
                    // If last position exists, draw line
                    if (typeof this.lastPenX === 'number' && typeof this.lastPenY === 'number') {
                        ctx.beginPath();
                        ctx.moveTo(this.lastPenX, this.lastPenY);
                        ctx.lineTo(currentX, currentY);
                        ctx.stroke();
                    }
                    
                    // Update last position
                    this.lastPenX = currentX;
                    this.lastPenY = currentY;
                }
            }
        },`;
