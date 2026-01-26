// This file re-exports from the modular editor configuration files
// for backwards compatibility with existing imports.

export {
    SCRATCH_COLORS,
    scratchTheme,
    registerScratchTheme,
    languageDef,
    languageConfiguration,
    languageSelector,
    toolboxCategories,
    initialCode,
} from "./editor";

export type { ToolboxCommand, ToolboxCategory, BlockType } from "./editor";
