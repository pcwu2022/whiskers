import type * as monaco from "monaco-editor";
import { BlockType } from "@/lib/codeEditorConfig";

// Monaco editor option IDs (to avoid runtime access to monaco namespace)
const MONACO_OPTION_LINE_HEIGHT = 66; // monaco.editor.EditorOption.lineHeight

// Types of drop zones in the code
export type DropZoneType = 
    | "line-before"      // Insert before this line (for statements)
    | "line-after"       // Insert after this line (for statements)
    | "indent-start"     // Start of indented block (after control structures)
    | "value-slot"       // Value placeholder (█) for reporters
    | "boolean-slot"     // Boolean condition slot for boolean blocks
    | "boolean-expr"     // Existing boolean expression to replace
    | "quoted-string"    // Quoted string that can be replaced by a reporter
    | "top-of-file"      // Very top of the file (for hat blocks)
    | "end-of-block";    // End of a control block

export interface DropZone {
    type: DropZoneType;
    line: number;           // 1-based line number
    column: number;         // 1-based column number
    endColumn?: number;     // End column for expression replacement
    indent: string;         // Indentation string to use
    acceptsBlockTypes: BlockType[];
    rect?: DOMRect;         // Screen rectangle for hit testing
    priority: number;       // Higher = more specific match
    label?: string;         // Debug label
}

// Helper function to create a range object compatible with monaco
function createRange(startLine: number, startCol: number, endLine: number, endCol: number): monaco.IRange {
    return {
        startLineNumber: startLine,
        startColumn: startCol,
        endLineNumber: endLine,
        endColumn: endCol
    };
}

// Patterns to identify code structure
const HAT_PATTERNS = /^(\s*)(when\s|define\s)/;
const CONTROL_PATTERNS = /^(\s*)(repeat\s|forever|if\s|repeat until\s|define\s)/;
const END_PATTERN = /^(\s*)end\s*$/;
const EMPTY_LINE_PATTERN = /^\s*$/;
const COMMENT_PATTERN = /^\s*\/\//;
const REPORTER_SLOT_PATTERN = /⬤/g;   // Circle for reporter/value slots
const BOOLEAN_SLOT_PATTERN = /⯁/g;    // Diamond for boolean slots

// Pattern to match existing boolean expressions that can be replaced
// Matches: a < b, a > b, a = b, expr and expr, expr or expr, not expr, touching X, key X pressed, etc.
const BOOLEAN_EXPRESSION_PATTERN = /(\S+\s*(?:<|>|=)\s*\S+|\S+\s+(?:and|or)\s+\S+|not\s+\S+|touching\s+\S+|key\s+\S+\s+pressed|mouse\s+down)/g;

// Pattern to match quoted strings that can be replaced by reporters
const QUOTED_STRING_PATTERN = /"[^"]*"/g;

/**
 * DropZoneManager analyzes code in the Monaco editor and computes
 * valid drop zones for different block types.
 */
export class DropZoneManager {
    private editor: monaco.editor.IStandaloneCodeEditor;
    private dropZones: DropZone[] = [];

    constructor(editor: monaco.editor.IStandaloneCodeEditor) {
        this.editor = editor;
    }

    /**
     * Analyze the current code and compute all valid drop zones
     */
    computeDropZones(draggedBlockType: BlockType): DropZone[] {
        this.dropZones = [];
        const model = this.editor.getModel();
        if (!model) return [];

        const lineCount = model.getLineCount();
        const code = model.getValue();
        const lines = code.split("\n");

        // Track indentation levels and block structure
        const blockStack: { indent: string; line: number }[] = [];

        for (let lineNum = 1; lineNum <= lineCount; lineNum++) {
            const lineContent = lines[lineNum - 1] || "";
            const trimmedLine = lineContent.trim();
            const currentIndent = lineContent.match(/^(\s*)/)?.[1] || "";

            // Skip comments
            if (COMMENT_PATTERN.test(lineContent)) continue;

            // Check for hat blocks (when, define)
            const hatMatch = HAT_PATTERNS.exec(lineContent);
            if (hatMatch) {
                // Hat blocks - can only place other hats before them at top level (no indent)
                if (draggedBlockType === "hat" && currentIndent === "") {
                    this.addDropZone({
                        type: "line-before",
                        line: lineNum,
                        column: 1,
                        indent: "",
                        acceptsBlockTypes: ["hat"],
                        priority: 10,
                        label: "before hat block",
                    });
                }
                // Track that we're inside a hat block
                blockStack.push({ indent: currentIndent, line: lineNum });
                continue;
            }

            // Check for control structures (repeat, if, forever)
            const controlMatch = CONTROL_PATTERNS.exec(lineContent);
            if (controlMatch) {
                const controlIndent = controlMatch[1];
                // Can add statements before control blocks
                if (this.canAcceptStatementBefore(lineNum, lines, draggedBlockType)) {
                    this.addDropZone({
                        type: "line-before",
                        line: lineNum,
                        column: 1,
                        indent: controlIndent,
                        acceptsBlockTypes: ["statement", "c-block"],
                        priority: 5,
                        label: "before control block",
                    });
                }
                // Inside control block (indented)
                const innerIndent = controlIndent + "    ";
                this.addDropZone({
                    type: "indent-start",
                    line: lineNum + 1,
                    column: 1,
                    indent: innerIndent,
                    acceptsBlockTypes: ["statement", "c-block", "cap"],
                    priority: 8,
                    label: "inside control block",
                });
                blockStack.push({ indent: controlIndent, line: lineNum });
                continue;
            }

            // Check for end of block
            if (END_PATTERN.test(lineContent)) {
                const endIndent = currentIndent;
                // Can add statements before end
                if (draggedBlockType === "statement" || draggedBlockType === "c-block" || draggedBlockType === "cap") {
                    this.addDropZone({
                        type: "line-before",
                        line: lineNum,
                        column: 1,
                        indent: endIndent + "    ", // Inside the block
                        acceptsBlockTypes: ["statement", "c-block", "cap"],
                        priority: 7,
                        label: "before end",
                    });
                }
                // Pop from stack
                if (blockStack.length > 0) {
                    blockStack.pop();
                }
                continue;
            }

            // Empty lines - good drop targets
            if (EMPTY_LINE_PATTERN.test(lineContent)) {
                const effectiveIndent = this.getEffectiveIndent(lineNum, lines, blockStack);
                this.addDropZone({
                    type: "line-before",
                    line: lineNum,
                    column: 1,
                    indent: effectiveIndent,
                    acceptsBlockTypes: this.getAcceptableTypesForLine(lineNum, lines, blockStack, draggedBlockType),
                    priority: 3,
                    label: "empty line",
                });
                continue;
            }

            // Regular statement lines
            if (trimmedLine && !COMMENT_PATTERN.test(lineContent)) {
                // Can insert before this line
                if (this.canAcceptStatementBefore(lineNum, lines, draggedBlockType)) {
                    this.addDropZone({
                        type: "line-before",
                        line: lineNum,
                        column: 1,
                        indent: currentIndent,
                        acceptsBlockTypes: ["statement", "c-block"],
                        priority: 5,
                        label: "before statement",
                    });
                }
                // Can insert after this line
                this.addDropZone({
                    type: "line-after",
                    line: lineNum,
                    column: 1,
                    indent: currentIndent,
                    acceptsBlockTypes: ["statement", "c-block", "cap"],
                    priority: 4,
                    label: "after statement",
                });

                // Check for reporter slots (⬤) for reporter blocks
                if (draggedBlockType === "reporter") {
                    let match;
                    const slotPattern = new RegExp(REPORTER_SLOT_PATTERN.source, "g");
                    while ((match = slotPattern.exec(lineContent)) !== null) {
                        this.addDropZone({
                            type: "value-slot",
                            line: lineNum,
                            column: match.index + 1,
                            indent: "",
                            acceptsBlockTypes: ["reporter"],
                            priority: 15,
                            label: "reporter slot",
                        });
                    }
                    
                    // Also check for quoted strings that can be replaced by reporters
                    const quotedPattern = new RegExp(QUOTED_STRING_PATTERN.source, "g");
                    while ((match = quotedPattern.exec(lineContent)) !== null) {
                        // Skip if it's just a slot "⬤"
                        if (match[0] === '"⬤"') continue;
                        this.addDropZone({
                            type: "quoted-string",
                            line: lineNum,
                            column: match.index + 1,
                            endColumn: match.index + match[0].length + 1,
                            indent: "",
                            acceptsBlockTypes: ["reporter"],
                            priority: 10, // Lower priority than empty slots
                            label: `replace: ${match[0]}`,
                        });
                    }
                }

                // Check for boolean slots (⯁) for boolean blocks
                if (draggedBlockType === "boolean") {
                    let match;
                    const slotPattern = new RegExp(BOOLEAN_SLOT_PATTERN.source, "g");
                    while ((match = slotPattern.exec(lineContent)) !== null) {
                        this.addDropZone({
                            type: "boolean-slot",
                            line: lineNum,
                            column: match.index + 1,
                            indent: "",
                            acceptsBlockTypes: ["boolean"],
                            priority: 15,
                            label: "boolean slot",
                        });
                    }
                    
                    // Also check for existing boolean expressions that can be replaced
                    // Look for patterns like "a < b", "a > b", "a = b" after "if" or "until"
                    const exprPattern = new RegExp(BOOLEAN_EXPRESSION_PATTERN.source, "g");
                    while ((match = exprPattern.exec(lineContent)) !== null) {
                        this.addDropZone({
                            type: "boolean-expr",
                            line: lineNum,
                            column: match.index + 1,
                            endColumn: match.index + match[0].length + 1,
                            indent: "",
                            acceptsBlockTypes: ["boolean"],
                            priority: 12, // Lower priority than empty slots
                            label: `replace: ${match[0]}`,
                        });
                    }
                }
            }
        }

        // Always add top-of-file for hat blocks
        if (draggedBlockType === "hat") {
            this.addDropZone({
                type: "top-of-file",
                line: 1,
                column: 1,
                indent: "",
                acceptsBlockTypes: ["hat"],
                priority: 2,
                label: "top of file",
            });
        }

        // Add end of file for statements
        if (draggedBlockType === "statement" || draggedBlockType === "c-block") {
            const lastLine = lines.length;
            const lastLineContent = lines[lastLine - 1] || "";
            if (!EMPTY_LINE_PATTERN.test(lastLineContent)) {
                this.addDropZone({
                    type: "line-after",
                    line: lastLine,
                    column: 1,
                    indent: this.getEffectiveIndent(lastLine, lines, blockStack),
                    acceptsBlockTypes: ["statement", "c-block"],
                    priority: 2,
                    label: "end of file",
                });
            }
        }

        // Filter to only zones that accept the dragged block type
        return this.dropZones.filter(zone => 
            zone.acceptsBlockTypes.includes(draggedBlockType)
        );
    }

    /**
     * Update drop zone screen rectangles based on editor layout
     */
    updateDropZoneRects(): void {
        const editorDom = this.editor.getDomNode();
        if (!editorDom) return;

        const editorRect = editorDom.getBoundingClientRect();
        const lineHeight = this.editor.getOption(MONACO_OPTION_LINE_HEIGHT);
        const scrollTop = this.editor.getScrollTop();
        const scrollLeft = this.editor.getScrollLeft();
        const charWidth = 7.8; // Approximate character width at 14px font

        for (const zone of this.dropZones) {
            // Get the position for this line in the editor
            const topForLine = this.editor.getTopForLineNumber(zone.line);
            const y = editorRect.top + topForLine - scrollTop;

            // Calculate x position based on zone type
            let x: number;
            let width: number;

            if (zone.type === "value-slot" || zone.type === "boolean-slot") {
                // Position at the slot character
                x = editorRect.left + (zone.column * charWidth) - scrollLeft + 60;
                width = charWidth * 2; // Small target for single character
            } else if ((zone.type === "boolean-expr" || zone.type === "quoted-string") && zone.endColumn) {
                // Position spanning the entire expression or quoted string
                x = editorRect.left + (zone.column * charWidth) - scrollLeft + 60;
                width = (zone.endColumn - zone.column) * charWidth;
            } else {
                // Line-based zones
                x = editorRect.left + (zone.indent.length * charWidth) - scrollLeft + 60;
                width = editorRect.width - (zone.indent.length * charWidth) - 80;
            }

            zone.rect = new DOMRect(
                x,
                y - 2,
                width,
                lineHeight + 4
            );
        }
    }

    /**
     * Find the nearest valid drop zone to a screen position
     */
    findNearestDropZone(x: number, y: number, draggedBlockType: BlockType): DropZone | null {
        // First, recompute zones for current code
        const validZones = this.computeDropZones(draggedBlockType);
        this.updateDropZoneRects();

        let nearestZone: DropZone | null = null;
        let nearestDistance = Infinity;
        const maxDistance = 50; // Maximum pixels to consider "near"

        for (const zone of validZones) {
            if (!zone.rect) continue;

            // Calculate distance to zone
            const zoneCenterY = zone.rect.top + zone.rect.height / 2;
            const distance = Math.abs(y - zoneCenterY);

            // Check if within horizontal bounds (with some margin)
            const inHorizontalRange = x >= zone.rect.left - 20 && x <= zone.rect.right + 20;

            if (distance < nearestDistance && distance < maxDistance && inHorizontalRange) {
                // Prefer higher priority zones when distances are similar
                if (nearestZone && Math.abs(distance - nearestDistance) < 10) {
                    if (zone.priority > nearestZone.priority) {
                        nearestZone = zone;
                        nearestDistance = distance;
                    }
                } else {
                    nearestZone = zone;
                    nearestDistance = distance;
                }
            }
        }

        return nearestZone;
    }

    /**
     * Insert code at a drop zone
     */
    insertAtDropZone(zone: DropZone, code: string, needsIndent?: boolean): void {
        const model = this.editor.getModel();
        if (!model) return;

        // Clean up any snippet placeholders like $0, $1, etc.
        const cleanCode = code.replace(/\$\d+/g, "");
        
        let insertText = zone.indent + cleanCode;
        let range: monaco.IRange;

        switch (zone.type) {
            case "line-before":
            case "top-of-file":
            case "indent-start":
                // Insert before the line
                insertText = zone.indent + cleanCode + (needsIndent ? "\n" + zone.indent + "    " : "") + "\n";
                range = createRange(zone.line, 1, zone.line, 1);
                break;

            case "line-after":
                // Insert after the line
                const lineContent = model.getLineContent(zone.line);
                insertText = "\n" + zone.indent + cleanCode + (needsIndent ? "\n" + zone.indent + "    " : "");
                range = createRange(zone.line, lineContent.length + 1, zone.line, lineContent.length + 1);
                break;

            case "value-slot":
                // Replace the ⬤ placeholder (reporter vacancy)
                const valueSlotContent = model.getLineContent(zone.line);
                const valueSlotIndex = valueSlotContent.indexOf("⬤", zone.column - 1);
                if (valueSlotIndex >= 0) {
                    // Check if the slot is inside quotes - if so, replace the whole quoted slot
                    // This is for reporters/variables which should be evaluated, not treated as strings
                    const beforeSlot = valueSlotContent.charAt(valueSlotIndex - 1);
                    const afterSlot = valueSlotContent.charAt(valueSlotIndex + 1);
                    if (beforeSlot === '"' && afterSlot === '"') {
                        // Replace "⬤" including the quotes
                        range = createRange(zone.line, valueSlotIndex, zone.line, valueSlotIndex + 3);
                    } else {
                        // Just replace the ⬤
                        range = createRange(zone.line, valueSlotIndex + 1, zone.line, valueSlotIndex + 2);
                    }
                    insertText = cleanCode;
                } else {
                    return; // Couldn't find slot
                }
                break;

            case "boolean-slot":
                // Replace the ⯁ placeholder (boolean vacancy)
                const boolSlotContent = model.getLineContent(zone.line);
                const boolSlotIndex = boolSlotContent.indexOf("⯁", zone.column - 1);
                if (boolSlotIndex >= 0) {
                    range = createRange(zone.line, boolSlotIndex + 1, zone.line, boolSlotIndex + 2);
                    insertText = cleanCode;
                } else {
                    return; // Couldn't find slot
                }
                break;

            case "boolean-expr":
                // Replace an existing boolean expression
                if (zone.endColumn) {
                    range = createRange(zone.line, zone.column, zone.line, zone.endColumn);
                    insertText = cleanCode;
                } else {
                    return; // No end column defined
                }
                break;

            case "quoted-string":
                // Replace a quoted string with a reporter (removes quotes since reporters are evaluated)
                if (zone.endColumn) {
                    range = createRange(zone.line, zone.column, zone.line, zone.endColumn);
                    insertText = cleanCode;
                } else {
                    return; // No end column defined
                }
                break;

            default:
                return;
        }

        // Execute the edit
        this.editor.executeEdits("block-drop", [{
            range,
            text: insertText,
            forceMoveMarkers: true,
        }]);

        // Position cursor at the next logical place
        const insertedLines = insertText.split("\n");
        let cursorLine: number;
        let cursorColumn: number;

        if (needsIndent && insertedLines.length > 1) {
            // For C-blocks (if, repeat, forever, etc.), position cursor on the indented line
            // The indented line is typically the second line (after the control statement)
            cursorLine = zone.line + 1;
            if (zone.type === "line-after") {
                cursorLine = zone.line + 2; // After the newline we added
            }
            cursorColumn = zone.indent.length + 5; // indent + 4 spaces + 1
        } else if (zone.type === "value-slot" || zone.type === "boolean-slot" || zone.type === "boolean-expr" || zone.type === "quoted-string") {
            // For slot replacements, find next slot or end of line
            const updatedLine = model.getLineContent(zone.line);
            const nextSlotIndex = Math.min(
                updatedLine.indexOf("⬤", zone.column) >= 0 ? updatedLine.indexOf("⬤", zone.column) : Infinity,
                updatedLine.indexOf("⯁", zone.column) >= 0 ? updatedLine.indexOf("⯁", zone.column) : Infinity
            );
            cursorLine = zone.line;
            cursorColumn = nextSlotIndex < Infinity ? nextSlotIndex + 1 : zone.column + cleanCode.length;
        } else {
            // For statement blocks, position at the end of the inserted line (after the code)
            // This puts cursor right after the statement on the same line
            if (zone.type === "line-after") {
                // We inserted: \n + indent + code + possibly more
                // Position after the code on the newly inserted line
                cursorLine = zone.line + 1;
                cursorColumn = zone.indent.length + cleanCode.length + 1;
            } else {
                // line-before, top-of-file, indent-start: we inserted indent + code + \n
                // Position after the code, before the newline
                cursorLine = zone.line;
                cursorColumn = zone.indent.length + cleanCode.length + 1;
            }
        }

        this.editor.setPosition({
            lineNumber: cursorLine,
            column: cursorColumn,
        });
        this.editor.focus();
    }

    private addDropZone(zone: DropZone): void {
        // Avoid duplicates
        const exists = this.dropZones.some(z => 
            z.line === zone.line && 
            z.column === zone.column && 
            z.type === zone.type
        );
        if (!exists) {
            this.dropZones.push(zone);
        }
    }

    private getEffectiveIndent(lineNum: number, lines: string[], blockStack: { indent: string; line: number }[]): string {
        // Look at surrounding context to determine appropriate indent
        if (blockStack.length > 0) {
            const lastBlock = blockStack[blockStack.length - 1];
            return lastBlock.indent + "    ";
        }

        // Look at previous non-empty line
        for (let i = lineNum - 2; i >= 0; i--) {
            const line = lines[i];
            if (line && !EMPTY_LINE_PATTERN.test(line) && !COMMENT_PATTERN.test(line)) {
                return line.match(/^(\s*)/)?.[1] || "";
            }
        }
        return "";
    }

    private getAcceptableTypesForLine(
        lineNum: number, 
        lines: string[], 
        blockStack: { indent: string; line: number }[],
        _draggedBlockType: BlockType
    ): BlockType[] {
        // Get the effective indent for this line
        const effectiveIndent = this.getEffectiveIndent(lineNum, lines, blockStack);
        
        // Hat blocks can ONLY go at top level with no indent
        if (blockStack.length === 0 && effectiveIndent === "") {
            return ["hat", "statement", "c-block"];
        }
        // Inside a block or indented, accept statements and control (but NOT hats)
        return ["statement", "c-block", "cap"];
    }

    private canAcceptStatementBefore(lineNum: number, lines: string[], draggedBlockType: BlockType): boolean {
        // Check if this position can accept a statement
        if (draggedBlockType === "hat") {
            // Hat blocks can only go at top level before other hats
            const prevLine = lines[lineNum - 2];
            return !prevLine || EMPTY_LINE_PATTERN.test(prevLine) || HAT_PATTERNS.test(prevLine);
        }
        return draggedBlockType === "statement" || draggedBlockType === "c-block";
    }

    getDropZones(): DropZone[] {
        return this.dropZones;
    }
}
