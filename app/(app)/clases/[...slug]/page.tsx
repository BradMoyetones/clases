import { extractTOC, getClaseContent, readFileFromSlug } from '@/lib/clases';
import matter from 'gray-matter';
import { mdxComponents } from '@/mdx-components';
import { notFound } from 'next/navigation';
import { createMDXComponent } from '@/lib/mdx';
import { DocsCopyPage } from '@/components/docs-copy-page';
import { DocsTableOfContents } from '@/components/docs-toc';
import Badge from '@/components/badge';
import { languages } from '@/lib/languajes';
import { PreviewModal } from '@/components/preview-modal';

type PageProps = {
    params: Promise<{
        slug: string[];
    }>;
};

export default async function page(props: PageProps) {
    const { slug } = await props.params;

    // Obtener archivo MDX
    const parsed = getClaseContent([...slug], 'README.mdx');

    if (!parsed) return notFound();

    const { meta: doc, content } = parsed;

    const toc = extractTOC(content);

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
                                    <PreviewModal src={`/api/clases/${doc.id}/index.html`} />
                                    <DocsCopyPage page={content} />
                                </div>
                            </div>
                            {doc.description && (
                                <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                                    {doc.description}
                                </p>
                            )}
                        </div>
                        {doc.languages && doc.languages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {doc.languages?.map((lang) => {
                                    const language = languages[lang];
                                    const Icon = language.icon;
                                    return <Badge key={lang} lang={lang} className={language.className} icon={Icon} />;
                                })}
                            </div>
                        )}
                    </div>
                    <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
                        <MDX components={mdxComponents} />
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
