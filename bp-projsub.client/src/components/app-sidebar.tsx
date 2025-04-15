import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
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
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SearchForm } from "@/components/search-form"
import { SubjectSwitcher } from "@/components/subject-switcher"
import { Check, ChevronDown, Plus } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"

import { AssignmentDto } from "@/Dtos/AssignmentDto"
import { getTimeRemaining, getTimeStatusColor } from "@/utils/timeRemaining"
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

// Managing collapsible groups with URL parameters
const useCollapsibleGroups = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialClosedGroups = React.useMemo(() => {
    if (searchParams.has("closed")) {
      const closedParam = searchParams.get("closed");
      return new Set<string>(closedParam?.split(",").filter(Boolean) || []);
    }

    // Default all open
    return new Set<string>();
  }, [searchParams]);

  const [closedGroups, setClosedGroups] = React.useState<Set<string>>(initialClosedGroups);

  // Update URL when closed groups change
  React.useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (closedGroups.size > 0) {
      newParams.set("closed", Array.from(closedGroups).join(","));
    } else {
      newParams.delete("closed");
    }

    setSearchParams(newParams, { replace: true });
  }, [closedGroups, searchParams, setSearchParams]);

  // Toggle group without side effects
  const toggleGroup = (type: string) => {
    setClosedGroups(prev => {
      const newSet = new Set(prev);
      newSet.has(type) ? newSet.delete(type) : newSet.add(type);
      return newSet;
    });
  };

  return { closedGroups, toggleGroup };
};

// Fetching and filtering assignments
const useAssignments = (subjectId: string | undefined, searchQuery: string) => {
  const { getRole } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['assignments', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const response = await axios.get(
        `/api/${getRole()}/GetAssignments/${subjectId}`,
      );
      return response.data as AssignmentDto[];
    },
    enabled: !!subjectId,
  });

  // Group and filter assignments
  const groupedAssignments = React.useMemo(() => {
    const groups: Record<string, AssignmentDto[]> = {};

    data?.filter(assignment => {
      const searchFields = [
        assignment.title,
        assignment.maxPoints
      ].join(" ").toLowerCase();

      return searchFields.includes(searchQuery.toLowerCase());
    }).forEach(assignment => {
      const type = assignment.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(assignment);
    });

    return Object.entries(groups);
  }, [data, searchQuery]);

  return { assignments: data, groupedAssignments, isLoading, error };
};


const AssignmentItemSkeleton = () => {
  return (
    <SidebarMenuItem className="group p-0 m-0">
      <div className="flex items-center justify-between w-full">
        <div className="w-full m-1 p-0 h-auto">
          <div className="w-full m-0 p-1 h-auto">
            <div className="flex flex-col flex-1 text-left space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </SidebarMenuItem>
  );
};

const AssignmentGroupSkeleton = () => {
  return (
    <SidebarGroup className="p-0">
      <div className="w-full flex items-center justify-between border-b p-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <SidebarGroupContent>
        <SidebarMenu className="p-0">
          {[1, 2, 3].map((i) => (
            <AssignmentItemSkeleton key={i} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      {[1, 2].map((i) => (
        <AssignmentGroupSkeleton key={i} />
      ))}
    </div>
  );
};

const EmptyStateMessage = ({
  subjectId,
  isLoading,
  error,
  hasAssignments,
  hasFilteredAssignments
}: {
  subjectId?: string;
  isLoading: boolean;
  error: unknown;
  hasAssignments: boolean;
  hasFilteredAssignments: boolean;
}) => {
  if (!subjectId) {
    return <div className="p-4 text-center text-muted-foreground">Select a subject to view assignments</div>;
  }

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading assignments</div>;
  }

  if (!hasAssignments) {
    return <div className="p-4 text-center text-muted-foreground">There are no assignments</div>;
  }

  if (!hasFilteredAssignments) {
    return <div className="p-4 text-center text-muted-foreground">No assignments match search</div>;
  }

  return null;
};

const AssignmentItem = ({
  assignment,
  subjectId,
  currentAssignmentId
}: {
  assignment: AssignmentDto;
  subjectId: string;
  currentAssignmentId?: string;
}) => {
  const { hasRole } = useAuth();
  const isStudent = hasRole("Student");

  return (
    <SidebarMenuItem key={assignment.id} className="group first:mt-1 p-0 mx-1">
      <div className="flex items-center justify-between w-full border rounded-md">
        <Link to={`subject/${subjectId}/assignments/${assignment.id}`} className="w-full m-0 p-0 h-auto">
          <SidebarMenuButton className="w-full m-0 p-1 h-auto" isActive={currentAssignmentId === String(assignment.id)}>
            <div className="flex flex-col flex-1 text-left">
              <span className="font-medium">{assignment.title}</span>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-xs ${getTimeStatusColor(assignment.dateAssigned, assignment.dueDate)}`}>
                    Due: {assignment.dueDate ?
                      getTimeRemaining(assignment.dueDate) : 'No due date'}
                  </span>
                  {assignment.maxPoints && (
                    <span className="text-xs text-muted-foreground">
                      {isStudent ? "Points: " : "Max points: "}
                      {isStudent ? `${assignment.rating ?? "-"}/${assignment.maxPoints}` : assignment.maxPoints}
                    </span>
                  )}
                </div>

                <span className="text-xs text-muted-foreground">{assignment.description}</span>
              </div>
            </div>

            {assignment.isSubmitted && (
              <div className="flex items-center ml-2 self-center">
                <Check className="h-4 w-4 text-green-400" />
              </div>
            )}
          </SidebarMenuButton>
        </Link>
      </div>
    </SidebarMenuItem>
  );
};

const AssignmentGroup = ({
  type,
  assignments,
  isOpen,
  onToggle,
  subjectId,
  currentAssignmentId
}: {
  type: string;
  assignments: AssignmentDto[];
  isOpen: boolean;
  onToggle: () => void;
  subjectId: string;
  currentAssignmentId?: string;
}) => {
  const { getRole } = useAuth();
  const isTeacher = getRole() == "Teacher";

  return (
    <Collapsible key={type} open={isOpen} onOpenChange={onToggle}>
      <SidebarGroup className="p-0">
        <CollapsibleTrigger className="w-full flex items-center justify-between">
          <SidebarGroupLabel>
            <span>{type}</span>
          </SidebarGroupLabel>

          <div className="flex items-center gap-1">
            {isTeacher && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="m-0 p-0">
                      <Button variant="ghost" className="text-xs h-4 w-4" size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Link to={`/subject/${subjectId}/manage?tab=assignment&type=${type}`}>
                          <Plus className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Create assignment
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="m-0 p-0">
                  <Button variant="ghost" className="text-xs h-4 w-4" size="icon">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Collapse category
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu className="p-0">
              {assignments.map((assignment) => (
                <AssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                  subjectId={subjectId}
                  currentAssignmentId={currentAssignmentId}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible >
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { subjectId, assignmentId } = useParams<{ subjectId: string, assignmentId: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";
  const { closedGroups, toggleGroup } = useCollapsibleGroups();
  const { groupedAssignments, assignments, isLoading, error } = useAssignments(subjectId, searchQuery);


  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SubjectSwitcher />
        <div className="flex items-center mt-1">
          <SearchForm className="flex-grow" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <EmptyStateMessage
          subjectId={subjectId}
          isLoading={isLoading}
          error={error}
          hasAssignments={!!assignments?.length}
          hasFilteredAssignments={!!groupedAssignments.length}
        />

        {groupedAssignments.length > 0 && (
          <>
            {groupedAssignments.map(([type, typeAssignments]) => (
              <AssignmentGroup
                key={type}
                type={type}
                assignments={typeAssignments}
                isOpen={!closedGroups.has(type)}
                onToggle={() => toggleGroup(type)}
                subjectId={subjectId!}
                currentAssignmentId={assignmentId}
              />
            ))}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}