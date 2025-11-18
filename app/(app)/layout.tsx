import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header-animated"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background relative flex min-h-svh flex-col theme-container">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <div className="container-wrapper flex flex-1 flex-col px-2">
          <div className="h-full w-full">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
