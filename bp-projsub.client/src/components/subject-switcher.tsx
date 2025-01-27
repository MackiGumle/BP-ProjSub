import * as React from "react"
import { Check, ChevronsUpDown, BookOpen, Plus } from "lucide-react"
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
import { useSearchParams } from "react-router-dom"
import SubjectDto from "@/Dtos/SubjectDto"
import { Separator } from "./ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { CreateSubjectForm } from "./forms/teacher/CreateSubjectForm"


// 
export function SubjectSwitcher({
  onSubjectSelect,
  selectedSubjectId
}: {
  onSubjectSelect: (subjectId: number) => void
  selectedSubjectId: number | null
}) {

  const { getRole, hasRole } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // Fetch subjects
  const { data: subjects, isLoading, error } = useQuery<SubjectDto[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await axios.get(`/api/${getRole()}/GetSubjects`, { withCredentials: true })
      return response.data
    }
  })

  const handleSubjectSelect = (subjectId: number) => {
    onSubjectSelect(subjectId)
    const newParams = new URLSearchParams(searchParams)
    newParams.set("subject", String(subjectId))
    setSearchParams(newParams, { replace: true })
  }

  const selectedSubject = subjects?.find(subj => subj.id === selectedSubjectId)

  const handleAddSubject = () => {
    console.log("Add subject")
  }

  return (
    <Dialog>
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
              {hasRole("Teacher") && (
                <>
                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      <Plus className="mr-2 " />
                      Add subject
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuSeparator />
                </>
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
                    {subject.id === selectedSubjectId && <Check className="ml-2 size-4" />}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle aria-hidden></DialogTitle>
        </DialogHeader>
        <DialogDescription hidden />
        <CreateSubjectForm />
      </DialogContent>
    </Dialog>
  )
}