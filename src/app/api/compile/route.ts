// src/app/api/compile/route.ts

import { NextResponse } from "next/server";
import { compile, compileMultiSprite } from "@/lib/compiler";

interface SpriteInput {
    name: string;
    code: string;
    isStage?: boolean;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Handle multi-sprite compilation (new format)
        if (body.sprites && Array.isArray(body.sprites)) {
            const sprites: SpriteInput[] = body.sprites;
            const compilationResult = await compileMultiSprite(sprites, body.debug === true);

            if ("error" in compilationResult) {
                return NextResponse.json({ error: compilationResult.error }, { status: 500 });
            }

            const response: { js: string; html: string; debugInfo?: unknown } = {
                js: compilationResult.js,
                html: compilationResult.html,
            };
            
            if (compilationResult.debugInfo) {
                response.debugInfo = compilationResult.debugInfo;
            }

            return NextResponse.json(response);
        }
        
        // Handle legacy single-code compilation (backward compatibility)
        const { code } = body;
        const compilationResult = await compile(code);

        if ("error" in compilationResult) {
            return NextResponse.json({ error: compilationResult.error }, { status: 500 });
        }

        return NextResponse.json({
            js: compilationResult.js,
            html: compilationResult.html,
        });
    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({ error: "API route failed." }, { status: 500 });
    }
}
