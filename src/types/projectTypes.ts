// Project Types for Multi-Sprite Support
// Defines the structure for managing multiple sprites/files in a project

export type SpriteType = "sprite" | "backdrop";

export interface Costume {
    id: string;
    name: string;
    // For now, costumes are placeholders. In the future, these will be image URLs or data URLs
    data: string | null;      // Image data URL or null for placeholder
    rotationCenterX: number;  // Costume rotation center X
    rotationCenterY: number;  // Costume rotation center Y
}

export interface SpriteFile {
    id: string;
    name: string;             // Display name (e.g., "Sprite1", "Cat", "Stage")
    code: string;             // The scratch code for this sprite
    type: SpriteType;         // "sprite" or "backdrop"
    isStage: boolean;         // True only for the backdrop/stage
    costumes: Costume[];      // List of costumes (placeholder for now)
    currentCostume: number;   // Index of current costume
    sounds: string[];         // List of sound names (placeholder for now)
    x: number;                // Initial X position (sprites only)
    y: number;                // Initial Y position (sprites only)
    direction: number;        // Direction in degrees (sprites only, 90 = right)
    size: number;             // Size percentage (sprites only, 100 = normal)
    visible: boolean;         // Whether sprite is visible
    draggable: boolean;       // Whether sprite can be dragged in player mode
    rotationStyle: "all around" | "left-right" | "don't rotate";
    createdAt: number;        // Timestamp
    updatedAt: number;        // Timestamp
}

export interface ScratchProject {
    id: string;
    name: string;             // Project name
    version: string;          // Schema version for future migrations
    sprites: SpriteFile[];    // All sprites in the project (first is always backdrop)
    activeSprite: string;     // ID of currently active sprite
    createdAt: number;
    updatedAt: number;
}

// Backdrop constant ID
export const BACKDROP_ID = "backdrop_stage";
export const BACKDROP_NAME = "Stage";

// Default initial code for new sprites - an engaging demo that moves and talks
export const DEFAULT_SPRITE_CODE = `// Welcome to Scratch Compiler! 🐱
// Click the green "Run" button to see this code in action

when flagClicked
    say "Hello! I'm going to dance!"
    wait 1
    
    // Do a fun dance pattern
    repeat 4
        move 50
        turn right 90
        wait 0.3
    
    say "Now watch me spin!"
    wait 1
    
    // Spin around
    repeat 12
        turn right 30
        wait 0.1
    
    say "Try editing this code!"
    wait 2
    say ""

// You can also use keyboard controls!
when keyPressed space
    say "You pressed space!" for 1 seconds

when keyPressed up
    move 20

when keyPressed down
    move -20

when keyPressed left
    turn left 15

when keyPressed right
    turn right 15
`;

// Default initial code for backdrop/stage
export const DEFAULT_BACKDROP_CODE = `// Stage scripts go here
when flagClicked
    // Stage initialization
`;

// Create a placeholder costume
export function createCostume(name: string): Costume {
    return {
        id: `costume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        data: null, // Placeholder - will be image data in the future
        rotationCenterX: 0,
        rotationCenterY: 0,
    };
}

// Create a new sprite with default values
export function createSprite(name: string, type: SpriteType = "sprite"): SpriteFile {
    const now = Date.now();
    const isStage = type === "backdrop";
    return {
        id: isStage ? BACKDROP_ID : `sprite_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name: isStage ? BACKDROP_NAME : name,
        code: isStage ? DEFAULT_BACKDROP_CODE : DEFAULT_SPRITE_CODE,
        type,
        isStage,
        costumes: [createCostume(isStage ? "backdrop1" : "costume1")],
        currentCostume: 0,
        sounds: [],
        x: 0,
        y: 0,
        direction: 90,
        size: 100,
        visible: true,
        draggable: false,
        rotationStyle: "all around",
        createdAt: now,
        updatedAt: now,
    };
}

// Create a new empty project with backdrop
export function createProject(name: string = "My Project"): ScratchProject {
    const now = Date.now();
    const backdrop = createSprite("Stage", "backdrop");
    const defaultSprite = createSprite("Sprite1", "sprite");
    return {
        id: `project_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        version: "1.1.0", // Updated version for new schema
        sprites: [backdrop, defaultSprite], // Backdrop is always first
        activeSprite: defaultSprite.id,     // Start with sprite selected
        createdAt: now,
        updatedAt: now,
    };
}

// Check if a sprite can be deleted (backdrop cannot be deleted)
export function canDeleteSprite(sprite: SpriteFile): boolean {
    return !sprite.isStage && sprite.type !== "backdrop";
}

// Storage key for localStorage
export const PROJECT_STORAGE_KEY = "scratchProject";

// Legacy storage key (for migration)
export const LEGACY_CODE_KEY = "scratchCode";
