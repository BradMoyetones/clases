import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCodeImport from 'remark-code-import';

export function createMDXComponent(source: string) {
    return function MDXComponent(props: any) {
        return (
            <MDXRemote
                source={source}
                components={props.components}
                options={{
                    parseFrontmatter: false,
                    mdxOptions: {
                        development: false,

                        remarkPlugins: [remarkGfm, remarkMath, remarkCodeImport],

                        rehypePlugins: [
                            rehypeSlug,
                            [
                                rehypeAutolinkHeadings,
                                {
                                    behavior: 'wrap',
                                },
                            ],
                            [
                                rehypePrettyCode,
                                {
                                    theme: {
                                        light: 'github-light-default',
                                        dark: 'github-dark',
                                    },

                                    keepBackground: false,

                                    onVisitLine(node: any) {
                                        // Evitar colapso de líneas vacías
                                        if (node.children.length === 0) {
                                            node.children = [{ type: 'text', value: ' ' }];
                                        }
                                    },

                                    onVisitHighlightedLine(node: any) {
                                        node.properties.className = [
                                            ...(node.properties.className || []),
                                            'highlighted',
                                        ];
                                    },

                                    onVisitHighlightedWord(node: any) {
                                        node.properties.className = [
                                            ...(node.properties.className || []),
                                            'word--highlighted',
                                        ];
                                    },
                                },
                            ],
                            rehypeKatex,
                        ],

                        remarkRehypeOptions: {
                            footnoteLabel: 'Nota',
                        },
                    },
                }}
            />
        );
    };
}
