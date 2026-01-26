// Re-export all editor configuration modules
export { SCRATCH_COLORS } from "./scratchColors";
export { scratchTheme, registerScratchTheme } from "./scratchTheme";
export { languageDef, languageConfiguration } from "./scratchLanguage";
export { languageSelector } from "./scratchCompletions";
export { toolboxCategories } from "./toolboxConfig";
export type { ToolboxCommand, ToolboxCategory } from "./toolboxConfig";
export { initialCode } from "./initialCode";
