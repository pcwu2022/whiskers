"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/compiler.ts
var compiler_exports = {};
__export(compiler_exports, {
  ScratchTextCompiler: () => ScratchTextCompiler,
  compile: () => compile
});
module.exports = __toCommonJS(compiler_exports);

// src/types/compilerTypes.ts
var blockTypeMap = {
  // Events
  when: "event",
  broadcast: "event",
  receive: "event",
  // Motion
  move: "motion",
  turn: "motion",
  goto: "motion",
  glide: "motion",
  point: "motion",
  direction: "motion",
  // Looks
  say: "looks",
  think: "looks",
  show: "looks",
  hide: "looks",
  switch: "looks",
  // Sound
  play: "sound",
  stop: "sound",
  // Control
  wait: "control",
  repeat: "control",
  forever: "control",
  if: "control",
  else: "control",
  until: "control",
  while: "control",
  // Sensing
  ask: "sensing",
  touching: "sensing",
  key: "sensing",
  mouse: "sensing",
  // Variables
  set: "variables",
  change: "variables",
  // Operators
  join: "operators",
  letter: "operators",
  mod: "operators",
  round: "operators",
  abs: "operators",
  sqrt: "operators",
  // Pen
  pen: "pen",
  stamp: "pen"
};

// src/lib/lexer.ts
var Lexer = class {
  // Constructor: Initializes the Lexer with the input code.
  constructor(code) {
    // The current position in the input code string.
    this.position = 0;
    // The array of tokens generated from the input code.
    this.tokens = [];
    // Current line number (for error reporting)
    this.line = 1;
    // Current column number (for error reporting)
    this.column = 1;
    // Track indentation levels
    this.indentLevels = [0];
    // Scratch keywords
    this.keywords = /* @__PURE__ */ new Set([
      "when",
      "flag",
      "clicked",
      "forever",
      "if",
      "else",
      "then",
      "repeat",
      "until",
      "while",
      "end",
      "wait",
      "move",
      "steps",
      "turn",
      "degrees",
      "say",
      "for",
      "seconds",
      "think",
      "broadcast",
      "receive",
      "ask",
      "answer",
      "show",
      "hide",
      "switch",
      "costume",
      "backdrop",
      "next",
      "change",
      "set",
      "color",
      "effect",
      "size",
      "clear",
      "graphic",
      "effects",
      "reset",
      "timer",
      "variable",
      "to",
      "by",
      "and",
      "or",
      "not",
      "join",
      "letter",
      "of",
      "mod",
      "round",
      "abs",
      "floor",
      "ceiling",
      "sqrt",
      "sin",
      "cos",
      "tan",
      "asin",
      "acos",
      "atan",
      "ln",
      "log",
      "pow",
      "touching",
      "mouse-pointer",
      "edge",
      "sprite",
      "pen",
      "up",
      "down",
      "key",
      "pressed",
      "mouse",
      "down",
      "x",
      "y",
      "direction",
      "random",
      "between",
      "define",
      "procedure",
      "return",
      "event",
      "stop",
      "all",
      "this",
      "script",
      "true",
      "false",
      "null"
    ]);
    // Scratch operators
    this.operators = /* @__PURE__ */ new Set([
      "+",
      "-",
      "*",
      "/",
      "%",
      "=",
      ">",
      "<",
      ">=",
      "<=",
      "==",
      "!=",
      "&",
      "|",
      "!"
    ]);
    this.code = code.endsWith("\n") ? code : code + "\n";
  }
  // tokenize: Main method to convert the input code into an array of tokens.
  tokenize() {
    while (this.position < this.code.length) {
      if (this.column === 1) {
        this.handleIndentation();
      }
      const char = this.code[this.position];
      if ([" ", "	"].includes(char)) {
        this.advance();
      } else if (char === "\n" || char === "\r") {
        this.handleNewline();
      } else if (char === "/" && this.code[this.position + 1] === "/") {
        this.extractComment();
      } else if (char === "(" || char === ")") {
        this.addToken(char === "(" ? "PARENTHESIS_OPEN" /* PARENTHESIS_OPEN */ : "PARENTHESIS_CLOSE" /* PARENTHESIS_CLOSE */, char);
        this.advance();
      } else if (char === "[" || char === "]") {
        this.addToken(char === "[" ? "BRACKET_OPEN" /* BRACKET_OPEN */ : "BRACKET_CLOSE" /* BRACKET_CLOSE */, char);
        this.advance();
      } else if (char === "{" || char === "}") {
        this.addToken(char === "{" ? "BRACE_OPEN" /* BRACE_OPEN */ : "BRACE_CLOSE" /* BRACE_CLOSE */, char);
        this.advance();
      } else if (char === ":") {
        this.addToken("COLON" /* COLON */, char);
        this.advance();
      } else if (char === ",") {
        this.addToken("COMMA" /* COMMA */, char);
        this.advance();
      } else if (char === '"' || char === "'") {
        this.extractString();
      } else if (this.isNumeric(char) || char === "-" && this.isNumeric(this.peek())) {
        this.extractNumber();
      } else if (this.isOperator(char)) {
        this.extractOperator();
      } else if (this.isAlpha(char)) {
        this.extractIdentifier();
      } else {
        this.advance();
      }
    }
    while (this.indentLevels.length > 1) {
      this.indentLevels.pop();
      this.addToken("DEDENT" /* DEDENT */, "");
    }
    this.addToken("EOF" /* EOF */, "");
    return this.tokens;
  }
  // Process indentation at the beginning of a line
  handleIndentation() {
    let spaces = 0;
    while (this.position < this.code.length) {
      const char = this.code[this.position];
      if (char === " ") {
        spaces++;
        this.advance();
      } else if (char === "	") {
        spaces += 4;
        this.advance();
      } else {
        break;
      }
    }
    if (this.code[this.position] === "\n" || this.code[this.position] === "\r" || this.code[this.position] === "/" && this.code[this.position + 1] === "/") {
      return;
    }
    const currentIndent = this.indentLevels[this.indentLevels.length - 1];
    if (spaces > currentIndent) {
      this.indentLevels.push(spaces);
      this.addToken("INDENT" /* INDENT */, " ".repeat(spaces - currentIndent));
    } else if (spaces < currentIndent) {
      while (this.indentLevels.length > 1 && this.indentLevels[this.indentLevels.length - 1] > spaces) {
        this.indentLevels.pop();
        this.addToken("DEDENT" /* DEDENT */, "");
      }
      if (this.indentLevels[this.indentLevels.length - 1] !== spaces) {
        throw new Error(`Inconsistent indentation at line ${this.line}`);
      }
    }
  }
  // Handle newline characters (\n or \r\n)
  handleNewline() {
    if (this.code[this.position] === "\r") {
      this.advance();
    }
    if (this.code[this.position] === "\n") {
      this.addToken("NEWLINE" /* NEWLINE */, "\n");
      this.advance();
      this.line++;
      this.column = 1;
    }
  }
  // Extract comment (starting with //)
  extractComment() {
    let comment = "";
    this.advance();
    this.advance();
    while (this.position < this.code.length && this.code[this.position] !== "\n" && this.code[this.position] !== "\r") {
      comment += this.code[this.position];
      this.advance();
    }
    this.addToken("COMMENT" /* COMMENT */, comment);
  }
  // Extract a string literal from the input code.
  extractString() {
    const quote = this.code[this.position];
    let value = "";
    this.advance();
    while (this.position < this.code.length && this.code[this.position] !== quote) {
      if (this.code[this.position] === "\\" && this.position + 1 < this.code.length) {
        this.advance();
        switch (this.code[this.position]) {
          case "n":
            value += "\n";
            break;
          case "t":
            value += "	";
            break;
          case "r":
            value += "\r";
            break;
          default:
            value += this.code[this.position];
        }
      } else {
        value += this.code[this.position];
      }
      this.advance();
    }
    if (this.position < this.code.length) {
      this.advance();
    } else {
      throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
    }
    this.addToken("STRING" /* STRING */, value);
  }
  // Extract a numeric literal from the input code.
  extractNumber() {
    let value = "";
    let isFloat = false;
    if (this.code[this.position] === "-") {
      value += "-";
      this.advance();
    }
    while (this.position < this.code.length && (this.isNumeric(this.code[this.position]) || this.code[this.position] === ".")) {
      if (this.code[this.position] === ".") {
        if (isFloat) {
          break;
        }
        isFloat = true;
      }
      value += this.code[this.position];
      this.advance();
    }
    this.addToken("NUMBER" /* NUMBER */, value);
  }
  // Extract an operator
  extractOperator() {
    let value = this.code[this.position];
    this.advance();
    if ((value === "=" || value === "!" || value === ">" || value === "<") && this.code[this.position] === "=") {
      value += "=";
      this.advance();
    }
    this.addToken("OPERATOR" /* OPERATOR */, value);
  }
  // Extract an identifier or keyword - FIXED
  extractIdentifier() {
    let value = "";
    while (this.position < this.code.length && (this.isAlpha(this.code[this.position]) || this.isNumeric(this.code[this.position]) || this.code[this.position] === "_")) {
      value += this.code[this.position];
      this.advance();
    }
    if (this.keywords.has(value)) {
      this.addToken("KEYWORD" /* KEYWORD */, value);
    } else {
      this.addToken("IDENTIFIER" /* IDENTIFIER */, value);
    }
  }
  // Helper method to add a token to the tokens array
  addToken(type, value) {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column - value.length
    });
  }
  // Advance the position in the code and update column
  advance() {
    this.position++;
    this.column++;
  }
  // Peek at the next character without advancing
  peek() {
    return this.position + 1 < this.code.length ? this.code[this.position + 1] : "\0";
  }
  // Check if a character is an alphabet letter
  isAlpha(char) {
    return /[a-zA-Z]/.test(char);
  }
  // Check if a character is a digit
  isNumeric(char) {
    return /[0-9]/.test(char);
  }
  // Check if a character is an operator
  isOperator(char) {
    return this.operators.has(char);
  }
};

// src/lib/parser.ts
var Parser = class {
  // Constructor: Initializes the Parser with the token array.
  constructor(tokens) {
    // Current position in the token array.
    this.position = 0;
    // Stack to track block nesting for indentation-based blocks
    // Each entry stores the block and the indentation level at which it lives
    this.blockStack = [];
    // Track the last block seen at each indentation level to connect `.next` chains correctly
    this.lastAtIndent = [];
    // Current indentation level
    this.indentLevel = 0;
    this.tokens = tokens;
  }
  // Get the current token
  get current() {
    return this.tokens[this.position];
  }
  // Check if we've reached the end of the tokens
  isAtEnd() {
    return this.position >= this.tokens.length || this.current.type === "EOF" /* EOF */;
  }
  // Advance to the next token and return the previous one
  advance() {
    const token = this.current;
    if (!this.isAtEnd()) {
      this.position++;
    }
    return token;
  }
  // Look ahead at the next token without advancing
  peek(offset = 1) {
    if (this.position + offset >= this.tokens.length) {
      return null;
    }
    return this.tokens[this.position + offset];
  }
  // Check if the current token's type matches the expected type
  match(type) {
    if (this.isAtEnd()) return false;
    return this.current.type === type;
  }
  // Consume a token if it matches the expected type, otherwise throw an error
  consume(type, errorMessage) {
    if (this.match(type)) {
      return this.advance();
    }
    throw new Error(`${errorMessage} at line ${this.current.line}, column ${this.current.column}`);
  }
  // Skip newlines and comments
  skipIrrelevant() {
    while (!this.isAtEnd() && (this.match("NEWLINE" /* NEWLINE */) || this.match("COMMENT" /* COMMENT */))) {
      this.advance();
    }
  }
  // parse: Main method to generate the AST (Program).
  parse() {
    const program = {
      scripts: [],
      variables: /* @__PURE__ */ new Map(),
      lists: /* @__PURE__ */ new Map()
    };
    this.skipIrrelevant();
    while (!this.isAtEnd()) {
      try {
        this.skipIrrelevant();
        if (this.isAtEnd()) break;
        if (this.match("KEYWORD" /* KEYWORD */)) {
          const keyword = this.current.value;
          if (keyword === "when") {
            const script = this.parseScript();
            program.scripts.push(script);
          } else if (keyword === "var" || keyword === "variable") {
            this.parseVariableDeclaration(program);
          } else if (keyword === "list") {
            this.parseListDeclaration(program);
          } else if (keyword === "define") {
            this.parseCustomBlockDefinition(program);
          } else {
            this.advance();
          }
        } else {
          this.advance();
        }
      } catch (error) {
        console.error(error);
        this.synchronize();
      }
    }
    return program;
  }
  // synchronize: Skip tokens until a safe point to continue parsing
  synchronize() {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.current.type === "KEYWORD" /* KEYWORD */ && ["when", "var", "variable", "list", "define"].includes(this.current.value)) {
        return;
      }
      if (this.current.type === "NEWLINE" /* NEWLINE */) {
        this.advance();
        return;
      }
      this.advance();
    }
  }
  // parseScript: Parses a script (sequence of blocks).
  parseScript() {
    const script = {
      blocks: []
    };
    this.blockStack = [];
    this.lastAtIndent = [];
    this.indentLevel = 0;
    const firstBlock = this.parseBlock();
    if (firstBlock) {
      script.blocks.push(firstBlock);
      this.blockStack.push({ block: firstBlock, indent: 0 });
      this.lastAtIndent[0] = firstBlock;
      this.parseScriptBlocks(script);
    }
    return script;
  }
  // parseScriptBlocks: Parse all blocks in a script after the first block
  // parseScriptBlocks: Parse all blocks in a script after the first block
  // parseScriptBlocks: Parse all blocks in a script after the first block
  parseScriptBlocks(script) {
    while (!this.isAtEnd()) {
      this.skipIrrelevant();
      if (this.isAtEnd()) break;
      if (this.match("INDENT" /* INDENT */)) {
        this.indentLevel++;
        this.advance();
        if (!this.blockStack.length) {
          break;
        }
        const parentEntry = this.blockStack[this.blockStack.length - 1];
        const parentBlock = parentEntry.block;
        const controlWithBody = ["if", "repeat", "forever", "until", "while"];
        const firstNestedBlock = this.parseBlock();
        if (!firstNestedBlock) {
          continue;
        }
        if (parentBlock.type === "event" || parentBlock.name === "when") {
          parentBlock.next = firstNestedBlock;
        } else {
          parentBlock.args.push(firstNestedBlock);
        }
        this.lastAtIndent[this.indentLevel] = firstNestedBlock;
        this.blockStack.push({ block: firstNestedBlock, indent: this.indentLevel });
        let currentBlock = firstNestedBlock;
        while (!this.isAtEnd() && !this.match("DEDENT" /* DEDENT */)) {
          this.skipIrrelevant();
          if (this.isAtEnd() || this.match("DEDENT" /* DEDENT */)) break;
          if (this.isBlockStart()) {
            const nextBlock = this.parseBlock();
            if (nextBlock) {
              currentBlock.next = nextBlock;
              currentBlock = nextBlock;
              this.lastAtIndent[this.indentLevel] = nextBlock;
              this.blockStack.push({ block: nextBlock, indent: this.indentLevel });
            }
          } else {
            this.advance();
          }
        }
      } else if (this.match("DEDENT" /* DEDENT */)) {
        this.advance();
        this.indentLevel = Math.max(0, this.indentLevel - 1);
        while (this.blockStack.length && this.blockStack[this.blockStack.length - 1].indent > this.indentLevel) {
          this.blockStack.pop();
        }
        for (let i = this.lastAtIndent.length - 1; i > this.indentLevel; i--) {
          this.lastAtIndent[i] = null;
        }
        if (this.indentLevel <= 0) {
          this.indentLevel = 0;
          if (this.blockStack.length <= 1) break;
        }
      } else if (this.isBlockStart()) {
        const block = this.parseBlock();
        if (block) {
          const last = this.lastAtIndent[this.indentLevel];
          if (last) {
            last.next = block;
          } else {
            script.blocks.push(block);
          }
          this.lastAtIndent[this.indentLevel] = block;
          this.blockStack.push({ block, indent: this.indentLevel });
        }
      } else {
        this.advance();
      }
    }
  }
  // isBlockStart: Checks if the current token can start a block
  isBlockStart() {
    if (!this.match("KEYWORD" /* KEYWORD */)) return false;
    const blockStartKeywords = [
      // Events
      "when",
      "broadcast",
      "receive",
      // Motion
      "move",
      "turn",
      "goto",
      "glide",
      "point",
      // Looks
      "say",
      "think",
      "show",
      "hide",
      "switch",
      "change",
      "set",
      // Sound
      "play",
      "stop",
      // Control
      "wait",
      "repeat",
      "forever",
      "if",
      "else",
      "until",
      "while",
      "stop",
      // Sensing
      "ask",
      "touching",
      // Variables
      "set",
      "change",
      // Operators (rarely start blocks)
      "join",
      // Pen
      "pen",
      "stamp"
    ];
    return blockStartKeywords.includes(this.current.value);
  }
  // parseBlock: Parses a single block.
  parseBlock() {
    if (!this.isBlockStart()) {
      return null;
    }
    let blockKeyword = this.consume("KEYWORD" /* KEYWORD */, "Expected block keyword").value;
    if (blockKeyword === "turn") {
      this.skipIrrelevant();
      if (!this.isAtEnd() && this.match("KEYWORD" /* KEYWORD */) && (this.current.value === "right" || this.current.value === "left")) {
        const dir = this.advance().value;
        blockKeyword = dir === "right" ? "turnRight" : "turnLeft";
      }
    } else if (blockKeyword === "repeat") {
      this.skipIrrelevant();
      if (!this.isAtEnd() && this.match("KEYWORD" /* KEYWORD */) && this.current.value === "until") {
        this.advance();
        blockKeyword = "repeatUntil";
      }
    }
    const blockType = this.determineBlockType(blockKeyword);
    const args = this.parseBlockArguments();
    const block = {
      type: blockType,
      name: blockKeyword,
      args
    };
    if (blockKeyword === "if") {
      this.skipIrrelevant();
      if (!this.isAtEnd() && this.match("KEYWORD" /* KEYWORD */) && this.current.value === "else") {
        this.advance();
        const elseBlock = this.parseBlock();
        if (elseBlock) {
          block.args.push("else");
          block.args.push(elseBlock);
        }
      }
    }
    return block;
  }
  // determineBlockType: Determine the type of block based on its keyword
  determineBlockType(keyword) {
    return blockTypeMap[keyword] || "custom";
  }
  // parseBlockArguments: Parse arguments for a block based on its type
  parseBlockArguments() {
    const args = [];
    while (!this.isAtEnd()) {
      this.skipIrrelevant();
      if (this.isAtEnd()) break;
      if (this.match("INDENT" /* INDENT */) || this.match("DEDENT" /* DEDENT */) || this.match("KEYWORD" /* KEYWORD */) && this.isBlockStart()) {
        break;
      }
      if (this.match("STRING" /* STRING */)) {
        args.push(this.advance().value);
      } else if (this.match("NUMBER" /* NUMBER */)) {
        args.push(parseFloat(this.advance().value));
      } else if (this.match("IDENTIFIER" /* IDENTIFIER */)) {
        args.push(this.advance().value);
      } else if (this.match("PARENTHESIS_OPEN" /* PARENTHESIS_OPEN */)) {
        args.push(this.parseExpression());
      } else if (this.match("BRACKET_OPEN" /* BRACKET_OPEN */)) {
        const listValues = this.parseListLiteral();
        args.push({
          type: "operators",
          name: "list",
          args: listValues
        });
      } else if (this.match("KEYWORD" /* KEYWORD */)) {
        args.push(this.advance().value);
      } else if (this.match("OPERATOR" /* OPERATOR */)) {
        args.push(this.advance().value);
      } else {
        this.advance();
      }
    }
    return args;
  }
  // parseExpression: Parse a parenthesized expression
  parseExpression() {
    this.consume("PARENTHESIS_OPEN" /* PARENTHESIS_OPEN */, "Expected '('");
    const args = [];
    while (!this.isAtEnd() && !this.match("PARENTHESIS_CLOSE" /* PARENTHESIS_CLOSE */)) {
      if (this.match("STRING" /* STRING */)) {
        args.push(this.advance().value);
      } else if (this.match("NUMBER" /* NUMBER */)) {
        args.push(parseFloat(this.advance().value));
      } else if (this.match("IDENTIFIER" /* IDENTIFIER */)) {
        args.push(this.advance().value);
      } else if (this.match("OPERATOR" /* OPERATOR */)) {
        args.push(this.advance().value);
      } else if (this.match("PARENTHESIS_OPEN" /* PARENTHESIS_OPEN */)) {
        args.push(this.parseExpression());
      } else {
        this.advance();
      }
    }
    this.consume("PARENTHESIS_CLOSE" /* PARENTHESIS_CLOSE */, "Expected ')'");
    return {
      type: "operators",
      name: "expression",
      args
    };
  }
  // parseListLiteral: Parse a list literal [value1, value2, ...]
  parseListLiteral() {
    this.consume("BRACKET_OPEN" /* BRACKET_OPEN */, "Expected '['");
    const values = [];
    while (!this.isAtEnd() && !this.match("BRACKET_CLOSE" /* BRACKET_CLOSE */)) {
      if (this.match("COMMA" /* COMMA */)) {
        this.advance();
        continue;
      }
      if (this.match("STRING" /* STRING */)) {
        values.push(this.advance().value);
      } else if (this.match("NUMBER" /* NUMBER */)) {
        values.push(parseFloat(this.advance().value));
      } else if (this.match("IDENTIFIER" /* IDENTIFIER */)) {
        values.push(this.advance().value);
      } else {
        this.advance();
      }
    }
    this.consume("BRACKET_CLOSE" /* BRACKET_CLOSE */, "Expected ']'");
    return values;
  }
  // parseVariableDeclaration: Parses a variable declaration.
  parseVariableDeclaration(program) {
    this.advance();
    const variableName = this.consume("IDENTIFIER" /* IDENTIFIER */, "Expected variable name").value;
    let initialValue = 0;
    if (!this.isAtEnd() && this.match("OPERATOR" /* OPERATOR */) && this.current.value === "=") {
      this.advance();
      if (this.match("NUMBER" /* NUMBER */)) {
        initialValue = parseFloat(this.advance().value);
      } else if (this.match("STRING" /* STRING */)) {
        initialValue = this.advance().value;
      } else if (this.match("IDENTIFIER" /* IDENTIFIER */)) {
        initialValue = this.advance().value;
      } else {
        this.advance();
      }
    }
    program.variables.set(variableName, initialValue);
    while (!this.isAtEnd() && !this.match("NEWLINE" /* NEWLINE */)) {
      this.advance();
    }
  }
  // parseListDeclaration: Parses a list declaration.
  parseListDeclaration(program) {
    this.advance();
    const listName = this.consume("IDENTIFIER" /* IDENTIFIER */, "Expected list name").value;
    let listValues = [];
    if (!this.isAtEnd() && this.match("OPERATOR" /* OPERATOR */) && this.current.value === "=") {
      this.advance();
      if (this.match("BRACKET_OPEN" /* BRACKET_OPEN */)) {
        listValues = this.parseListLiteral();
      }
    }
    program.lists.set(listName, listValues);
    while (!this.isAtEnd() && !this.match("NEWLINE" /* NEWLINE */)) {
      this.advance();
    }
  }
  // parseCustomBlockDefinition: Parse a custom block definition (procedure).
  parseCustomBlockDefinition(program) {
    this.advance();
    const blockName = this.consume("IDENTIFIER" /* IDENTIFIER */, "Expected custom block name").value;
    const parameters = [];
    if (!this.isAtEnd() && this.match("PARENTHESIS_OPEN" /* PARENTHESIS_OPEN */)) {
      this.advance();
      while (!this.isAtEnd() && !this.match("PARENTHESIS_CLOSE" /* PARENTHESIS_CLOSE */)) {
        if (this.match("IDENTIFIER" /* IDENTIFIER */)) {
          parameters.push(this.advance().value);
        } else if (this.match("COMMA" /* COMMA */)) {
          this.advance();
        } else {
          this.advance();
        }
      }
      if (!this.isAtEnd()) {
        this.advance();
      }
    }
    const customScript = {
      blocks: []
    };
    this.skipIrrelevant();
    if (!this.isAtEnd() && this.match("INDENT" /* INDENT */)) {
      this.advance();
      const oldIndentLevel = this.indentLevel;
      this.indentLevel = 1;
      this.parseScriptBlocks(customScript);
      this.indentLevel = oldIndentLevel;
    }
    customScript.blocks.unshift({
      type: "custom",
      name: "define",
      args: [blockName, ...parameters]
    });
    program.scripts.push(customScript);
  }
};

// src/lib/codeGenerator.ts
var CodeGenerator = class {
  constructor(program) {
    // The generated JavaScript code output
    this.output = "";
    // HTML output for browser display
    this.htmlOutput = "";
    // Current indentation level for code formatting
    this.indent = 0;
    // Track if we're inside a function definition
    this.inFunction = false;
    // Custom procedures with their parameter lists
    this.procedures = /* @__PURE__ */ new Map();
    /**
     * Flag to track if pen methods have been added to the runtime
     */
    this.penMethodsAdded = false;
    this.program = program;
  }
  /**
   * Main method to generate the JavaScript and HTML code
   * @returns Object containing JavaScript code and HTML
   */
  generate() {
    this.collectProcedures();
    this.generateJavaScript();
    this.generateHTML();
    return {
      js: this.output,
      html: this.htmlOutput
    };
  }
  /**
   * Collects all custom procedures defined in the program
   */
  collectProcedures() {
    this.program.scripts.forEach((script) => {
      script.blocks.forEach((block) => {
        this.findProceduresInBlock(block);
      });
    });
  }
  /**
   * Recursively searches for procedure definitions in blocks
   */
  findProceduresInBlock(block) {
    if (block.type === "custom" && block.name === "defineFunction") {
      const procedureName = block.args[0];
      const parameters = block.args.slice(1);
      this.procedures.set(procedureName, parameters);
    }
    if (block.next) {
      this.findProceduresInBlock(block.next);
    }
  }
  /**
   * Generates the JavaScript code from the AST
   */
  generateJavaScript() {
    this.generateRuntimeSupport();
    this.generateVariablesCode();
    this.generateListsCode();
    this.generateProceduresCode();
    this.generateScriptsCode();
  }
  /**
   * Generates the runtime support functions
   */
  generateRuntimeSupport() {
    this.output = `// Generated Scratch-like JavaScript code
`;
    this.output += `// Runtime support functions
`;
    this.output += `const scratchRuntime = {
`;
    this.output += `    sprites: {},
`;
    this.output += `    stage: { width: 480, height: 360 },
`;
    this.output += `    currentSprite: 'Sprite1',
`;
    this.output += `    variables: {},
`;
    this.output += `    lists: {},
`;
    this.output += `    procedures: {},
`;
    this.output += `    events: {},
`;
    this.output += `    answer: '',
`;
    this.output += `    broadcasts: {},
`;
    this.output += `    init: function() {
`;
    this.output += `        // Create visual stage (deferred until DOM is ready)
`;
    this.output += `        const setupUI = () => {
`;
    this.output += `            const stageDiv = document.getElementById('stage');
`;
    this.output += `            if (stageDiv) {
`;
    this.output += `                stageDiv.style.width = this.stage.width + 'px';
`;
    this.output += `                stageDiv.style.height = this.stage.height + 'px';
`;
    this.output += `                stageDiv.style.backgroundColor = this.stage.backgroundColor;
`;
    this.output += `                stageDiv.style.position = 'relative';
`;
    this.output += `                stageDiv.style.overflow = 'hidden';
`;
    this.output += `                stageDiv.style.border = '2px solid black';
`;
    this.output += `
`;
    this.output += `                // Create sprite element
`;
    this.output += `                const spriteDiv = document.createElement('div');
`;
    this.output += `                spriteDiv.id = 'sprite-Sprite1';
`;
    this.output += `                spriteDiv.style.position = 'absolute';
`;
    this.output += `                spriteDiv.style.width = '30px';
`;
    this.output += `                spriteDiv.style.height = '30px';
`;
    this.output += `                spriteDiv.style.backgroundColor = 'red';
`;
    this.output += `                spriteDiv.style.borderRadius = '50%';
`;
    this.output += `                spriteDiv.style.left = (this.sprites.Sprite1.x + this.stage.width/2) + 'px';
`;
    this.output += `                spriteDiv.style.bottom = (this.sprites.Sprite1.y + this.stage.height/2) + 'px';
`;
    this.output += `                spriteDiv.style.transform = 'rotate(0deg)';
`;
    this.output += `                stageDiv.appendChild(spriteDiv);
`;
    this.output += `            }
`;
    this.output += `        };
`;
    this.output += `
`;
    this.output += `        if (document.readyState === 'loading') {
`;
    this.output += `            document.addEventListener('DOMContentLoaded', setupUI);
`;
    this.output += `        } else {
`;
    this.output += `            setupUI();
`;
    this.output += `        }
`;
    this.output += `            },
`;
    this.output += `            move: function(steps) {
`;
    this.output += `                const radians = this.direction * Math.PI / 180;
`;
    this.output += `                this.x += steps * Math.cos(radians);
`;
    this.output += `                this.y += steps * Math.sin(radians);
`;
    this.output += `                
`;
    this.output += `                // Update sprite position in the DOM
`;
    this.output += `                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                if (spriteDiv) {
`;
    this.output += `                    spriteDiv.style.left = (this.x + scratchRuntime.stage.width/2) + 'px';
`;
    this.output += `                    spriteDiv.style.bottom = (this.y + scratchRuntime.stage.height/2) + 'px';
`;
    this.output += `                }
`;
    this.output += `                console.log(\`\${scratchRuntime.currentSprite} moved to (\${Math.floor(this.x)}, \${Math.floor(this.y)})\`);
`;
    this.output += `            },
`;
    this.output += `            turnRight: function(degrees) {
`;
    this.output += `                this.direction = (this.direction + degrees) % 360;
`;
    this.output += `                console.log(\`\${scratchRuntime.currentSprite} turned right \${degrees} degrees to \${this.direction} degrees\`);
`;
    this.output += `                // Update sprite rotation in the DOM
`;
    this.output += `                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                if (spriteDiv) {
`;
    this.output += `                    spriteDiv.style.transform = \`rotate(\${this.direction - 90}deg)\`;
`;
    this.output += `                }
`;
    this.output += `            },
`;
    this.output += `            turnLeft: function(degrees) {
`;
    this.output += `                this.direction = (this.direction - degrees) % 360;
`;
    this.output += `                if (this.direction < 0) this.direction += 360;
`;
    this.output += `                console.log(\`\${scratchRuntime.currentSprite} turned left \${degrees} degrees to \${this.direction} degrees\`);
`;
    this.output += `                // Update sprite rotation in the DOM
`;
    this.output += `                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                if (spriteDiv) {
`;
    this.output += `                    spriteDiv.style.transform = \`rotate(\${this.direction - 90}deg)\`;
`;
    this.output += `                }
`;
    this.output += `            },
`;
    this.output += `            pointInDirection: function(direction) {
`;
    this.output += `                this.direction = direction % 360;
`;
    this.output += `                if (this.direction < 0) this.direction += 360;
`;
    this.output += `                console.log(\`\${scratchRuntime.currentSprite} now pointing in direction \${this.direction} degrees\`);
`;
    this.output += `                // Update sprite rotation in the DOM
`;
    this.output += `                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                if (spriteDiv) {
`;
    this.output += `                    spriteDiv.style.transform = \`rotate(\${this.direction - 90}deg)\`;
`;
    this.output += `                }
`;
    this.output += `            },
`;
    this.output += `            goTo: function(x, y) {
`;
    this.output += `                this.x = x;
`;
    this.output += `                this.y = y;
`;
    this.output += `                // Update sprite position in the DOM
`;
    this.output += `                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                if (spriteDiv) {
`;
    this.output += `                    spriteDiv.style.left = (this.x + scratchRuntime.stage.width/2) + 'px';
`;
    this.output += `                    spriteDiv.style.bottom = (this.y + scratchRuntime.stage.height/2) + 'px';
`;
    this.output += `                }
`;
    this.output += `                console.log(\`\${scratchRuntime.currentSprite} went to (\${Math.floor(this.x)}, \${Math.floor(this.y)})\`);
`;
    this.output += `            },
`;
    this.output += `            goToSprite: function(spriteName) {
`;
    this.output += `                if (scratchRuntime.sprites[spriteName]) {
`;
    this.output += `                    this.x = scratchRuntime.sprites[spriteName].x;
`;
    this.output += `                    this.y = scratchRuntime.sprites[spriteName].y;
`;
    this.output += `                    // Update sprite position in the DOM
`;
    this.output += `                    const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                    if (spriteDiv) {
`;
    this.output += `                        spriteDiv.style.left = (this.x + scratchRuntime.stage.width/2) + 'px';
`;
    this.output += `                        spriteDiv.style.bottom = (this.y + scratchRuntime.stage.height/2) + 'px';
`;
    this.output += `                    }
`;
    this.output += `                    console.log(\`\${scratchRuntime.currentSprite} went to \${spriteName} at (\${Math.floor(this.x)}, \${Math.floor(this.y)})\`);
`;
    this.output += `                }
`;
    this.output += `            },
`;
    this.output += `            hide: function() {
`;
    this.output += `                this.visible = false;
`;
    this.output += `                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                if (spriteDiv) {
`;
    this.output += `                    spriteDiv.style.display = 'none';
`;
    this.output += `                }
`;
    this.output += `                console.log(\`\${scratchRuntime.currentSprite} is now hidden\`);
`;
    this.output += `            },
`;
    this.output += `            show: function() {
`;
    this.output += `                this.visible = true;
`;
    this.output += `                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                if (spriteDiv) {
`;
    this.output += `                    spriteDiv.style.display = 'block';
`;
    this.output += `                }
`;
    this.output += `                console.log(\`\${scratchRuntime.currentSprite} is now shown\`);
`;
    this.output += `            },
`;
    this.output += `            changeSize: function(change) {
`;
    this.output += `                this.size += change;
`;
    this.output += `                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                if (spriteDiv) {
`;
    this.output += `                    spriteDiv.style.transform = \`rotate(\${this.direction - 90}deg) scale(\${this.size/100})\`;
`;
    this.output += `                }
`;
    this.output += `                console.log(\`\${scratchRuntime.currentSprite} size changed to \${this.size}%\`);
`;
    this.output += `            },
`;
    this.output += `            setSize: function(size) {
`;
    this.output += `                this.size = size;
`;
    this.output += `                const spriteDiv = document.getElementById(\`sprite-\${scratchRuntime.currentSprite}\`);
`;
    this.output += `                if (spriteDiv) {
`;
    this.output += `                    spriteDiv.style.transform = \`rotate(\${this.direction - 90}deg) scale(\${this.size/100})\`;
`;
    this.output += `                }
`;
    this.output += `                console.log(\`\${scratchRuntime.currentSprite} size set to \${this.size}%\`);
`;
    this.output += `            }
`;
    this.output += `        };

`;
    this.output += `        // Register event handlers
`;
    this.output += `        document.addEventListener('keydown', (e) => {
`;
    this.output += `            const keyEvent = \`keyPressed\${e.key}\`;
`;
    this.output += `            if (this.events[keyEvent] && Array.isArray(this.events[keyEvent])) {
`;
    this.output += `                this.events[keyEvent].forEach(callback => callback());
`;
    this.output += `            }
`;
    this.output += `        });

`;
    this.output += `        // Create visual stage
`;
    this.output += `        const stageDiv = document.getElementById('stage');
`;
    this.output += `        if (stageDiv) {
`;
    this.output += `            stageDiv.style.width = this.stage.width + 'px';
`;
    this.output += `            stageDiv.style.height = this.stage.height + 'px';
`;
    this.output += `            stageDiv.style.backgroundColor = this.stage.backgroundColor;
`;
    this.output += `            stageDiv.style.position = 'relative';
`;
    this.output += `            stageDiv.style.overflow = 'hidden';
`;
    this.output += `            stageDiv.style.border = '2px solid black';

`;
    this.output += `            // Create sprite element
`;
    this.output += `            const spriteDiv = document.createElement('div');
`;
    this.output += `            spriteDiv.id = 'sprite-Sprite1';
`;
    this.output += `            spriteDiv.style.position = 'absolute';
`;
    this.output += `            spriteDiv.style.width = '30px';
`;
    this.output += `            spriteDiv.style.height = '30px';
`;
    this.output += `            spriteDiv.style.backgroundColor = 'red';
`;
    this.output += `            spriteDiv.style.borderRadius = '50%';
`;
    this.output += `            spriteDiv.style.left = (this.sprites.Sprite1.x + this.stage.width/2) + 'px';
`;
    this.output += `            spriteDiv.style.bottom = (this.sprites.Sprite1.y + this.stage.height/2) + 'px';
`;
    this.output += `            spriteDiv.style.transform = 'rotate(0deg)';
`;
    this.output += `            stageDiv.appendChild(spriteDiv);
`;
    this.output += `        }
`;
    this.output += `    },

`;
    this.output += `    // Broadcasting system
`;
    this.output += `    broadcast: function(message) {
`;
    this.output += `        console.log(\`Broadcasting: \${message}\`);
`;
    this.output += `        if (this.broadcasts[message] && Array.isArray(this.broadcasts[message])) {
`;
    this.output += `            this.broadcasts[message].forEach(callback => callback());
`;
    this.output += `        }
`;
    this.output += `    },

`;
    this.output += `    // Register a broadcast receiver
`;
    this.output += `    onBroadcast: function(message, callback) {
`;
    this.output += `        if (!this.broadcasts[message]) {
`;
    this.output += `            this.broadcasts[message] = [];
`;
    this.output += `        }
`;
    this.output += `        this.broadcasts[message].push(callback);
`;
    this.output += `    },

`;
    this.output += `    // Register an event handler
`;
    this.output += `    onEvent: function(event, callback) {
`;
    this.output += `        if (!this.events[event]) {
`;
    this.output += `            this.events[event] = [];
`;
    this.output += `        }
`;
    this.output += `        this.events[event].push(callback);
`;
    this.output += `    },

`;
    this.output += `    // Ask a question and get an answer
`;
    this.output += `    ask: async function(question) {
`;
    this.output += `        return new Promise((resolve) => {
`;
    this.output += `            const askDiv = document.createElement('div');
`;
    this.output += `            askDiv.id = 'ask-prompt';
`;
    this.output += `            askDiv.style.position = 'absolute';
`;
    this.output += `            askDiv.style.bottom = '10px';
`;
    this.output += `            askDiv.style.left = '10px';
`;
    this.output += `            askDiv.style.backgroundColor = 'white';
`;
    this.output += `            askDiv.style.border = '2px solid black';
`;
    this.output += `            askDiv.style.padding = '10px';
`;
    this.output += `            askDiv.style.width = 'calc(100% - 40px)';
`;
    this.output += `            askDiv.style.zIndex = '10';

`;
    this.output += `            const questionText = document.createElement('div');
`;
    this.output += `            questionText.textContent = question;
`;
    this.output += `            askDiv.appendChild(questionText);

`;
    this.output += `            const inputField = document.createElement('input');
`;
    this.output += `            inputField.type = 'text';
`;
    this.output += `            inputField.style.width = '100%';
`;
    this.output += `            inputField.style.marginTop = '5px';
`;
    this.output += `            askDiv.appendChild(inputField);

`;
    this.output += `            const submitButton = document.createElement('button');
`;
    this.output += `            submitButton.textContent = 'Answer';
`;
    this.output += `            submitButton.style.marginTop = '5px';
`;
    this.output += `            askDiv.appendChild(submitButton);

`;
    this.output += `            submitButton.onclick = function() {
`;
    this.output += `                scratchRuntime.answer = inputField.value;
`;
    this.output += `                document.getElementById('stage').removeChild(askDiv);
`;
    this.output += `                resolve(scratchRuntime.answer);
`;
    this.output += `            };

`;
    this.output += `            // Allow pressing Enter to submit
`;
    this.output += `            inputField.addEventListener('keypress', function(e) {
`;
    this.output += `                if (e.key === 'Enter') {
`;
    this.output += `                    submitButton.click();
`;
    this.output += `                }
`;
    this.output += `            });

`;
    this.output += `            document.getElementById('stage').appendChild(askDiv);
`;
    this.output += `            inputField.focus();
`;
    this.output += `        });
`;
    this.output += `    }
`;
    this.output += `};

`;
    this.output += `// Initialize the runtime
`;
    this.output += `scratchRuntime.init();

`;
  }
  /**
   * Generates code for variables
   */
  generateVariablesCode() {
    this.output += `// Variables
`;
    if (this.program.variables.size > 0) {
      this.program.variables.forEach((value, name) => {
        if (typeof value === "number") {
          this.output += `scratchRuntime.variables["${name}"] = ${value};
`;
        } else if (typeof value === "string") {
          this.output += `scratchRuntime.variables["${name}"] = "${value}";
`;
        } else {
          this.output += `scratchRuntime.variables["${name}"] = ${JSON.stringify(value)};
`;
        }
      });
    } else {
      this.output += `// No variables defined
`;
    }
    this.output += `
`;
  }
  /**
   * Generates code for lists
   */
  generateListsCode() {
    this.output += `// Lists
`;
    if (this.program.lists.size > 0) {
      this.program.lists.forEach((values, name) => {
        const formattedValues = values.map((v) => typeof v === "number" ? v : `"${v}"`).join(", ");
        this.output += `scratchRuntime.lists["${name}"] = [${formattedValues}];
`;
      });
    } else {
      this.output += `// No lists defined
`;
    }
    this.output += `
`;
  }
  /**
   * Generates code for custom procedures
   */
  generateProceduresCode() {
    this.output += `// Custom Procedures
`;
    if (this.procedures.size > 0) {
      this.procedures.forEach((params, name) => {
        const paramList = params.join(", ");
        this.output += `scratchRuntime.procedures["${name}"] = function(${paramList}) {
`;
        this.indent++;
        this.write(`// Function body will be generated during script processing
`);
        this.indent--;
        this.output += `};

`;
      });
    } else {
      this.output += `// No procedures defined
`;
    }
    this.output += `
`;
  }
  /**
   * Generates code for all scripts
   */
  generateScriptsCode() {
    this.output += `// Scripts
`;
    this.program.scripts.forEach((script, index) => {
      this.output += `// Script ${index + 1}
`;
      script.blocks.forEach((block) => {
        this.generateBlockCode(block);
      });
      this.output += `
`;
    });
  }
  /**
   * Generates code for a single block and its nested structure
   */
  generateBlockCode(block) {
    switch (block.type) {
      case "event":
        this.generateEventBlock(block);
        break;
      case "motion":
        this.generateMotionBlock(block);
        break;
      case "looks":
        this.generateLooksBlock(block);
        break;
      case "sound":
        this.generateSoundBlock(block);
        break;
      case "control":
        this.generateControlBlock(block);
        break;
      case "sensing":
        this.generateSensingBlock(block);
        break;
      case "operators":
        this.write(this.generateOperatorsBlock(block));
        break;
      case "variables":
        this.generateVariablesBlock(block);
        break;
      case "pen":
        this.generatePenBlock(block);
        break;
      case "custom":
        this.generateCustomBlock(block);
        break;
      default:
        this.write(`// Unsupported block type: ${block.type}, name: ${block.name}
`);
    }
  }
  /**
   * Generates code for event blocks (when flag clicked, when key pressed, etc.)
   */
  generateEventBlock(block) {
    if (block.name === "when" && block.args[0] === "flagClicked") {
      this.write(`// When green flag clicked
`);
      this.write(`document.addEventListener('DOMContentLoaded', async function() {
`);
      this.indent++;
      if (block.next) {
        this.generateBlockCode(block.next);
      }
      this.indent--;
      this.write(`});

`);
    } else if (block.name === "when" && typeof block.args[0] === "string" && block.args[0].includes("keyPressed")) {
      const key = block.args[0].replace("keyPressed", "").toLowerCase();
      this.write(`// When ${key} key pressed
`);
      this.write(`scratchRuntime.onEvent("keyPressed${key}", async function() {
`);
      this.indent++;
      if (block.next) {
        this.generateBlockCode(block.next);
      }
      this.indent--;
      this.write(`});

`);
    } else if (block.name === "whenReceived") {
      const message = this.formatArg(block.args[0]);
      this.write(`// When I receive ${message}
`);
      this.write(`scratchRuntime.onBroadcast(${message}, async function() {
`);
      this.indent++;
      if (block.next) {
        this.generateBlockCode(block.next);
      }
      this.indent--;
      this.write(`});

`);
    } else if (block.name === "broadcast") {
      const message = this.formatArg(block.args[0]);
      this.write(`scratchRuntime.broadcast(${message});
`);
    } else if (block.name === "broadcastAndWait") {
      const message = this.formatArg(block.args[0]);
      this.write(`// Broadcast and wait (simplified implementation)
`);
      this.write(`scratchRuntime.broadcast(${message});
`);
      this.write(`await new Promise(resolve => setTimeout(resolve, 100));
`);
    }
  }
  /**
   * Generates code for motion blocks (move, turn, go to, etc.)
   */
  generateMotionBlock(block) {
    const sprite = `scratchRuntime.sprites[scratchRuntime.currentSprite]`;
    switch (block.name) {
      case "move":
        const steps = this.formatArg(block.args[0]);
        this.write(`${sprite}.move(${steps});
`);
        break;
      case "turnRight":
        const degreesRight = this.formatArg(block.args[0]);
        this.write(`${sprite}.turnRight(${degreesRight});
`);
        break;
      case "turnLeft":
        const degreesLeft = this.formatArg(block.args[0]);
        this.write(`${sprite}.turnLeft(${degreesLeft});
`);
        break;
      case "pointInDirection":
        const direction = this.formatArg(block.args[0]);
        this.write(`${sprite}.pointInDirection(${direction});
`);
        break;
      case "goTo":
        if (block.args[0] === "random") {
          this.write(`// Go to random position
`);
          this.write(
            `const randomX = Math.floor(Math.random() * scratchRuntime.stage.width) - (scratchRuntime.stage.width / 2);
`
          );
          this.write(
            `const randomY = Math.floor(Math.random() * scratchRuntime.stage.height) - (scratchRuntime.stage.height / 2);
`
          );
          this.write(`${sprite}.goTo(randomX, randomY);
`);
        } else if (typeof block.args[0] === "string" && block.args[0].startsWith("sprite:")) {
          const targetSprite = block.args[0].replace("sprite:", "");
          this.write(`${sprite}.goToSprite("${targetSprite}");
`);
        } else {
          const x2 = this.formatArg(block.args[0]);
          const y2 = this.formatArg(block.args[1]);
          this.write(`${sprite}.goTo(${x2}, ${y2});
`);
        }
        break;
      case "setX":
        const x = this.formatArg(block.args[0]);
        this.write(`${sprite}.goTo(${x}, ${sprite}.y);
`);
        break;
      case "setY":
        const y = this.formatArg(block.args[0]);
        this.write(`${sprite}.goTo(${sprite}.x, ${y});
`);
        break;
      case "changeX":
        const changeX = this.formatArg(block.args[0]);
        this.write(`${sprite}.goTo(${sprite}.x + ${changeX}, ${sprite}.y);
`);
        break;
      case "changeY":
        const changeY = this.formatArg(block.args[0]);
        this.write(`${sprite}.goTo(${sprite}.x, ${sprite}.y + ${changeY});
`);
        break;
      case "glide":
        const seconds = this.formatArg(block.args[0]);
        const targetX = this.formatArg(block.args[1]);
        const targetY = this.formatArg(block.args[2]);
        this.write(`// Glide to position
`);
        this.write(`const startX = ${sprite}.x;
`);
        this.write(`const startY = ${sprite}.y;
`);
        this.write(`const targetX = ${targetX};
`);
        this.write(`const targetY = ${targetY};
`);
        this.write(`const duration = ${seconds} * 1000;
`);
        this.write(`const startTime = Date.now();

`);
        this.write(`await new Promise(resolve => {
`);
        this.indent++;
        this.write(`function animate() {
`);
        this.indent++;
        this.write(`const elapsed = Date.now() - startTime;
`);
        this.write(`const progress = Math.min(elapsed / duration, 1);
`);
        this.write(`const newX = startX + (targetX - startX) * progress;
`);
        this.write(`const newY = startY + (targetY - startY) * progress;
`);
        this.write(`${sprite}.goTo(newX, newY);

`);
        this.write(`if (progress < 1) {
`);
        this.indent++;
        this.write(`requestAnimationFrame(animate);
`);
        this.indent--;
        this.write(`} else {
`);
        this.indent++;
        this.write(`resolve();
`);
        this.indent--;
        this.write(`}
`);
        this.indent--;
        this.write(`}

`);
        this.write(`animate();
`);
        this.indent--;
        this.write(`});
`);
        break;
      default:
        this.write(`// Unsupported motion block: ${block.name}
`);
    }
    if (block.next) {
      this.generateBlockCode(block.next);
    }
  }
  /**
   * Generates code for looks blocks (say, change size, etc.)
   */
  generateLooksBlock(block) {
    const sprite = `scratchRuntime.sprites[scratchRuntime.currentSprite]`;
    switch (block.name) {
      case "say":
        const message = this.formatArg(block.args[0]);
        if (block.args.length > 1) {
          const seconds = this.formatArg(block.args[1]);
          this.write(`${sprite}.say(${message}, ${seconds});
`);
        } else {
          this.write(`${sprite}.say(${message});
`);
        }
        break;
      case "think":
        const thought = this.formatArg(block.args[0]);
        if (block.args.length > 1) {
          const seconds = this.formatArg(block.args[1]);
          this.write(`// Think is implemented the same as say but with different styling
`);
          this.write(`${sprite}.say("\u{1F4AD} " + ${thought}, ${seconds});
`);
        } else {
          this.write(`${sprite}.say("\u{1F4AD} " + ${thought});
`);
        }
        break;
      case "show":
        this.write(`${sprite}.show();
`);
        break;
      case "hide":
        this.write(`${sprite}.hide();
`);
        break;
      case "changeSize":
        const sizeChange = this.formatArg(block.args[0]);
        this.write(`${sprite}.changeSize(${sizeChange});
`);
        break;
      case "setSize":
        const size = this.formatArg(block.args[0]);
        this.write(`${sprite}.setSize(${size});
`);
        break;
      case "switchCostume":
        const costume = this.formatArg(block.args[0]);
        this.write(`// Switch costume (simplified implementation)
`);
        this.write(`console.log(\`Switching costume to \${${costume}}\`);
`);
        break;
      default:
        this.write(`// Unsupported looks block: ${block.name}
`);
    }
    if (block.next) {
      this.generateBlockCode(block.next);
    }
  }
  /**
   * Generates code for sound blocks (play sound, change volume, etc.)
   */
  generateSoundBlock(block) {
    switch (block.name) {
      case "playSound":
        const sound = this.formatArg(block.args[0]);
        this.write(`// Play sound (simplified implementation)
`);
        this.write(`console.log(\`Playing sound: \${${sound}}\`);
`);
        break;
      case "stopAllSounds":
        this.write(`// Stop all sounds (simplified implementation)
`);
        this.write(`console.log("Stopping all sounds");
`);
        break;
      case "changeVolume":
        const volumeChange = this.formatArg(block.args[0]);
        this.write(`// Change volume (simplified implementation)
`);
        this.write(
          `scratchRuntime.stage.volume = Math.max(0, Math.min(100, scratchRuntime.stage.volume + ${volumeChange}));
`
        );
        this.write(`console.log(\`Volume changed to \${scratchRuntime.stage.volume}%\`);
`);
        break;
      case "setVolume":
        const volume = this.formatArg(block.args[0]);
        this.write(`// Set volume (simplified implementation)
`);
        this.write(`scratchRuntime.stage.volume = Math.max(0, Math.min(100, ${volume}));
`);
        this.write(`console.log(\`Volume set to \${scratchRuntime.stage.volume}%\`);
`);
        break;
      default:
        this.write(`// Unsupported sound block: ${block.name}
`);
    }
    if (block.next) {
      this.generateBlockCode(block.next);
    }
  }
  /**
   * Generates code for control blocks (wait, repeat, if, etc.)
   */
  generateControlBlock(block) {
    switch (block.name) {
      case "wait":
        const seconds = this.formatArg(block.args[0]);
        this.write(`await new Promise(resolve => setTimeout(resolve, ${seconds} * 1000));
`);
        if (block.next) {
          this.generateBlockCode(block.next);
        }
        break;
      case "repeat":
        const count = this.formatArg(block.args[0]);
        this.write(`// Repeat loop
`);
        this.write(`for (let i = 0; i < ${count}; i++) {
`);
        this.indent++;
        let nextAfterRepeat = void 0;
        let bodyBlock;
        if (block.args.length > 1 && typeof block.args[1] === "object") {
          bodyBlock = block.args[1];
        } else if (block.next) {
          bodyBlock = block.next;
          nextAfterRepeat = block.next.next;
        }
        if (bodyBlock) {
          this.generateBlockCode(bodyBlock);
        }
        this.indent--;
        this.write(`}
`);
        if (!nextAfterRepeat && block.next) {
          this.generateBlockCode(block.next);
        } else if (nextAfterRepeat) {
          this.generateBlockCode(nextAfterRepeat);
        }
        break;
      case "forever":
        this.write(`// Forever loop (using setInterval for browser compatibility)
`);
        this.write(`(async function forever() {
`);
        this.indent++;
        if (block.args.length > 0 && typeof block.args[0] === "object") {
          this.generateBlockCode(block.args[0]);
        } else if (block.next) {
          this.generateBlockCode(block.next);
          return;
        }
        this.write(`setTimeout(forever, 10); // Small delay to prevent UI freezing
`);
        this.indent--;
        this.write(`})();
`);
        if (block.next) {
          this.generateBlockCode(block.next);
        }
        break;
      case "if":
        const condition = this.formatArg(block.args[0]);
        this.write(`// If statement
`);
        this.write(`if (${condition}) {
`);
        this.indent++;
        if (block.args.length > 1 && typeof block.args[1] === "object") {
          this.generateBlockCode(block.args[1]);
        } else if (block.next) {
          this.generateBlockCode(block.next);
        }
        this.indent--;
        this.write(`}
`);
        if (block.next) {
          this.generateBlockCode(block.next);
        }
        break;
      case "ifElse":
        const ifCondition = this.formatArg(block.args[0]);
        const thenBlock = block.args[1];
        const elseBlock = block.args[2];
        this.write(`// If-Else statement
`);
        this.write(`if (${ifCondition}) {
`);
        this.indent++;
        if (thenBlock) {
          this.generateBlockCode(thenBlock);
        }
        this.indent--;
        this.write(`} else {
`);
        this.indent++;
        if (elseBlock) {
          this.generateBlockCode(elseBlock);
        }
        this.indent--;
        this.write(`}
`);
        if (block.next) {
          this.generateBlockCode(block.next);
        }
        break;
      case "waitUntil":
        const waitCondition = this.formatArg(block.args[0]);
        this.write(`// Wait until condition is true
`);
        this.write(`await new Promise(resolve => {
`);
        this.indent++;
        this.write(`function checkCondition() {
`);
        this.indent++;
        this.write(`if (${waitCondition}) {
`);
        this.indent++;
        this.write(`resolve();
`);
        this.indent--;
        this.write(`} else {
`);
        this.indent++;
        this.write(`setTimeout(checkCondition, 50);
`);
        this.indent--;
        this.write(`}
`);
        this.indent--;
        this.write(`}
`);
        this.write(`checkCondition();
`);
        this.indent--;
        this.write(`});
`);
        if (block.next) {
          this.generateBlockCode(block.next);
        }
        break;
      case "repeatUntil":
        const repeatCondition = this.formatArg(block.args[0]);
        this.write(`// Repeat until condition is true
`);
        this.write(`while (!(${repeatCondition})) {
`);
        this.indent++;
        if (block.args.length > 1 && typeof block.args[1] === "object") {
          this.generateBlockCode(block.args[1]);
        } else if (block.next) {
          this.generateBlockCode(block.next);
        }
        this.write(`await new Promise(resolve => setTimeout(resolve, 10));
`);
        this.indent--;
        this.write(`}
`);
        if (block.next) {
          this.generateBlockCode(block.next);
        }
        break;
      case "stop":
        const target = block.args[0];
        if (target === "all") {
          this.write(`// Stop all (simplified implementation - just returns from current execution)
`);
          this.write(`return;
`);
        } else if (target === "thisScript") {
          this.write(`// Stop this script
`);
          this.write(`return;
`);
        } else {
          this.write(`// Stop other scripts (simplified implementation)
`);
          this.write(`console.log("Stop other scripts requested");
`);
        }
        break;
      default:
        this.write(`// Unsupported control block: ${block.name}
`);
    }
  }
  /**
   * Generates code for sensing blocks (ask, touching, etc.)
   */
  generateSensingBlock(block) {
    switch (block.name) {
      case "ask":
        const question = this.formatArg(block.args[0]);
        this.write(`// Ask a question and wait for answer
`);
        this.write(`await scratchRuntime.ask(${question});
`);
        break;
      case "answer":
        this.write(`scratchRuntime.answer`);
        break;
      case "touching":
        const target = this.formatArg(block.args[0]);
        this.write(`// Touching detection (simplified implementation)
`);
        this.write(`/* Simulating touch detection */
`);
        if (typeof block.args[0] === "string" && block.args[0].startsWith("sprite:")) {
          const targetSprite = block.args[0].replace("sprite:", "");
          this.write(`((sprite) => {
`);
          this.indent++;
          this.write(`const dx = sprite.x - scratchRuntime.sprites["${targetSprite}"].x;
`);
          this.write(`const dy = sprite.y - scratchRuntime.sprites["${targetSprite}"].y;
`);
          this.write(`return Math.sqrt(dx*dx + dy*dy) < 30; // Simple distance check
`);
          this.indent--;
          this.write(`})(scratchRuntime.sprites[scratchRuntime.currentSprite])`);
        } else {
          this.write(`false /* Touch detection for ${target} not implemented */`);
        }
        break;
      case "keyPressed":
        const key = this.formatArg(block.args[0]);
        this.write(`// Key pressed detection
`);
        this.write(`(() => {
`);
        this.indent++;
        this.write(`const pressedKeys = {};
`);
        this.write(
          `document.addEventListener('keydown', (e) => { pressedKeys[e.key.toLowerCase()] = true; });
`
        );
        this.write(
          `document.addEventListener('keyup', (e) => { delete pressedKeys[e.key.toLowerCase()]; });
`
        );
        this.write(`return ${key}.toLowerCase() in pressedKeys;
`);
        this.indent--;
        this.write(`})()`);
        break;
      case "mouseDown":
        this.write(`// Mouse down detection
`);
        this.write(`(() => {
`);
        this.indent++;
        this.write(`let isMouseDown = false;
`);
        this.write(`document.addEventListener('mousedown', () => { isMouseDown = true; });
`);
        this.write(`document.addEventListener('mouseup', () => { isMouseDown = false; });
`);
        this.write(`return isMouseDown;
`);
        this.indent--;
        this.write(`})()`);
        break;
      case "mouseX":
        this.write(`// Mouse X position (relative to stage center)
`);
        this.write(`(() => {
`);
        this.indent++;
        this.write(`let mouseX = 0;
`);
        this.write(`const stage = document.getElementById('stage');
`);
        this.write(`if (stage) {
`);
        this.indent++;
        this.write(`const rect = stage.getBoundingClientRect();
`);
        this.write(`document.addEventListener('mousemove', (e) => {
`);
        this.indent++;
        this.write(`mouseX = e.clientX - rect.left - (rect.width / 2);
`);
        this.indent--;
        this.write(`});
`);
        this.indent--;
        this.write(`}
`);
        this.write(`return mouseX;
`);
        this.indent--;
        this.write(`})()`);
        break;
      case "mouseY":
        this.write(`// Mouse Y position (relative to stage center)
`);
        this.write(`(() => {
`);
        this.indent++;
        this.write(`let mouseY = 0;
`);
        this.write(`const stage = document.getElementById('stage');
`);
        this.write(`if (stage) {
`);
        this.indent++;
        this.write(`const rect = stage.getBoundingClientRect();
`);
        this.write(`document.addEventListener('mousemove', (e) => {
`);
        this.indent++;
        this.write(`mouseY = (rect.height / 2) - (e.clientY - rect.top);
`);
        this.indent--;
        this.write(`});
`);
        this.indent--;
        this.write(`}
`);
        this.write(`return mouseY;
`);
        this.indent--;
        this.write(`})()`);
        break;
      case "timer":
        this.write(`// Timer value (seconds since page load)
`);
        this.write(`((start) => (Date.now() - start) / 1000)(Date.now())`);
        break;
      case "resetTimer":
        this.write(`// Reset timer (simplified implementation)
`);
        this.write(`console.log("Timer reset requested");
`);
        break;
      default:
        this.write(`// Unsupported sensing block: ${block.name}
`);
    }
    if (block.next) {
      this.generateBlockCode(block.next);
    }
  }
  /**
   * Generates code for operators blocks (mathematical and logical operations)
   */
  generateOperatorsBlock(block) {
    switch (block.name) {
      case "add":
        const addend1 = this.formatArg(block.args[0]);
        const addend2 = this.formatArg(block.args[1]);
        return `(Number(${addend1}) + Number(${addend2}))`;
      case "subtract":
        const minuend = this.formatArg(block.args[0]);
        const subtrahend = this.formatArg(block.args[1]);
        return `(Number(${minuend}) - Number(${subtrahend}))`;
      case "multiply":
        const factor1 = this.formatArg(block.args[0]);
        const factor2 = this.formatArg(block.args[1]);
        return `(Number(${factor1}) * Number(${factor2}))`;
      case "divide":
        const dividend = this.formatArg(block.args[0]);
        const divisor = this.formatArg(block.args[1]);
        return `(Number(${dividend}) / Number(${divisor}))`;
      case "mod":
        const modDividend = this.formatArg(block.args[0]);
        const modDivisor = this.formatArg(block.args[1]);
        return `(Number(${modDividend}) % Number(${modDivisor}))`;
      case "round":
        const roundValue = this.formatArg(block.args[0]);
        return `Math.round(Number(${roundValue}))`;
      case "abs":
        const absValue = this.formatArg(block.args[0]);
        return `Math.abs(Number(${absValue}))`;
      case "floor":
        const floorValue = this.formatArg(block.args[0]);
        return `Math.floor(Number(${floorValue}))`;
      case "ceiling":
        const ceilingValue = this.formatArg(block.args[0]);
        return `Math.ceil(Number(${ceilingValue}))`;
      case "sqrt":
        const sqrtValue = this.formatArg(block.args[0]);
        return `Math.sqrt(Number(${sqrtValue}))`;
      case "sin":
        const sinValue = this.formatArg(block.args[0]);
        return `Math.sin(Number(${sinValue}) * Math.PI / 180)`;
      case "cos":
        const cosValue = this.formatArg(block.args[0]);
        return `Math.cos(Number(${cosValue}) * Math.PI / 180)`;
      case "tan":
        const tanValue = this.formatArg(block.args[0]);
        return `Math.tan(Number(${tanValue}) * Math.PI / 180)`;
      case "greater":
        const greater1 = this.formatArg(block.args[0]);
        const greater2 = this.formatArg(block.args[1]);
        return `(Number(${greater1}) > Number(${greater2}))`;
      case "less":
        const less1 = this.formatArg(block.args[0]);
        const less2 = this.formatArg(block.args[1]);
        return `(Number(${less1}) < Number(${less2}))`;
      case "equals":
        const equals1 = this.formatArg(block.args[0]);
        const equals2 = this.formatArg(block.args[1]);
        return `(${equals1} == ${equals2})`;
      case "and":
        const and1 = this.formatArg(block.args[0]);
        const and2 = this.formatArg(block.args[1]);
        return `(${and1} && ${and2})`;
      case "or":
        const or1 = this.formatArg(block.args[0]);
        const or2 = this.formatArg(block.args[1]);
        return `(${or1} || ${or2})`;
      case "not":
        const notValue = this.formatArg(block.args[0]);
        return `!(${notValue})`;
      case "random":
        const min = this.formatArg(block.args[0]);
        const max = this.formatArg(block.args[1]);
        return `(Math.floor(Math.random() * (${max} - ${min} + 1)) + ${min})`;
      case "join":
        const string1 = this.formatArg(block.args[0]);
        const string2 = this.formatArg(block.args[1]);
        return `('' + ${string1} + ${string2})`;
      case "letterOf":
        const letter = this.formatArg(block.args[0]);
        const string = this.formatArg(block.args[1]);
        return `String(${string}).charAt(${letter} - 1)`;
      case "length":
        const lengthString = this.formatArg(block.args[0]);
        return `String(${lengthString}).length`;
      case "contains":
        const containsString = this.formatArg(block.args[0]);
        const substring = this.formatArg(block.args[1]);
        return `String(${containsString}).includes(String(${substring}))`;
      case "expression":
        const expression = this.formatArg(block.args[0]);
        return `(${expression})`;
      default:
        return `/* Unsupported operator: ${block.name} */`;
    }
  }
  /**
   * Generates code for variables blocks (set, change, etc.)
   */
  generateVariablesBlock(block) {
    switch (block.name) {
      case "set":
        const varName = block.args[0];
        const varValue = this.formatArg(block.args[1]);
        this.write(`scratchRuntime.variables["${varName}"] = ${varValue};
`);
        break;
      case "change":
        const changeVarName = block.args[0];
        const changeValue = this.formatArg(block.args[1]);
        this.write(
          `scratchRuntime.variables["${changeVarName}"] = Number(scratchRuntime.variables["${changeVarName}"]) + Number(${changeValue});
`
        );
        break;
      case "showVariable":
        const showVarName = block.args[0];
        this.write(`// Show variable in the UI
`);
        this.write(`(() => {
`);
        this.indent++;
        this.write(`const varDisplay = document.getElementById('var-${showVarName}');
`);
        this.write(`if (!varDisplay) {
`);
        this.indent++;
        this.write(`const newVarDisplay = document.createElement('div');
`);
        this.write(`newVarDisplay.id = 'var-${showVarName}';
`);
        this.write(`newVarDisplay.className = 'scratch-variable';
`);
        this.write(`newVarDisplay.style.position = 'absolute';
`);
        this.write(`newVarDisplay.style.top = '10px';
`);
        this.write(`newVarDisplay.style.left = '10px';
`);
        this.write(`newVarDisplay.style.backgroundColor = 'rgba(255,255,255,0.7)';
`);
        this.write(`newVarDisplay.style.padding = '5px';
`);
        this.write(`newVarDisplay.style.borderRadius = '5px';
`);
        this.write(
          `newVarDisplay.textContent = '${showVarName}: ' + scratchRuntime.variables["${showVarName}"];
`
        );
        this.write(`document.getElementById('stage').appendChild(newVarDisplay);
`);
        this.indent--;
        this.write(`} else {
`);
        this.indent++;
        this.write(`varDisplay.style.display = 'block';
`);
        this.indent--;
        this.write(`}
`);
        this.indent--;
        this.write(`})();
`);
        break;
      case "hideVariable":
        const hideVarName = block.args[0];
        this.write(`// Hide variable in the UI
`);
        this.write(`const varDisplay = document.getElementById('var-${hideVarName}');
`);
        this.write(`if (varDisplay) varDisplay.style.display = 'none';
`);
        break;
      case "addToList":
        const listName = block.args[0];
        const itemValue = this.formatArg(block.args[1]);
        this.write(`// Add item to list
`);
        this.write(`if (!scratchRuntime.lists["${listName}"]) scratchRuntime.lists["${listName}"] = [];
`);
        this.write(`scratchRuntime.lists["${listName}"].push(${itemValue});
`);
        break;
      case "deleteFromList":
        const deleteListName = block.args[0];
        const deleteIndex = this.formatArg(block.args[1]);
        this.write(`// Delete item from list
`);
        this.write(
          `if (scratchRuntime.lists["${deleteListName}"] && ${deleteIndex} > 0 && ${deleteIndex} <= scratchRuntime.lists["${deleteListName}"].length) {
`
        );
        this.indent++;
        this.write(`scratchRuntime.lists["${deleteListName}"].splice(${deleteIndex} - 1, 1);
`);
        this.indent--;
        this.write(`}
`);
        break;
      case "insertInList":
        const insertListName = block.args[0];
        const insertValue = this.formatArg(block.args[1]);
        const insertIndex = this.formatArg(block.args[2]);
        this.write(`// Insert item in list
`);
        this.write(
          `if (!scratchRuntime.lists["${insertListName}"]) scratchRuntime.lists["${insertListName}"] = [];
`
        );
        this.write(
          `if (${insertIndex} > 0 && ${insertIndex} <= scratchRuntime.lists["${insertListName}"].length + 1) {
`
        );
        this.indent++;
        this.write(
          `scratchRuntime.lists["${insertListName}"].splice(${insertIndex} - 1, 0, ${insertValue});
`
        );
        this.indent--;
        this.write(`}
`);
        break;
      case "replaceInList":
        const replaceListName = block.args[0];
        const replaceIndex = this.formatArg(block.args[1]);
        const replaceValue = this.formatArg(block.args[2]);
        this.write(`// Replace item in list
`);
        this.write(
          `if (scratchRuntime.lists["${replaceListName}"] && ${replaceIndex} > 0 && ${replaceIndex} <= scratchRuntime.lists["${replaceListName}"].length) {
`
        );
        this.indent++;
        this.write(`scratchRuntime.lists["${replaceListName}"][${replaceIndex} - 1] = ${replaceValue};
`);
        this.indent--;
        this.write(`}
`);
        break;
      case "itemOfList":
        const itemListName = block.args[0];
        const itemIndex = this.formatArg(block.args[1]);
        this.write(
          `(scratchRuntime.lists["${itemListName}"] && ${itemIndex} > 0 && ${itemIndex} <= scratchRuntime.lists["${itemListName}"].length ? scratchRuntime.lists["${itemListName}"][${itemIndex} - 1] : "")`
        );
      case "lengthOfList":
        const lengthListName = block.args[0];
        this.write(
          `(scratchRuntime.lists["${lengthListName}"] ? scratchRuntime.lists["${lengthListName}"].length : 0)`
        );
      case "listContains":
        const containsListName = block.args[0];
        const containsItem = this.formatArg(block.args[1]);
        this.write(
          `(scratchRuntime.lists["${containsListName}"] ? scratchRuntime.lists["${containsListName}"].includes(${containsItem}) : false)`
        );
      default:
        this.write(`// Unsupported variables block: ${block.name}
`);
    }
    if (block.next) {
      this.generateBlockCode(block.next);
    }
  }
  /**
   * Generates code for pen blocks
   */
  generatePenBlock(block) {
    const sprite = `scratchRuntime.sprites[scratchRuntime.currentSprite]`;
    if (!this.penMethodsAdded) {
      this.addPenMethods();
    }
    switch (block.name) {
      case "penDown":
        this.write(`${sprite}.penDown();
`);
        break;
      case "penUp":
        this.write(`${sprite}.penUp();
`);
        break;
      case "setPenColor":
        const color = this.formatArg(block.args[0]);
        this.write(`${sprite}.setPenColor(${color});
`);
        break;
      case "changePenSize":
        const sizeChange = this.formatArg(block.args[0]);
        this.write(`${sprite}.changePenSize(${sizeChange});
`);
        break;
      case "setPenSize":
        const size = this.formatArg(block.args[0]);
        this.write(`${sprite}.setPenSize(${size});
`);
        break;
      case "clear":
        this.write(`${sprite}.clearPen();
`);
        break;
      case "stamp":
        this.write(`${sprite}.stamp();
`);
        break;
      default:
        this.write(`// Unsupported pen block: ${block.name}
`);
    }
    if (block.next) {
      this.generateBlockCode(block.next);
    }
  }
  /**
   * Adds pen methods to the runtime if they don't exist yet
   */
  addPenMethods() {
    this.penMethodsAdded = true;
    const penMethods = `
        // Add pen methods to the sprite prototype
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
    const insertPoint = this.output.lastIndexOf("};") - 1;
    this.output = this.output.substring(0, insertPoint) + penMethods + this.output.substring(insertPoint);
    this.updateMovementMethods();
  }
  /**
   * Updates movement methods to handle pen drawing
   */
  updateMovementMethods() {
    const moveMethodPos = this.output.indexOf("move: function(steps)");
    if (moveMethodPos > -1) {
      const endOfMoveMethod = this.output.indexOf("},", moveMethodPos) + 2;
      const moveMethod = this.output.substring(moveMethodPos, endOfMoveMethod);
      const updatedMoveMethod = moveMethod.replace(
        "console.log(`${scratchRuntime.currentSprite} moved to (${Math.floor(this.x)}, ${Math.floor(this.y)})`);\n",
        "console.log(`${scratchRuntime.currentSprite} moved to (${Math.floor(this.x)}, ${Math.floor(this.y)})`);\n                    this.updatePenDrawing();\n"
      );
      this.output = this.output.substring(0, moveMethodPos) + updatedMoveMethod + this.output.substring(endOfMoveMethod);
    }
    const goToMethodPos = this.output.indexOf("goTo: function(x, y)");
    if (goToMethodPos > -1) {
      const endOfGoToMethod = this.output.indexOf("},", goToMethodPos) + 2;
      const goToMethod = this.output.substring(goToMethodPos, endOfGoToMethod);
      const updatedGoToMethod = goToMethod.replace(
        "console.log(`${scratchRuntime.currentSprite} went to (${Math.floor(this.x)}, ${Math.floor(this.y)})`);\n",
        "console.log(`${scratchRuntime.currentSprite} went to (${Math.floor(this.x)}, ${Math.floor(this.y)})`);\n                    this.updatePenDrawing();\n"
      );
      this.output = this.output.substring(0, goToMethodPos) + updatedGoToMethod + this.output.substring(endOfGoToMethod);
    }
  }
  /**
   * Generates code for custom blocks (procedures)
   */
  generateCustomBlock(block) {
    if (block.name === "defineFunction") {
      const functionName = block.args[0];
      const paramList = block.args.slice(1);
      this.write(`// Define custom procedure: ${functionName}
`);
      this.write(`scratchRuntime.procedures["${functionName}"] = function(${paramList.join(", ")}) {
`);
      this.indent++;
      if (block.next) {
        this.inFunction = true;
        this.generateBlockCode(block.next);
        this.inFunction = false;
      }
      this.indent--;
      this.write(`};

`);
    } else if (block.name === "call") {
      const functionName = block.args[0];
      const args = block.args.slice(1).map((arg) => this.formatArg(arg)).join(", ");
      this.write(`// Call custom procedure: ${functionName}
`);
      this.write(`scratchRuntime.procedures["${functionName}"](${args});
`);
      if (block.next) {
        this.generateBlockCode(block.next);
      }
    }
  }
  /**
   * Helper method to add proper indentation to the output
   */
  write(text) {
    const indentation = "    ".repeat(this.indent);
    this.output += indentation + text;
  }
  /**
   * Helper method to format arguments correctly
   */
  formatArg(arg) {
    if (typeof arg === "string") {
      if (arg.startsWith("$")) {
        return `scratchRuntime.variables["${arg.substring(1)}"]`;
      } else if (arg.startsWith("#")) {
        return `scratchRuntime.lists["${arg.substring(1)}"]`;
      } else {
        return `"${arg}"`;
      }
    } else if (typeof arg === "number") {
      return arg.toString();
    } else if (typeof arg === "object" && arg !== null && "type" in arg) {
      const block = arg;
      if (block.type === "operators") {
        return this.generateOperatorsBlock(block);
      } else {
        this.write(`// Warning: Unexpected nested block type: ${block.type}
`);
        return '""';
      }
    } else {
      return JSON.stringify(arg);
    }
  }
  /**
   * Generates HTML wrapper code
   */
  generateHTML() {
    this.htmlOutput = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Scratch-like JavaScript Program</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f0f0f0;
            }
            
            .container {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .controls {
                margin-bottom: 10px;
                display: flex;
                gap: 10px;
            }
            
            button {
                padding: 10px 15px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            button:hover {
                background-color: #45a049;
            }
            
            #stage {
                background-color: white;
                border: 2px solid #333;
                position: relative;
                overflow: hidden;
            }
            
            #console {
                width: 480px;
                height: 200px;
                margin-top: 20px;
                border: 1px solid #ccc;
                padding: 10px;
                overflow-y: auto;
                font-family: monospace;
                background-color: white;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Scratch-like JavaScript Program</h1>
            <div class="controls">
                <button id="start-button">Green Flag (Start)</button>
                <button id="stop-button">Stop</button>
                <button id="reset-button">Reset</button>
            </div>
            <div id="stage"></div>
            <div id="console"></div>
        </div>

        <script>
            // Console logging override to display in our custom console
            const originalConsoleLog = console.log;
            console.log = function() {
                // Call the original console.log
                originalConsoleLog.apply(console, arguments);
                
                // Display in our custom console
                const consoleDiv = document.getElementById('console');
                if (consoleDiv) {
                    const message = Array.from(arguments).join(' ');
                    const logLine = document.createElement('div');
                    logLine.textContent = message;
                    consoleDiv.appendChild(logLine);
                    consoleDiv.scrollTop = consoleDiv.scrollHeight;
                }
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'scratch-log', message: Array.from(arguments).join(' ') }, '*');
                    }
                } catch (e) {}
            };
            
            // Setup controls
            document.getElementById('start-button').addEventListener('click', function() {
                // Trigger the green flag event
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);
            });
            
            document.getElementById('stop-button').addEventListener('click', function() {
                // For a real implementation, you would need a way to stop all running scripts
                console.log('Program stopped');
            });
            
            document.getElementById('reset-button').addEventListener('click', function() {
                // Reload the page to reset everything
                location.reload();
            });
            
            // Generated program code

            const outputProgram = async () => {
                try {
                    ${this.output}
                    return true;
                } catch (error) {
                    throw error;
                }
            };

            outputProgram()
                .then((data) => {
                    console.log(data);
                })
                .catch((error) => {
                    console.error(error);
                });
        </script>
    </body>
    </html>`;
  }
};

// src/lib/debugger.ts
var import_fs = require("fs");
var import_path = __toESM(require("path"));
var Debugger = class {
  constructor(options = { enabled: false }) {
    this.logs = [];
    this.options = {
      enabled: options.enabled,
      logLevels: options.logLevels || ["info", "warn", "error"],
      saveToFile: options.saveToFile || false,
      filePath: options.filePath || "../debug/debug.json"
    };
  }
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }
  log(level, message, context) {
    if (!this.options.enabled) {
      return;
    }
    if (this.options.logLevels && !this.options.logLevels.includes(level)) {
      return;
    }
    const logEntry = {
      level,
      message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      context
    };
    this.logs.push(logEntry);
    if (this.options.saveToFile) {
      this.saveLogsToFile();
    }
  }
  info(message, context) {
    this.log("info", message, context);
  }
  warn(message, context) {
    this.log("warn", message, context);
  }
  error(message, context) {
    this.log("error", message, context);
  }
  debug(message, context) {
    this.log("debug", message, context);
  }
  async saveLogsToFile() {
    if (!this.options.saveToFile || !this.options.filePath) {
      return;
    }
    try {
      const directory = import_path.default.dirname(this.options.filePath);
      await import_fs.promises.mkdir(directory, { recursive: true });
      await import_fs.promises.writeFile(this.options.filePath, JSON.stringify(this.logs, null, 2));
      console.log("Saved file to: ", this.options.filePath);
    } catch (error) {
      console.error("Error saving logs to file:", error);
    }
  }
  getLogs() {
    return this.logs;
  }
  clearLogs() {
    this.logs = [];
  }
};
var debugger_default = Debugger;

// src/lib/compiler.ts
var ScratchTextCompiler = class {
  constructor() {
    this.debugger = new debugger_default({
      enabled: true,
      logLevels: ["info", "warn", "error"],
      saveToFile: true,
      filePath: "src/debug/compilerOutput.json"
    });
  }
  // compile: Main method that takes Scratch-like text code as input and returns JavaScript code.
  compile(code) {
    try {
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      this.debugger.log("info", "Lexer output (tokens) ", tokens);
      const parser = new Parser(tokens);
      const program = parser.parse();
      this.debugger.log("info", "Parser output (program) ", program);
      const generator = new CodeGenerator(program);
      const jsCode = generator.generate();
      this.debugger.log("info", "Generator output (jsCode) ", jsCode);
      return jsCode;
    } catch (error) {
      console.error("Compilation error:", error);
      return {
        js: "",
        html: "",
        error: `// Compilation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
};
async function compile(code) {
  try {
    const compiler = new ScratchTextCompiler();
    const { js, html } = compiler.compile(code);
    return { js, html };
  } catch (error) {
    console.error("Error in compile function:", error);
    return { error: "Compilation failed in compiler function." };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ScratchTextCompiler,
  compile
});
