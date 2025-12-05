// utils/content.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

type Team = {
    name: string;
    role: string;
    avatar: string;
    linkedIn: string;
};

type Metadata = {
    title: string;
    description: string;
    languages: string[];
    difficulty?: string;
    duration?: string;
    index?: boolean;
};

interface MDXItem {
    metadata: Metadata;
    slug: string;
    content: string;
}

// --- Helpers ---

function getMDXFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) {
        throw new Error(`Directory not found: ${dir}`);
    }

    return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
}

function readMDXFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(rawContent);

    const metadata: Metadata = {
        title: data.title || '',
        description: data.description || '',
        languages: data.languages || [],
        difficulty: data.images || [],
        duration: data.tag || "",
        index: data.team || true,
    };

    return { metadata, content };
}

function getMDXData(dir: string) {
    const mdxFiles = getMDXFiles(dir);
    return mdxFiles.map((file) => {
        const { metadata, content } = readMDXFile(path.join(dir, file));
        const slug = path.basename(file, path.extname(file));

        return {
            metadata,
            slug,
            content,
        };
    });
}

// --- Public API ---

export function getContent(type: string[]) {
    const baseDir = path.join(process.cwd(), 'content', ...type);
    return getMDXData(baseDir);
}
