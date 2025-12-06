import { readFileFromSlug } from "@/lib/mdx";

type ContextType = {
    params: Promise<{
        slug: string[]
    }>
}

export async function GET(req: Request, context: ContextType) {
    
    const { slug } = await context.params; // array
    
    const file = readFileFromSlug(slug);
    if (!file) return new Response("Not found", { status: 404 });

    return new Response(new Uint8Array(file.buffer), {
        headers: {
            "Content-Type": file.mime,
        },
    });
}
