import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import CurrentUserButton from "@/components/custom-ui/CurrentUserButton"
import { ThemeToggle } from "../theme-components/theme-toggle"
import { format } from "date-fns"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { ChevronDown } from "lucide-react"
import { Card } from "../ui/card"

export default function Page() {
  const [isAssignmentOpen, setAssignmentOpen] = useState<boolean | undefined>(true)

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />

              {/* <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Separator orientation="vertical" className="mr-2 h-4" /> */}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle size="sm" />
              <CurrentUserButton />
            </div>
          </header>

          <div className="p-4">
            <Collapsible
              open={isAssignmentOpen}
              onOpenChange={() => setAssignmentOpen(!isAssignmentOpen)}
            >

              <Card className="p-4">
                <CollapsibleTrigger className="w-full flex items-center justify-between border-b">
                  <div className="p-2 flex items-center gap-2">
                    <span>Assignment</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isAssignmentOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>

                  <h1 className="text-2xl font-semibold">Nazev zadani</h1>
                  <p className="text-muted-foreground">
                    Popis zadani
                  </p>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-1 flex-col gap-4 p-4">
            {Array.from({ length: 24 }).map((_, index) => (
              <div
                key={index}
                className="aspect-video h-12 w-full rounded-lg bg-muted/50 flex items-center justify-between p-4"
              >
                <span className="text-muted-foreground text-center">
                  {'st' + (index + 1)}
                </span>
                <span className="text-muted-foreground text-center">
                  {format(new Date(), 'dd.MM. yyyy')}
                </span>
                <span className="text-muted-foreground text-center">
                  Points: {index + 1}/24
                </span>
              </div>
            ))}
          </div>
        </SidebarInset>

      </SidebarProvider >
    </>
  )
}
