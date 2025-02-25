import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import CurrentUserButton from "@/components/custom-ui/CurrentUserButton"
import { ThemeToggle } from "./theme-components/theme-toggle"
import { useState } from "react"

export default function AppPage({ children }: { children: React.ReactNode }) {
  // const [isAssignmentOpen] = useState<boolean | undefined>(true)

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* <ThemeToggle size="sm" /> */}
              <CurrentUserButton />
            </div>
          </header>

          {children}

        </SidebarInset>

      </SidebarProvider >
    </>
  )
}
