import { getClases } from "@/lib/clases";
import { Hero } from "./components/hero-animated";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { languages } from "@/lib/languajes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const clases = getClases()

  return (
    <div className="flex flex-col w-full">
      <Hero />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 max-w-7xl mx-auto w-full p-4">
        {clases.map(clase => (
          <Card key={clase.id}>
            <CardHeader>
              <CardTitle>
                {clase.meta?.title}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {clase.meta?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {clase.meta?.languages?.map((language) => {
                  const lang = languages[language]
                  const Icon = lang.icon

                  return (
                    <span key={language} className={cn(lang.className, "flex items-center gap-2 w-fit rounded-full px-2 py-1")}>
                      {Icon ? <Icon className="size-5" />: null}
                      {language}
                    </span>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <Link href={`/clases/${clase.id}`}>
                  <Button variant={"link"} size={"sm"}>
                    Ver
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
