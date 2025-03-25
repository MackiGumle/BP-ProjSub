import { Check, ChevronsUpDown, BookOpen, Wrench, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/UserContext"
import { Link, useParams } from "react-router-dom"
import { useSubjectsQuery } from "@/hooks/useCustomQuery"


// 
export function SubjectSwitcher() {
  const { hasRole } = useAuth()
  const { subjectId } = useParams();
  const { data: subjects, isLoading, error } = useSubjectsQuery();

  const selectedSubject = subjects?.find(subj => subj.id === Number(subjectId))

  return (
    <SidebarMenu className="m-1">
      <SidebarMenuItem>
        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild className="">
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BookOpen className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Subjects</span>
                <span className="truncate max-w-[160px]">
                  {selectedSubject?.name || "Select Subject"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
            {hasRole("Teacher") && (
              // <Link to={`subject/${subjectId}/create`}>
              <Link to={`/createsubject/`}>
                <DropdownMenuItem>
                  <Plus className="mr-2 " />
                  Create subject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </Link>
            )}
            {hasRole("Teacher") && selectedSubject && (
              <Link to={`/subject/${subjectId}/manage`}>
                <DropdownMenuItem>
                  <Wrench className="mr-2 " />
                  Manage subject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </Link>
            )}

            {isLoading ? (
              <DropdownMenuItem disabled>Loading subjects...</DropdownMenuItem>
            ) : error ? (
              <DropdownMenuItem disabled className="text-red-500">
                Error loading subjects
              </DropdownMenuItem>
            ) : (
              subjects?.length === 0 ? (
                <DropdownMenuItem disabled>No subjects found</DropdownMenuItem>
              ) :
                subjects?.map((subject) => (
                  <Link to={`/subject/${subject.id}`} key={subject.id}>
                    <DropdownMenuItem
                      key={subject.id}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate max-w-[200px]">{subject.name}</span>
                      {subject.id === Number(subjectId) && <Check className="ml-2 size-4" />}
                    </DropdownMenuItem>
                  </Link>
                ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}