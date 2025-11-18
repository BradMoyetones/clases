import { extractTOC, readFileFromSlug } from '@/lib/clases';
import matter from 'gray-matter';
import { mdxComponents } from '@/mdx-components';
import { notFound } from 'next/navigation';
import { createMDXComponent } from '@/lib/mdx';
import { DocsCopyPage } from '@/components/docs-copy-page';
import { DocsTableOfContents } from '@/components/docs-toc';

type PageProps = {
    params: Promise<{
        slug: string[];
    }>;
};

export default async function page(props: PageProps) {
    const { slug } = await props.params;

    // Obtener archivo MDX
    const file = readFileFromSlug([...slug, 'README.mdx']);

    if (!file) return notFound();

    const text = file!.buffer.toString('utf-8');

    const { data: doc, content } = matter(text);

    const toc = extractTOC(content);

    // 2. --- Crear componente MDX dinámico ---
    const MDX = createMDXComponent(content);

    return (
        <div data-slot="docs" className="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full">
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="h-(--top-spacing) shrink-0" />
                <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                                <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                                    {doc.title}
                                </h1>
                                <div className="docs-nav bg-background/80 border-border/50 fixed inset-x-0 bottom-0 isolate z-50 flex items-center gap-2 border-t px-6 py-4 backdrop-blur-sm sm:static sm:z-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-1.5 sm:backdrop-blur-none">
                                    <DocsCopyPage
                                        page={content}
                                    />
                                </div>
                            </div>
                            {doc.description && (
                                <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                                    {doc.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
                        <MDX components={mdxComponents} />
                    </div>
                    <div className="w-full overflow-hidden">
                        <div className='bg-muted px-2 py-4 rounded-t-lg flex items-center gap-2'>
                            <div className='size-3 bg-red-400 aspect-square rounded-full' />
                            <div className='size-3 bg-yellow-300/80 aspect-square rounded-full' />
                            <div className='size-3 bg-green-600 aspect-square rounded-full' />
                        </div>
                        <iframe
                            src={`/api/clases/${slug[0]}/index.html`}
                            className="w-full h-[600px] rounded-b-lg border"
                            loading="lazy"
                        />
                    </div>

                </div>
                <div className="mx-auto hidden h-16 w-full max-w-2xl items-center gap-2 px-4 sm:flex md:px-0">
                    {/* Botones vecinos */}
                </div>
            </div>
            <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--footer-height)+2rem)] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
                <div className="h-(--top-spacing) shrink-0" />
                {toc?.length ? (
                    <div className="no-scrollbar overflow-y-auto px-8">
                        <DocsTableOfContents toc={toc} />
                        <div className="h-12" />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
