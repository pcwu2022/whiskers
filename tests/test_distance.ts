import { Lexer } from '../src/lib/lexer';
import { Parser } from '../src/lib/parser';
import { MultiSpriteCodeGenerator } from '../src/lib/codeGenerator';

const code = `when green flag clicked
    say (distance to mouse-pointer)`;
const lexer = new Lexer(code);
const tokens = lexer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parse();

console.log("=== AST ===");
console.log(JSON.stringify(ast, null, 2));

const sprites = [{ name: 'Sprite1', isStage: false, program: ast }];
const generator = new MultiSpriteCodeGenerator(sprites);
const result = generator.generate();

console.log("\n=== Generated Code ===");
console.log(result.userCode);
