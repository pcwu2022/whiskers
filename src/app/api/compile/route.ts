// src/app/api/compile/route.ts

import { NextResponse } from "next/server";
import { compile, compileMultiSprite, CompilerError } from "@/lib/compiler";

interface SpriteInput {
    name: string;
    code: string;
    isStage?: boolean;
    costumeNames?: string[];  // Available costume names for this sprite
    costumeUrls?: string[];   // Costume image URLs (data URLs)
    currentCostume?: number;  // Current costume index
    soundNames?: string[];    // Available sound names for this sprite
    soundUrls?: string[];     // Sound URLs (data URLs)
}

interface CompilationResponse {
    js: string;
    html: string;
    userCode: string;
    success: boolean;
    errors: CompilerError[];
    debugInfo?: unknown;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Handle multi-sprite compilation (new format)
        if (body.sprites && Array.isArray(body.sprites)) {
            const sprites: SpriteInput[] = body.sprites;
            const result = await compileMultiSprite(sprites, body.debug === true);

            const response: CompilationResponse = {
                js: result.js,
                html: result.html,
                userCode: result.userCode,
                success: result.success,
                errors: result.errors,
            };
            
            if (body.debug && result.parsedSprites) {
                response.debugInfo = { parsedSprites: result.parsedSprites };
            }

            // Return 200 even with errors - let the client handle displaying them
            return NextResponse.json(response);
        }
        
        // Handle legacy single-code compilation (backward compatibility)
        const { code } = body;
        const result = await compile(code);

        const response: CompilationResponse = {
            js: result.js,
            html: result.html,
            userCode: result.userCode,
            success: result.success,
            errors: result.errors,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({
            js: "",
            html: "",
            userCode: "",
            success: false,
            errors: [{
                code: "E999",
                message: "Oops! Something went wrong on our end while running your code.",
                line: 1,
                column: 1,
                severity: "error" as const,
                suggestion: "💡 This might be a temporary problem. Try clicking the green flag again, or refresh the page.",
            }],
        }, { status: 500 });
    }
}
