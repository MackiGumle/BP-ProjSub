import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Pencil, Plus } from "lucide-react"
import { useAuth } from "@/context/UserContext"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SearchForm } from "@/components/search-form"
import { SubjectSwitcher } from "@/components/subject-switcher"
import { ChevronDown } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom";

import { AssignmentDto } from "@/Dtos/AssignmentDto"
import { Button } from "./ui/button"


// Sidebar component for displaying assignments
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { getRole, hasRole } = useAuth()
  const { subjectId, assignmentId } = useParams<{ subjectId: string, assignmentId: string }>();

  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";


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

  // Fetch assignments
  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['assignments', subjectId],
    queryFn: async () => {
      if (!subjectId) return []
      const response = await axios.get(
        `/api/${getRole()}/GetAssignments/${subjectId}`,
      )
      return response.data as AssignmentDto[]
    },
    enabled: !!subjectId,
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
        <SubjectSwitcher />
        <div className="flex items-center mt-2">
          <SearchForm className="flex-grow" />

          {/* {subjectId && hasRole("Teacher") && (
            <SidebarMenuButton
              className="shrink-0 p-0 w-6 h-6 flex items-center justify-center"
              onClick={() => console.log("Create assignment")}
            >
              <Plus className="h-6 w-6" />
            </SidebarMenuButton>
          )} */}
        </div>
      </SidebarHeader>
      <SidebarContent className="">
        {!subjectId ? (
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
                        {typeAssignments.map((assignment) => ( // each assignment
                          <SidebarMenuItem key={assignment.id} className="group p-0 m-0">
                            <div className="flex items-center justify-between w-full">
                              <Link to={`subject/${subjectId}/assignments/${assignment.id}`} className="w-full m-1 p-0 h-auto">
                                <SidebarMenuButton className="w-full m-0 p-1 h-auto" isActive={assignmentId === String(assignment.id)}>
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
                              </Link>
                              <SidebarMenuAction className="flex items-center">
                                {/*for some reason this doesnt show the menu correctly?!?!?!? <TeacherAssignmentActions assignmentId={assignment.id} />
                                <ThemeToggle /> */}
                                {hasRole("Teacher") && (
                                  <Link to={`subject/${subjectId}/assignments/${assignment.id}/edit`}>
                                    {/* <SidebarMenuButton
                                      className="w-6 h-6 p-1"
                                      onClick={() => console.log("Assignment actions")}
                                    > */}
                                    <div className="">
                                      <Pencil className="w-6 h-6 p-1" />
                                    </div>
                                    {/* </SidebarMenuButton> */}
                                  </Link>
                                )}
                              </SidebarMenuAction>
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