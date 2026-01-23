// Block Types - Defines all AST node types used by the parser and code generator

export type BlockType =
    | "event"
    | "motion"
    | "looks"
    | "sound"
    | "control"
    | "sensing"
    | "operators"
    | "operator"
    | "variables"
    | "variable"
    | "list"
    | "custom"
    | "procedure"
    | "pen";

export interface BlockNode {
    type: BlockType;
    name: string;
    args: (string | number | BlockNode)[];
    next?: BlockNode;
    body?: BlockNode[];      // For control structures (repeat, if, etc.)
    elseBody?: BlockNode[];  // For if-else structures
}

export interface Script {
    blocks: BlockNode[];
}

export interface Program {
    scripts: Script[];
    variables: Map<string, string | number | object | undefined | null>;
    lists: Map<string, (string | number | object | undefined | null)[]>;
}
