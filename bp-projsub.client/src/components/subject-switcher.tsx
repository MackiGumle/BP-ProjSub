import * as React from "react"
import { Check, ChevronsUpDown, BookOpen, Plus, Wrench } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
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
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { SubjectDto } from "@/Dtos/SubjectDto"
import { useSubjectsQuery } from "@/hooks/useCustomQuery"


// 
export function SubjectSwitcher({
  onSubjectSelect,
  // selectedSubjectId
}: {
  onSubjectSelect: (subjectId: number) => void
  // selectedSubjectId: number | null
}) {
  const { getRole, hasRole } = useAuth()
  const { subjectId } = useParams();
  const navigate = useNavigate()
  const { data: subjects, isLoading, error } = useSubjectsQuery();

  const handleSubjectSelect = (subjectId: number) => {
    onSubjectSelect(subjectId)
    navigate(`/subject/${subjectId}`)
  }


  const selectedSubject = subjects?.find(subj => subj.id === Number(subjectId))


  return (
    <SidebarMenu className="m-1">
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
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
              subjects?.map((subject) => (
                <DropdownMenuItem
                  key={subject.id}
                  onSelect={() => handleSubjectSelect(subject.id)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate max-w-[200px]">{subject.name}</span>
                  {subject.id === Number(subjectId) && <Check className="ml-2 size-4" />}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}