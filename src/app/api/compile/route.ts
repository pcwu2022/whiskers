// src/app/api/compile/route.ts

import { NextResponse } from "next/server";
import { compile, compileMultiSprite, CompilerError } from "@/lib/compiler";

interface SpriteInput {
    name: string;
    code: string;
    isStage?: boolean;
}

interface CompilationResponse {
    js: string;
    html: string;
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
            success: result.success,
            errors: result.errors,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({
            js: "",
            html: "",
            success: false,
            errors: [{
                code: "E999",
                message: error instanceof Error ? error.message : "API route failed.",
                line: 1,
                column: 1,
                severity: "error" as const,
            }],
        }, { status: 500 });
    }
}
