import { notFound } from 'next/navigation';
import { getContent } from '@/lib/mdx';
import { DocsCopyPage } from '@/components/docs-copy-page';
import { DocsTableOfContents } from '@/components/docs-toc';
import { Metadata } from 'next';
import { getTableOfContents } from 'fumadocs-core/content/toc';
import { Section, SectionContent } from '@/components/section';
import { CustomMDX } from '@/components/mdx';

type PageProps = {
    params: Promise<{
        slug: string[];
    }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const {slug} = await params
    const legal = getContent(["clases", "WEB", ...slug]).find((post) => post.slug === "README");
    
    if (!legal) {
        return {
            title: "Página no encontrada",
            description: "La página legal solicitada no existe.",
        };
    }

    return {
        title: legal.metadata.title,
        description: legal.metadata.description || "Información de la clase",
    };
}

export default async function ClasePage(props: PageProps) {
    const { slug } = await props.params;
    const legal = getContent(["clases", "WEB", ...slug]).find((post) => post.slug === "README");

    if (!legal) {
        notFound();
    }

    const tocItems = getTableOfContents(legal.content)

    return (
        <Section>
            <SectionContent>
                <div className="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full @container">

                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 py-6 md:px-0 lg:py-8">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col gap-2">
                                <div className="flex items-start justify-between">
                                    <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                                        {legal.metadata.title}
                                    </h1>
                                    <div className="docs-nav bg-background/80 border-border/50 fixed inset-x-0 bottom-0 isolate z-50 flex items-center gap-2 border-t px-6 py-4 backdrop-blur-sm sm:static sm:z-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-1.5 sm:backdrop-blur-none">
                                        <DocsCopyPage
                                            page={legal.content}
                                        />
                                    </div>
                                </div>
                                {legal.metadata.description && (
                                    <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                                        {legal.metadata.description}
                                    </p>
                                )}
                                </div>
                            </div>
                            <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0 @container">
                                <CustomMDX source={legal.content} />
                            </div>
                        </div>
                    </div>

                    <div className="sticky top-[53px] ml-auto hidden h-screen w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 @xl:flex">
                        {tocItems.length > 0 ? (
                            <div className="no-scrollbar overflow-y-auto px-8 pt-6">
                                <DocsTableOfContents toc={tocItems} />
                                <div className="h-12" />
                            </div>
                        ) : null}
                    </div>
                </div>
            </SectionContent>
        </Section>
    );
}
