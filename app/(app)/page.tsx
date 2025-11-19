import { getClases } from '@/lib/clases';
import { Hero } from './components/hero-animated';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { languages } from '@/lib/languajes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Badge from '@/components/badge';
import { ArrowRight } from 'lucide-react';

export default function Home() {
    const clases = getClases();

    return (
        <div className="flex flex-col w-full">
            <Hero />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 max-w-7xl mx-auto w-full p-4">
                {clases.map((clase) => (
                    <Card key={clase.id}>
                        <CardHeader>
                            <CardTitle>{clase.meta?.title}</CardTitle>
                            <CardDescription className="line-clamp-1">{clase.meta?.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {clase.meta?.languages?.map((language) => {
                                    const lang = languages[language];
                                    const Icon = lang.icon;

                                    return (
                                        <Badge key={language} lang={language} className={lang.className} icon={Icon} />
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-2 justify-end mt-2">
                                <Link href={`/clases/${clase.id}`}>
                                    <Button variant={'outline'} size={'sm'} className="group cursor-pointer">
                                        Ver
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-all" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
