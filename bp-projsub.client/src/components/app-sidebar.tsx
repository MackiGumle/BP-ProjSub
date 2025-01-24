import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  SidebarRail,
} from "@/components/ui/sidebar"
import { SearchForm } from "@/components/search-form"
import { SubjectSwitcher } from "@/components/subject-switcher"
import { ChevronDown } from "lucide-react"
import { useSearchParams } from "react-router-dom";

interface SubjectDto {
  id: number
  name: string
  description?: string
}

interface AssignmentDto {
  id: number
  type?: string
  title: string
  description?: string
  dateAssigned: string
  dueDate?: string
  maxPoints?: number
}

// Sidebar component for displaying assignments
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasRole, getRole } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  // Get selected subject from URL
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<number | null>(
    Number(searchParams.get("subject")) || null
  )

  // Get open groups from URL
  const initialOpenGroups = new Set(searchParams.get("open")?.split(",") || [])
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(initialOpenGroups)


  // Update URL when subject changes
  React.useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (selectedSubjectId) {
      newParams.set("subject", String(selectedSubjectId))
    } else {
      newParams.delete("subject")
    }
    setSearchParams(newParams, { replace: true })
  }, [selectedSubjectId])

  // Update URL when groups change
  const updateUrlGroups = (groups: Set<string>) => {
    const newParams = new URLSearchParams(searchParams)
    groups.size > 0
      ? newParams.set("open", Array.from(groups).join(","))
      : newParams.delete("open")
    setSearchParams(newParams, { replace: true })
  }

  // Toggle group open state and update URL
  const toggleGroup = (type: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev)
      newSet.has(type) ? newSet.delete(type) : newSet.add(type)
      updateUrlGroups(newSet)
      return newSet
    })
  }

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
        // assignment.description, // description can be large, so it will be excluded from search
        assignment.maxPoints
      ].join(" ").toLowerCase();

      return searchFields.includes(searchQuery.toLowerCase());
    }).forEach(assignment => { // group by type
      const type = assignment.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(assignment);
    });

    return Object.entries(groups);
  }, [assignments, searchQuery])


  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SubjectSwitcher
          onSubjectSelect={setSelectedSubjectId}
          selectedSubjectId={selectedSubjectId}
        />
        <SearchForm />
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
                          <SidebarMenuItem key={assignment.id} className="group">
                            <div className="flex items-center justify-between w-full gap-2">
                              <SidebarMenuButton className="w-full m-2 h-auto" onClick={() => console.log('View assignment', assignment.id)}>
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
                              {hasRole("Teacher") && (
                                <SidebarMenuAction
                                  className="h-8 w-8 p-0"
                                  onClick={() => console.log('Edit assignment', assignment.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </SidebarMenuAction>
                              )}
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
      <SidebarRail />
    </Sidebar>
  )
}