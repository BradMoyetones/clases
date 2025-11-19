import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const { docs, meta } = defineDocs({
    dir: 'content/clases',
});

export default defineConfig();
