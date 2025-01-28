import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { ChevronUp, Pencil, Plus } from "lucide-react"
import { useAuth } from "@/context/UserContext"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SearchForm } from "@/components/search-form"
import { SubjectSwitcher } from "@/components/subject-switcher"
import { ChevronDown } from "lucide-react"
import { useSearchParams } from "react-router-dom";
import { TeacherAssignmentActions } from "@/components/custom-ui/Teacher/AssignmentActions"
import { ThemeToggle } from "./theme-components/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { AssignmentDto } from "@/Dtos/AssignmentDto"


// Sidebar component for displaying assignments
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { getRole, hasRole } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";


  // Get selected subject from URL
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<number | null>(
    Number(searchParams.get("subject")) || null
  )

  // Get selected assignment from URL
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<number | null>(
    Number(searchParams.get("assignment")) || null
  )

  // Initialize open groups from URL using useMemo to avoid warning
  const initialOpenGroups = React.useMemo(
    () => new Set(searchParams.get("open")?.split(",") || []),
    [searchParams]
  )
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(initialOpenGroups)

  // Update URL when open groups change
  React.useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    const currentOpen = searchParams.get("open")?.split(",") || []

    // Only update if there's an actual change
    if (Array.from(openGroups).join(",") !== currentOpen.join(",")) {
      if (openGroups.size > 0) {
        newParams.set("open", Array.from(openGroups).join(","))
      } else {
        newParams.delete("open")
      }
      setSearchParams(newParams, { replace: true })
    }
  }, [openGroups, searchParams, setSearchParams])

  // Toggle group without side effects
  const toggleGroup = (type: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev)
      newSet.has(type) ? newSet.delete(type) : newSet.add(type)
      return newSet
    })
  }

  // Update URL when selected assignment changes
  React.useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (selectedAssignmentId) {
      newParams.set("assignment", String(selectedAssignmentId))
    } else {
      newParams.delete("assignment")
    }
    setSearchParams(newParams, { replace: true })
  }, [selectedAssignmentId])

  // Fetch assignments
  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['assignments', selectedSubjectId],
    queryFn: async () => {
      if (!selectedSubjectId) return []
      const response = await axios.get(
        `/api/${getRole()}/GetAssignments?subjectId=${selectedSubjectId}`,
      )
      return response.data as AssignmentDto[]
    },
    enabled: !!selectedSubjectId,
  })

  // Group assignments by type
  const groupedAssignments = React.useMemo(() => {
    const groups: Record<string, AssignmentDto[]> = {}

    // First filter, then group
    assignments?.filter(assignment => {
      const searchFields = [
        assignment.title,
        assignment.maxPoints
      ].join(" ").toLowerCase();

      return searchFields.includes(searchQuery.toLowerCase());
    }).forEach(assignment => { // group by type
      const type = assignment.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(assignment);
    }    
  );
  
    return Object.entries(groups);
  }, [assignments, searchQuery])


  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SubjectSwitcher
          onSubjectSelect={setSelectedSubjectId}
          selectedSubjectId={selectedSubjectId}
        />
        <div className="flex items-center mt-2">
          <SearchForm className="flex-grow" />

          {selectedSubjectId && hasRole("Teacher") && (
            <SidebarMenuButton
              className="shrink-0 p-0 w-6 h-6 flex items-center justify-center"
              onClick={() => console.log("Create assignment")}
            >
              <Plus className="h-6 w-6" />
            </SidebarMenuButton>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="">
        {!selectedSubjectId ? (
          <div className="p-4 text-center text-muted-foreground">
            Select a subject to view assignments
          </div>
        ) : isLoading ? (
          <div className="p-4">Loading assignments...</div>
        ) : error ? (
          <div className="p-4 text-red-500">Error loading assignments</div>
        ) : assignments?.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No assignments found for this subject
          </div>
        ) : groupedAssignments.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No assignments match search criteria
          </div>
        ) : (
          <>
            {groupedAssignments.map(([type, typeAssignments]) => (
              <Collapsible
                key={type}
                open={openGroups.has(type)}
                onOpenChange={() => toggleGroup(type)}
              >
                <SidebarGroup className="p-0">
                  <CollapsibleTrigger className="w-full flex items-center justify-between border-b">
                    <SidebarGroupLabel>
                      <span>{type}</span>
                    </SidebarGroupLabel>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openGroups.has(type) ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu className="p-0">
                        {typeAssignments.map((assignment) => (
                          <SidebarMenuItem key={assignment.id} className="group p-0 m-0">
                            <div className="flex items-center justify-between w-full">
                              <SidebarMenuButton className="w-full m-1 p-1 h-auto" onClick={() => setSelectedAssignmentId(assignment.id)} isActive={selectedAssignmentId === assignment.id}>
                                <div className="flex flex-col flex-1 text-left">
                                  <span className="font-medium">{assignment.title}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Due: {assignment.dueDate ?
                                      new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                                  </span>
                                  {assignment.maxPoints && (
                                    <span className="text-xs text-muted-foreground">
                                      Max points: {assignment.maxPoints}
                                    </span>
                                  )}
                                </div>
                              </SidebarMenuButton>
                              {/* <SidebarMenuAction> */}
                                {/*for some reason this doesnt show the menu correctly?!?!?!? <TeacherAssignmentActions assignmentId={assignment.id} />
                                <ThemeToggle /> */}
                              {/* </SidebarMenuAction> */}
                              {/* {hasRole("Teacher") && <TeacherAssignmentActions assignmentId={assignment.id} />} */}
                            </div>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ))}
          </>
        )}
      </SidebarContent>
      
    </Sidebar>
  )
}