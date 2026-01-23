# Scratch Compiler Debugging Plan

This document outlines a systematic approach to debugging the Scratch compiler after the codebase refactoring.

## 1. Codebase Structure After Refactoring

```
src/
├── types/                    # Type definitions and constants
│   ├── index.ts              # Re-exports all types
│   ├── tokenTypes.ts         # Token enum and interfaces
│   ├── blockTypes.ts         # AST node types
│   └── constants.ts          # Keywords, operators, block mappings
├── templates/                # Code generation templates
│   ├── index.ts              # Re-exports all templates
│   ├── runtime.ts            # Scratch runtime template
│   ├── htmlTemplate.ts       # HTML wrapper template
│   └── penMethods.ts         # Pen drawing methods
├── lib/
│   ├── lexer/                # Tokenization module
│   │   ├── index.ts
│   │   ├── Lexer.ts          # Main Lexer class
│   │   ├── extractors.ts     # Token extraction functions
│   │   ├── indentation.ts    # Indent/dedent handling
│   │   └── charUtils.ts      # Character utilities
│   ├── parser/               # AST generation module
│   │   ├── index.ts
│   │   ├── Parser.ts         # Main Parser class
│   │   ├── parserState.ts    # Parser state utilities
│   │   ├── blockParser.ts    # Block parsing logic
│   │   ├── scriptParser.ts   # Script sequence parsing
│   │   └── declarationParser.ts # Variable/list declarations
│   ├── generator/            # Code generation module
│   │   ├── index.ts
│   │   ├── CodeGenerator.ts  # Main CodeGenerator class
│   │   ├── generatorState.ts # Generator state utilities
│   │   ├── blockDispatcher.ts # Routes blocks to handlers
│   │   ├── runtimeGenerator.ts # Runtime code generation
│   │   └── blocks/           # Individual block generators
│   │       ├── eventBlocks.ts
│   │       ├── motionBlocks.ts
│   │       ├── looksBlocks.ts
│   │       ├── soundBlocks.ts
│   │       ├── controlBlocks.ts
│   │       ├── sensingBlocks.ts
│   │       ├── operatorsBlocks.ts
│   │       ├── variablesBlocks.ts
│   │       ├── penBlocks.ts
│   │       └── customBlocks.ts
│   └── compilerNew.ts        # Main compiler entry point
```

## 2. Testing Strategy

### Phase 1: Unit Testing Each Module

#### 2.1 Lexer Testing
Test each token type in isolation:

```typescript
// Test cases for lexer/extractors.ts
describe('Lexer - Token Extraction', () => {
  test('extracts string literals', () => {});
  test('extracts numbers (integers and floats)', () => {});
  test('extracts negative numbers', () => {});
  test('extracts operators', () => {});
  test('extracts identifiers vs keywords', () => {});
  test('extracts comments', () => {});
});

// Test cases for lexer/indentation.ts
describe('Lexer - Indentation', () => {
  test('handles single level indent', () => {});
  test('handles multiple level indent', () => {});
  test('handles dedent to previous level', () => {});
  test('handles multiple dedents at once', () => {});
  test('throws on inconsistent indentation', () => {});
});
```

#### 2.2 Parser Testing
Test AST generation for each block type:

```typescript
// Test cases for parser/blockParser.ts
describe('Parser - Block Parsing', () => {
  test('parses event blocks (when flagClicked)', () => {});
  test('parses motion blocks with arguments', () => {});
  test('parses control blocks with nested bodies', () => {});
  test('parses expressions in parentheses', () => {});
});

// Test cases for parser/scriptParser.ts
describe('Parser - Script Parsing', () => {
  test('parses simple script with one block', () => {});
  test('parses script with nested blocks', () => {});
  test('connects blocks via next property', () => {});
  test('handles indentation-based nesting', () => {});
});
```

#### 2.3 Code Generator Testing
Test JavaScript output for each block type:

```typescript
// Test cases for generator/blocks/*.ts
describe('CodeGenerator - Block Generation', () => {
  test('generates event handler code', () => {});
  test('generates motion code', () => {});
  test('generates control structures', () => {});
  test('generates operator expressions', () => {});
});
```

### Phase 2: Integration Testing

Create test cases for complete programs:

```
// Test file: tests/integration/simple_say.scratch
when flagClicked
  say "Hello World"

// Expected: Proper event listener + say function call
```

```
// Test file: tests/integration/repeat_loop.scratch
when flagClicked
  repeat 10
    move 10 steps
    turn 36 degrees

// Expected: for loop with motion calls
```

### Phase 3: End-to-End Testing

Test the full pipeline with the web interface.

## 3. Known Issues to Investigate

### 3.1 Lexer Issues
- [ ] **Indentation handling**: May have edge cases with mixed tabs/spaces
- [ ] **Token position tracking**: Column numbers may be off for multi-character tokens
- [ ] **String escape sequences**: Verify all escape sequences work correctly

### 3.2 Parser Issues
- [ ] **Block nesting**: Verify `next` chain is correctly built for nested control structures
- [ ] **Indentation recovery**: Parser may get confused after syntax errors
- [ ] **Multi-word keywords**: "turn right" vs "turnRight" normalization
- [ ] **Expression parsing**: Operator precedence may not be handled

### 3.3 Code Generator Issues
- [ ] **Control flow**: Loop body may be attached to wrong property (args vs next)
- [ ] **Async/await**: Ensure all async blocks properly await
- [ ] **Pen methods**: Dynamic injection may break if runtime structure changes
- [ ] **Variable scoping**: Function parameters vs global variables

## 4. Debugging Tools

### 4.1 Built-in Debugger
The compiler has a built-in debugger that logs:
- Lexer output (tokens)
- Parser output (AST)
- Generator output (JavaScript code)

Check: `src/debug/compilerOutput.json`

### 4.2 Debug Logging
Add debug logging at key points:

```typescript
// In lexer
console.log('[LEXER] Token:', token);

// In parser
console.log('[PARSER] Block:', block);
console.log('[PARSER] Indent level:', indentLevel);

// In generator
console.log('[GEN] Generating:', block.type, block.name);
```

### 4.3 AST Visualization
Create a function to visualize the AST:

```typescript
function visualizeAST(program: Program, indent = 0): string {
  let output = '';
  for (const script of program.scripts) {
    output += printBlock(script.blocks[0], indent);
  }
  return output;
}

function printBlock(block: BlockNode | undefined, indent: number): string {
  if (!block) return '';
  const pad = '  '.repeat(indent);
  let output = `${pad}[${block.type}] ${block.name}\n`;
  output += `${pad}  args: ${JSON.stringify(block.args)}\n`;
  if (block.next) {
    output += printBlock(block.next, indent);
  }
  return output;
}
```

## 5. Debugging Workflow

### Step 1: Identify the Problem Layer
1. Check if tokens are correct (Lexer issue)
2. Check if AST is correct (Parser issue)
3. Check if JS output is correct (Generator issue)

### Step 2: Isolate the Issue
1. Create a minimal test case
2. Step through the code with debugger
3. Check intermediate state at each step

### Step 3: Fix and Verify
1. Make minimal change to fix
2. Run the minimal test case
3. Run full test suite to check for regressions

## 6. Common Debugging Scenarios

### Scenario: Block not recognized
1. Check if keyword is in `SCRATCH_KEYWORDS`
2. Check if keyword is in `BLOCK_START_KEYWORDS`
3. Check if keyword maps to correct `BlockType` in `BLOCK_TYPE_MAP`

### Scenario: Nested blocks not working
1. Check if INDENT token is generated
2. Check if parser handles INDENT correctly
3. Check if block is attached to parent.args or parent.next

### Scenario: Generated code doesn't run
1. Check for syntax errors in generated JS
2. Check if async/await is used correctly
3. Check if runtime methods exist

## 7. Recommended Improvements

### Short-term
1. Add comprehensive unit tests for each module
2. Add integration tests for common patterns
3. Improve error messages with line/column info

### Medium-term
1. Add source maps for debugging generated code
2. Add syntax highlighting for Scratch language
3. Add autocompletion support

### Long-term
1. Add type checking for variables
2. Add optimization passes
3. Support for custom extensions

## 8. Quick Reference: File Responsibilities

| File | Responsibility |
|------|----------------|
| `types/tokenTypes.ts` | Token type enum and interface |
| `types/blockTypes.ts` | AST node types |
| `types/constants.ts` | Keywords, operators, mappings |
| `lexer/Lexer.ts` | Main tokenization loop |
| `lexer/extractors.ts` | Extract individual token types |
| `lexer/indentation.ts` | Handle INDENT/DEDENT |
| `parser/Parser.ts` | Main parsing entry point |
| `parser/parserState.ts` | Parser state utilities |
| `parser/blockParser.ts` | Parse individual blocks |
| `parser/scriptParser.ts` | Parse script sequences |
| `generator/CodeGenerator.ts` | Main generation entry |
| `generator/generatorState.ts` | Generator state utilities |
| `generator/blockDispatcher.ts` | Route blocks to handlers |
| `generator/blocks/*.ts` | Generate code for block types |
| `templates/runtime.ts` | Scratch runtime code |
| `templates/htmlTemplate.ts` | HTML wrapper |

## 9. Getting Started

1. **Verify the refactored code compiles:**
   ```bash
   npm run build
   ```

2. **Run a simple test:**
   ```bash
   # Create a test file
   echo 'when flagClicked
     say "hello"' > test.scratch
   
   # Use the compiler (via API or test script)
   ```

3. **Check the debug output:**
   - Open `src/debug/compilerOutput.json`
   - Verify tokens are correct
   - Verify AST is correct
   - Verify generated JS is correct

4. **Start fixing issues from the simplest to most complex:**
   - Start with "when flagClicked" only
   - Add "say" block
   - Add control structures
   - Add expressions and operators
