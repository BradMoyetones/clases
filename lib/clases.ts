import { getTableOfContents, TableOfContents } from "fumadocs-core/server";
import fs from "node:fs"
import path from "node:path"
import { ClaseFrontMatter, ClaseFrontMatterSchema } from "./schemas/clase";
import matter from "gray-matter";

const MAP_MIME_TYPES: {[key: string]: string} = {
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".html": "text/html",
    ".mdx": "text/markdown; charset=utf-8"
};

const ROOT = path.join(process.cwd(), "content", "clases", "WEB")

function resolvePath(...segments: string[]) {
    return path.join(ROOT, ...segments)
}

export function readFileFromSlug(slug: string[]): {
    buffer: Buffer;
    mime: string;
} | null {
    try {
        const filePath = resolvePath(...slug);
        if (!fs.existsSync(filePath)) return null;

        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(filePath);
        const mime = MAP_MIME_TYPES[ext] || "application/octet-stream";

        return { buffer, mime };
    } catch (err) {
        console.error(err);
        return null;
    }
}

export function getClaseMeta(folder: string): ClaseFrontMatter | null {
    try {
        const mdxPath = resolvePath(folder, "README.mdx");
        if (!fs.existsSync(mdxPath)) return null;

        const raw = fs.readFileSync(mdxPath, "utf-8");
        const { data } = matter(raw);

        // Validar con Zod
        const parsed = ClaseFrontMatterSchema.safeParse(data);

        if (!parsed.success) {
            console.warn(`❌ Invalid frontmatter in ${folder}/README.mdx`);
            console.warn(parsed.error.format());
            return null;
        }

        return parsed.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export function getClaseContent(folder: string) {
    const mdxPath = resolvePath(folder, "README.mdx");
    if (!fs.existsSync(mdxPath)) return null;

    const raw = fs.readFileSync(mdxPath, "utf-8");
    const { data, content } = matter(raw);

    const parsed = ClaseFrontMatterSchema.safeParse(data);
    if (!parsed.success) return null;

    return { meta: parsed.data, content };
}

export function getClases() {
    const folders = fs.readdirSync(ROOT);

    return folders
        .map((folder) => {
            const meta = getClaseMeta(folder);

            return {
                id: folder,
                hasMDX: !!meta,
                meta,
            };
        })
        .filter((item) => {
            // Si no hay meta → mostrarlo igual
            if (!item.meta) return true;

            // Si tiene index: false → NO mostrarlo
            return item.meta.index !== false;
        });
}

export function extractTOC(content: string): TableOfContents {
    try {
        // Dynamic import to avoid server-only module in client component
        const tocItems = getTableOfContents(content)

        return tocItems
    } catch (error) {
        console.error("Error generating TOC with fumadocs:", error)
        // Fallback to manual extraction
        const toc: TableOfContents = []
        const headingRegex = /^(#{2,4})\s+(.+)$/gm
        let match

        while ((match = headingRegex.exec(content)) !== null) {
            const depth = match[1].length
            const title = match[2].trim()
            const id = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
            toc.push({ title, url: `#${id}`, depth })
        }

        return toc
    }
}