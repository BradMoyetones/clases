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
    id: string;
    title: string;
    shortName: string;
    description: string;
    languages: string[];
    difficulty?: string;
    duration?: string;
    index?: boolean;
    isNew?: boolean;
};

interface MDXItem {
    metadata: Metadata;
    slug: string;
    content: string;
}

// La raíz de todo el contenido servido por la API Route
const ROOT_STATIC = path.join(process.cwd(), "content", "clases", "WEB")

/**
 * Resuelve la ruta completa a un archivo dentro del directorio ROOT_STATIC.
 * @param segments Los segmentos de la ruta extraídos del slug (ej: ["react-avanzado", "imagen.png"])
 * @returns La ruta absoluta.
 */
function resolvePath(...segments: string[]): string {
    return path.join(ROOT_STATIC, ...segments)
}

// --- Helpers ---
function getMDXFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) {
        throw new Error(`Directory not found: ${dir}`);
    }

    return fs.readdirSync(dir).filter((file) => path.extname(file).toLowerCase() === '.mdx');
}

function readMDXFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(rawContent);

    // EXTRA: obtener el nombre de la carpeta donde está el archivo
    const folderName = path.basename(path.dirname(filePath));

    const metadata: Metadata = {
        id: data.id ?? folderName, // si el mdx define id lo usa, si no, usa la carpeta
        title: data.title ?? '',
        shortName: data.shortName ?? 'Clase',
        description: data.description ?? '',
        languages: data.languages ?? [],
        difficulty: data.images ?? [],
        duration: data.tag ?? "",
        index: data.team ?? true,
        isNew: data.isNew ?? false,
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

// --- Nueva función para leer un único archivo ---
// Recibe la ruta inicial fija (["clases", "WEB"]) y el slug dinámico (ej: ["tema-1", "subtema-a"])
export function getSingleContent(initialPath: string[], slug: string[]): MDXItem | null {
    // 1. Divide la ruta y construye el DIR PATH
    const fileSlug = slug[slug.length - 1]; 
    const contentPath = slug.slice(0, -1);
    
    const dirPath = path.join(
        process.cwd(), 
        'content', 
        ...initialPath, 
        ...contentPath
    );
    
    // 2. Definimos el nombre que buscamos, estandarizado a minúsculas
    const searchFileNameLower = `${fileSlug}.mdx`.toLowerCase();

    // 3. 🔑 NUEVA LÓGICA DE BÚSQUEDA INSENSIBLE A MAYÚSCULAS/MINÚSCULAS
    if (!fs.existsSync(dirPath)) {
        return null;
    }
    
    // Leemos el contenido del directorio para encontrar el archivo real
    const actualFileName = fs.readdirSync(dirPath, { withFileTypes: true })
        .find(entry => 
            entry.isFile() && 
            entry.name.toLowerCase() === searchFileNameLower
        )?.name;

    if (!actualFileName) {
        return null; // Archivo no encontrado
    }
    
    // 4. Construye la ruta completa con el nombre del archivo REAL
    const filePath = path.join(dirPath, actualFileName);

    // ... (El resto del try/catch con readMDXFile se mantiene igual)
    try {
        const { metadata, content } = readMDXFile(filePath);
        
        return {
            metadata,
            slug: path.basename(actualFileName, '.mdx'), // Usa el nombre real sin extensión
            content,
        };
    } catch (error) {
        console.error(`Error reading MDX file at ${filePath}:`, error);
        return null;
    }
}

export interface ClaseItem {
    metadata: Metadata;
    // content no es necesario para el listado del home
}

// --- Nueva función para obtener la lista de Clases ---
export function getClases(): ClaseItem[] {

    if (!fs.existsSync(ROOT_STATIC)) {
        console.warn(`Base directory not found: ${ROOT_STATIC}`);
        return [];
    }

    const entries = fs.readdirSync(ROOT_STATIC, { withFileTypes: true });

    const clases: ClaseItem[] = [];

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const classDirName = entry.name;
            const classDirPath = path.join(ROOT_STATIC, classDirName);

            const metadataFilePath = path.join(classDirPath, 'README.mdx');

            if (fs.existsSync(metadataFilePath)) {
                try {
                    const { metadata } = readMDXFile(metadataFilePath);

                    clases.push({ metadata });
                } catch (error) {
                    console.error(`Error processing README.mdx for class ${classDirName}:`, error);
                }
            } else {
                console.warn(`README.mdx not found for class: ${classDirName}`);
            }
        }
    }

    return clases;
}

// --- Mappings y Helpers para archivos estáticos ---
const MAP_MIME_TYPES: {[key: string]: string} = {
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif", // Añadir gif por si acaso
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".html": "text/html",
    ".mdx": "text/markdown; charset=utf-8",
    // Puedes añadir otros tipos de archivos comunes aquí (.woff, .woff2, .ico, etc.)
};

// --- Función para leer archivos estáticos (Refactorizada) ---
export function readFileFromSlug(slug: string[]): {
    buffer: Buffer;
    mime: string;
} | null {
    try {
        // La ruta construida por resolvePath tendrá el casing del slug de la URL
        const requestedFilePath = resolvePath(...slug);
        
        // 1. 🔑 NUEVA LÓGICA DE BÚSQUEDA INSENSIBLE A MAYÚSCULAS/MINÚSCULAS
        // Si el archivo exacto existe (ej: en sistemas case-insensitive), lo usamos.
        let filePath = requestedFilePath;
        
        if (!fs.existsSync(filePath)) {
            // Si no existe con el casing exacto, buscamos el real en el directorio
            const dirPath = path.dirname(requestedFilePath);
            const requestedFileNameLower = path.basename(requestedFilePath).toLowerCase();

            if (!fs.existsSync(dirPath)) return null;

            const actualFileName = fs.readdirSync(dirPath, { withFileTypes: true })
                .find(entry => 
                    entry.isFile() && 
                    entry.name.toLowerCase() === requestedFileNameLower
                )?.name;

            if (!actualFileName) return null;
            
            filePath = path.join(dirPath, actualFileName);
        }
        
        // 2. Leer el contenido del archivo como Buffer (para archivos binarios)
        const buffer = fs.readFileSync(filePath);
        
        // 3. Determinar el MIME Type (se mantiene igual, usando el archivo real)
        const ext = path.extname(filePath).toLowerCase();
        const mime = MAP_MIME_TYPES[ext] || "application/octet-stream";

        return { buffer, mime };
    } catch (err) {
        console.error("Error reading static file from slug:", err);
        return null;
    }
}