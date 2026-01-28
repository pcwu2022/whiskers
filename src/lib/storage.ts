// IndexedDB Storage for Whiskers Playground
// Provides persistent storage for projects, costumes, and sounds

import { ScratchProject, Costume, Sound } from "@/types/projectTypes";

// Database configuration
const DB_NAME = "whiskers-playground";
const DB_VERSION = 2;  // Bump version for schema update

// Store names
const STORES = {
    PROJECTS: "projects",
    COSTUMES: "costumes",
    SOUNDS: "sounds",
    SETTINGS: "settings",
} as const;

// Schema types for stored assets (with Blob data for efficiency)
export interface StoredCostumeAsset {
    id: string;
    projectId: string;
    spriteId: string;
    name: string;
    data: Blob | null;  // Image data as Blob
    mimeType: string;
    width: number;
    height: number;
    rotationCenterX: number;
    rotationCenterY: number;
    createdAt: number;
    updatedAt: number;
}

export interface StoredSoundAsset {
    id: string;
    projectId: string;
    spriteId: string;
    name: string;
    data: Blob | null;  // Audio data as Blob
    mimeType: string;
    duration: number;   // Duration in seconds
    createdAt: number;
    updatedAt: number;
}

export interface AppSettings {
    key: string;
    value: unknown;
}

// Current project key in settings
const CURRENT_PROJECT_KEY = "currentProjectId";

// Database instance
let db: IDBDatabase | null = null;

/**
 * Initialize the IndexedDB database
 */
export function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("Failed to open IndexedDB:", request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Projects store - stores full project data
            if (!database.objectStoreNames.contains(STORES.PROJECTS)) {
                const projectStore = database.createObjectStore(STORES.PROJECTS, { keyPath: "id" });
                projectStore.createIndex("name", "name", { unique: false });
                projectStore.createIndex("updatedAt", "updatedAt", { unique: false });
            }

            // Costumes store - for sprite images
            if (!database.objectStoreNames.contains(STORES.COSTUMES)) {
                const costumeStore = database.createObjectStore(STORES.COSTUMES, { keyPath: "id" });
                costumeStore.createIndex("projectId", "projectId", { unique: false });
                costumeStore.createIndex("spriteId", "spriteId", { unique: false });
                costumeStore.createIndex("projectSprite", ["projectId", "spriteId"], { unique: false });
            }

            // Sounds store - for audio files
            if (!database.objectStoreNames.contains(STORES.SOUNDS)) {
                const soundStore = database.createObjectStore(STORES.SOUNDS, { keyPath: "id" });
                soundStore.createIndex("projectId", "projectId", { unique: false });
                soundStore.createIndex("spriteId", "spriteId", { unique: false });
                soundStore.createIndex("projectSprite", ["projectId", "spriteId"], { unique: false });
            }

            // Settings store - for app settings (current project, preferences, etc.)
            if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
                database.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
            }
        };
    });
}

/**
 * Save a project to IndexedDB
 */
export async function saveProject(project: ScratchProject): Promise<void> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.PROJECTS, STORES.SETTINGS], "readwrite");
        const projectStore = transaction.objectStore(STORES.PROJECTS);
        const settingsStore = transaction.objectStore(STORES.SETTINGS);

        // Save the project
        const saveRequest = projectStore.put(project);
        
        saveRequest.onerror = () => {
            console.error("Failed to save project:", saveRequest.error);
            reject(saveRequest.error);
        };

        // Also save as current project
        settingsStore.put({ key: CURRENT_PROJECT_KEY, value: project.id });

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}

/**
 * Load a project by ID from IndexedDB
 */
export async function loadProject(projectId: string): Promise<ScratchProject | null> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.PROJECTS, "readonly");
        const store = transaction.objectStore(STORES.PROJECTS);
        const request = store.get(projectId);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            console.error("Failed to load project:", request.error);
            reject(request.error);
        };
    });
}

/**
 * Load the current (most recently used) project
 */
export async function loadCurrentProject(): Promise<ScratchProject | null> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORES.SETTINGS, STORES.PROJECTS], "readonly");
        const settingsStore = transaction.objectStore(STORES.SETTINGS);
        const projectStore = transaction.objectStore(STORES.PROJECTS);

        // First get the current project ID from settings
        const settingsRequest = settingsStore.get(CURRENT_PROJECT_KEY);

        settingsRequest.onsuccess = () => {
            const currentProjectId = settingsRequest.result?.value;
            
            if (currentProjectId) {
                // Load the project by ID
                const projectRequest = projectStore.get(currentProjectId);
                projectRequest.onsuccess = () => {
                    resolve(projectRequest.result || null);
                };
                projectRequest.onerror = () => {
                    reject(projectRequest.error);
                };
            } else {
                // No current project set, try to get any project
                const getAllRequest = projectStore.getAll();
                getAllRequest.onsuccess = () => {
                    const projects = getAllRequest.result;
                    if (projects && projects.length > 0) {
                        // Return the most recently updated project
                        projects.sort((a, b) => b.updatedAt - a.updatedAt);
                        resolve(projects[0]);
                    } else {
                        resolve(null);
                    }
                };
                getAllRequest.onerror = () => {
                    reject(getAllRequest.error);
                };
            }
        };

        settingsRequest.onerror = () => {
            reject(settingsRequest.error);
        };
    });
}

/**
 * Get all projects (for project list/switcher)
 */
export async function getAllProjects(): Promise<ScratchProject[]> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.PROJECTS, "readonly");
        const store = transaction.objectStore(STORES.PROJECTS);
        const request = store.getAll();

        request.onsuccess = () => {
            const projects = request.result || [];
            // Sort by most recently updated
            projects.sort((a, b) => b.updatedAt - a.updatedAt);
            resolve(projects);
        };

        request.onerror = () => {
            console.error("Failed to get all projects:", request.error);
            reject(request.error);
        };
    });
}

/**
 * Delete a project by ID
 */
export async function deleteProject(projectId: string): Promise<void> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            [STORES.PROJECTS, STORES.COSTUMES, STORES.SOUNDS], 
            "readwrite"
        );
        const projectStore = transaction.objectStore(STORES.PROJECTS);
        const costumeStore = transaction.objectStore(STORES.COSTUMES);
        const soundStore = transaction.objectStore(STORES.SOUNDS);

        // Delete the project
        projectStore.delete(projectId);

        // Delete associated costumes
        const costumeIndex = costumeStore.index("projectId");
        const costumeRequest = costumeIndex.openCursor(IDBKeyRange.only(projectId));
        costumeRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        // Delete associated sounds
        const soundIndex = soundStore.index("projectId");
        const soundRequest = soundIndex.openCursor(IDBKeyRange.only(projectId));
        soundRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
    try {
        return typeof indexedDB !== "undefined" && indexedDB !== null;
    } catch {
        return false;
    }
}

/**
 * Migrate data from localStorage to IndexedDB
 */
export async function migrateFromLocalStorage(): Promise<ScratchProject | null> {
    // Check for existing localStorage data
    const PROJECT_STORAGE_KEY = "scratch_project";
    const LEGACY_CODE_KEY = "scratchCode";
    
    try {
        const savedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (savedProject) {
            const project = JSON.parse(savedProject) as ScratchProject;
            await saveProject(project);
            // Optionally clear localStorage after successful migration
            // localStorage.removeItem(PROJECT_STORAGE_KEY);
            console.log("Migrated project from localStorage to IndexedDB");
            return project;
        }
        
        // Check for legacy code
        const legacyCode = localStorage.getItem(LEGACY_CODE_KEY);
        if (legacyCode) {
            // Return null - let the app create a new project with this code
            return null;
        }
    } catch (error) {
        console.error("Failed to migrate from localStorage:", error);
    }
    
    return null;
}

// Costume storage functions (for future use)
export async function saveCostume(costume: StoredCostumeAsset): Promise<void> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.COSTUMES, "readwrite");
        const store = transaction.objectStore(STORES.COSTUMES);
        const request = store.put(costume);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getCostumesForSprite(projectId: string, spriteId: string): Promise<StoredCostumeAsset[]> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.COSTUMES, "readonly");
        const store = transaction.objectStore(STORES.COSTUMES);
        const index = store.index("projectSprite");
        const request = index.getAll([projectId, spriteId]);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteCostume(costumeId: string): Promise<void> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.COSTUMES, "readwrite");
        const store = transaction.objectStore(STORES.COSTUMES);
        const request = store.delete(costumeId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Sound storage functions (for future use)
export async function saveSound(sound: StoredSoundAsset): Promise<void> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.SOUNDS, "readwrite");
        const store = transaction.objectStore(STORES.SOUNDS);
        const request = store.put(sound);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getSoundsForSprite(projectId: string, spriteId: string): Promise<StoredSoundAsset[]> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.SOUNDS, "readonly");
        const store = transaction.objectStore(STORES.SOUNDS);
        const index = store.index("projectSprite");
        const request = index.getAll([projectId, spriteId]);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteSound(soundId: string): Promise<void> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.SOUNDS, "readwrite");
        const store = transaction.objectStore(STORES.SOUNDS);
        const request = store.delete(soundId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Helper: Convert base64 data URL to Blob
export function dataURLToBlob(dataURL: string): Blob {
    const [header, base64] = dataURL.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

// Helper: Convert Blob to base64 data URL
export function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Helper: Convert Costume to StoredCostumeAsset
export function costumeToStoredAsset(
    costume: Costume, 
    projectId: string, 
    spriteId: string
): StoredCostumeAsset {
    const now = Date.now();
    return {
        id: costume.id,
        projectId,
        spriteId,
        name: costume.name,
        data: costume.data ? dataURLToBlob(costume.data) : null,
        mimeType: costume.mimeType,
        width: costume.width,
        height: costume.height,
        rotationCenterX: costume.rotationCenterX,
        rotationCenterY: costume.rotationCenterY,
        createdAt: now,
        updatedAt: now,
    };
}

// Helper: Convert StoredCostumeAsset to Costume
export async function storedAssetToCostume(asset: StoredCostumeAsset): Promise<Costume> {
    return {
        id: asset.id,
        name: asset.name,
        data: asset.data ? await blobToDataURL(asset.data) : null,
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
        rotationCenterX: asset.rotationCenterX,
        rotationCenterY: asset.rotationCenterY,
    };
}

// Helper: Convert Sound to StoredSoundAsset
export function soundToStoredAsset(
    sound: Sound,
    projectId: string,
    spriteId: string
): StoredSoundAsset {
    const now = Date.now();
    return {
        id: sound.id,
        projectId,
        spriteId,
        name: sound.name,
        data: sound.data ? dataURLToBlob(sound.data) : null,
        mimeType: sound.mimeType,
        duration: sound.duration,
        createdAt: now,
        updatedAt: now,
    };
}

// Helper: Convert StoredSoundAsset to Sound
export async function storedAssetToSound(asset: StoredSoundAsset): Promise<Sound> {
    return {
        id: asset.id,
        name: asset.name,
        data: asset.data ? await blobToDataURL(asset.data) : null,
        mimeType: asset.mimeType,
        duration: asset.duration,
    };
}

// Settings functions
export async function getSetting<T>(key: string): Promise<T | null> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.SETTINGS, "readonly");
        const store = transaction.objectStore(STORES.SETTINGS);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result?.value ?? null);
        request.onerror = () => reject(request.error);
    });
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.SETTINGS, "readwrite");
        const store = transaction.objectStore(STORES.SETTINGS);
        const request = store.put({ key, value });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
