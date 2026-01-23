// Project Types for Multi-Sprite Support
// Defines the structure for managing multiple sprites/files in a project

export interface SpriteFile {
    id: string;
    name: string;          // Display name (e.g., "Sprite1", "Cat")
    code: string;          // The scratch code for this sprite
    createdAt: number;     // Timestamp
    updatedAt: number;     // Timestamp
}

export interface ScratchProject {
    id: string;
    name: string;          // Project name
    version: string;       // Schema version for future migrations
    sprites: SpriteFile[]; // All sprites in the project
    activeSprite: string;  // ID of currently active sprite
    createdAt: number;
    updatedAt: number;
}

// Default initial code for new sprites
export const DEFAULT_SPRITE_CODE = `when flagClicked
    say "Hello!"
`;

// Create a new sprite with default values
export function createSprite(name: string): SpriteFile {
    const now = Date.now();
    return {
        id: `sprite_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        code: DEFAULT_SPRITE_CODE,
        createdAt: now,
        updatedAt: now,
    };
}

// Create a new empty project
export function createProject(name: string = "My Project"): ScratchProject {
    const now = Date.now();
    const defaultSprite = createSprite("Sprite1");
    return {
        id: `project_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        version: "1.0.0",
        sprites: [defaultSprite],
        activeSprite: defaultSprite.id,
        createdAt: now,
        updatedAt: now,
    };
}

// Storage key for localStorage
export const PROJECT_STORAGE_KEY = "scratchProject";

// Legacy storage key (for migration)
export const LEGACY_CODE_KEY = "scratchCode";
