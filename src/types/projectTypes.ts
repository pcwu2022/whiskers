// Project Types for Multi-Sprite Support
// Defines the structure for managing multiple sprites/files in a project

export type SpriteType = "sprite" | "backdrop";

export interface Costume {
    id: string;
    name: string;             // Display name (file name without extension)
    data: string | null;      // Base64 data URL for image, null for default
    mimeType: string;         // Image MIME type (e.g., "image/png")
    width: number;            // Image width in pixels
    height: number;           // Image height in pixels
    rotationCenterX: number;  // Costume rotation center X
    rotationCenterY: number;  // Costume rotation center Y
}

export interface Sound {
    id: string;
    name: string;             // Display name (file name without extension)
    data: string | null;      // Base64 data URL for audio
    mimeType: string;         // Audio MIME type (e.g., "audio/mp3")
    duration: number;         // Duration in seconds
}

export interface SpriteFile {
    id: string;
    name: string;             // Display name (e.g., "Sprite1", "Cat", "Stage")
    code: string;             // The scratch code for this sprite
    type: SpriteType;         // "sprite" or "backdrop"
    isStage: boolean;         // True only for the backdrop/stage
    costumes: Costume[];      // List of costumes
    currentCostume: number;   // Index of current costume
    sounds: Sound[];          // List of sounds
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

// Default initial code for new sprites
export const DEFAULT_SPRITE_CODE = `// Welcome to Whiskers Playground! 🐱

when green flag clicked
    // 👇 Drag blocks here 👇
end
`;

// Default initial code for backdrop/stage
export const DEFAULT_BACKDROP_CODE = `// Stage scripts go here
when green flag clicked
    // Stage initialization
`;

// Create a placeholder costume (uses default logo if no data provided)
export function createCostume(name: string, data: string | null = null, mimeType: string = "image/png"): Costume {
    return {
        id: `costume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        data,
        mimeType,
        width: data ? 0 : 100,  // Will be set when image loads
        height: data ? 0 : 100,
        rotationCenterX: 0,
        rotationCenterY: 0,
    };
}

// Create a sound entry
export function createSound(name: string, data: string | null = null, mimeType: string = "audio/mpeg"): Sound {
    return {
        id: `sound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        data,
        mimeType,
        duration: 0,  // Will be set when audio loads
    };
}

// Empty code for additional sprites
export const EMPTY_SPRITE_CODE = `// Add your code here
when green flag clicked
    // 👇 Drag blocks here 👇
end
`;

// Create a new sprite with default values
export function createSprite(name: string, type: SpriteType = "sprite", emptyCode: boolean = false): SpriteFile {
    const now = Date.now();
    const isStage = type === "backdrop";
    const spriteCode = isStage ? DEFAULT_BACKDROP_CODE : (emptyCode ? EMPTY_SPRITE_CODE : DEFAULT_SPRITE_CODE);
    return {
        id: isStage ? BACKDROP_ID : `sprite_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name: isStage ? BACKDROP_NAME : name,
        code: spriteCode,
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

// Get display name for a costume (without sprite prefix)
export function getCostumeDisplayName(fullName: string, spriteName: string): string {
    const prefix = `${spriteName}_`;
    if (fullName.startsWith(prefix)) {
        return fullName.slice(prefix.length);
    }
    return fullName;
}

// Get full storage name for a costume (with sprite prefix)
export function getCostumeStorageName(displayName: string, spriteName: string): string {
    return `${spriteName}_${displayName}`;
}

// Get display name for a sound (without sprite prefix)
export function getSoundDisplayName(fullName: string, spriteName: string): string {
    const prefix = `${spriteName}_`;
    if (fullName.startsWith(prefix)) {
        return fullName.slice(prefix.length);
    }
    return fullName;
}

// Get full storage name for a sound (with sprite prefix)
export function getSoundStorageName(displayName: string, spriteName: string): string {
    return `${spriteName}_${displayName}`;
}

// Default costume URL for sprites
export const DEFAULT_SPRITE_COSTUME_URL = "/costume1.png";

// Default costume URL for stage (blank background)
export const DEFAULT_STAGE_COSTUME_URL = "/stage.png";

// Storage key for localStorage
export const PROJECT_STORAGE_KEY = "scratchProject";

// Legacy storage key (for migration)
export const LEGACY_CODE_KEY = "scratchCode";
