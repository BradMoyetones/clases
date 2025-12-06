import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";

// Importa todos los plugins (debes agregarlos aquí)
import remarkGfm from "remark-gfm"; // Ya lo tienes
import remarkMath from "remark-math";
import remarkCodeImport from "remark-code-import";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";

import { mdxComponents } from "./mdx-components";
import { transformers } from "@/lib/highlight-code";

type CustomMDXProps = MDXRemoteProps & {
  components?: typeof mdxComponents;
};

export function CustomMDX(props: CustomMDXProps) {
  return (
    <MDXRemote 
      {...props} 
      components={{ ...mdxComponents, ...(props.components || {}) }} 
      options={{
        mdxOptions: {
          // Plugins que procesan Markdown (antes del HTML/AST)
          remarkPlugins: [
            remarkGfm,
            remarkMath,
            remarkCodeImport,
          ],
          // Plugins que procesan HTML (después del Markdown/AST)
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap' }], // Opciones comunes
            rehypeKatex,
            [rehypePrettyCode, { 
              theme: {
                // Tema por defecto (Light mode)
                light: "github-light",
                // Tema para modo oscuro (se activa cuando el HTML tiene la clase '.dark')
                dark: "github-dark",
              },
              transformers,
              keepBackground: false,
             }],
          ],
        },
      }}
    />
  );
}