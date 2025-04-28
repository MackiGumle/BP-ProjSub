import { useAssignmentsQuery } from "@/hooks/useCustomQuery";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Clock, FileText, ChevronDown } from "lucide-react";
import { getTimeRemaining, getTimeStatusColor } from "@/utils/timeRemaining";
import { useAuth } from "@/context/UserContext";
import { useState } from "react";
import { Separator } from "../ui/separator";

function AssignmentSkeletonCard() {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-start gap-3 p-3">
                <Skeleton className="aspect-square size-10 rounded-lg flex-shrink-0" />
                <div className="space-y-1.5 w-full">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </CardHeader>
            <CardContent className="px-5 py-3 pt-0">
                <Skeleton className="h-4 w-full mb-2" />
            </CardContent>
        </Card>
    );
}

export function AssignmentsGrid() {
    const { subjectId } = useParams<{ subjectId: string }>();
    const { data: assignments, isLoading, error } = useAssignmentsQuery(subjectId);
    const { hasRole } = useAuth();
    const isStudent = hasRole("Student");

    const [collapsedTypes, setCollapsedTypes] = useState<Set<string>>(new Set());

    const toggleType = (type: string) => {
        setCollapsedTypes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    if (isLoading) return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
            {Array(8).fill(0).map((_, index) => (
                <AssignmentSkeletonCard key={index} />
            ))}
        </div>
    );

    if (error) return (
        <div className="flex justify-center p-8 text-red-500">Error loading assignments</div>
    );

    if (!assignments || assignments.length === 0) {
        return <div className="flex justify-center p-8">No assignments found for this subject</div>;
    }

    const groupedAssignments: Record<string, typeof assignments> = {};
    assignments.forEach(assignment => {
        const type = assignment.type || 'Other';
        if (!groupedAssignments[type]) {
            groupedAssignments[type] = [];
        }
        groupedAssignments[type].push(assignment);
    });

    return (
        <div className="p-4 space-y-8">
            {Object.entries(groupedAssignments).map(([type, typeAssignments]) => (
                <div key={type} className="space-y-4">
                    <div
                        className="flex items-center gap-2 cursor-pointer hover:text-primary"
                        onClick={() => toggleType(type)}
                    >
                        <ChevronDown
                            className={`h-5 w-5 transition-transform duration-200 ${collapsedTypes.has(type) ? '' : 'rotate-180'
                                }`}
                        />
                        <h2 className="text-xl font-bold">{type}</h2>
                        <div className="text-sm text-muted-foreground">({typeAssignments.length})</div>
                    </div>
                    <Separator />

                    {!collapsedTypes.has(type) && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {typeAssignments.map((assignment) => (
                                <Link to={`/subject/${subjectId}/assignments/${assignment.id}`} key={assignment.id}>
                                    <Card className="hover:bg-accent transition-colors cursor-pointer h-full shadow-sm hover:shadow-md">
                                        <CardHeader className="flex flex-row items-start gap-3 p-3">
                                            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                                                <FileText className="size-5" />
                                            </div>
                                            <div className="space-y-1.5 w-full">
                                                <CardTitle className="text-base leading-tight">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <span className="truncate">{assignment.title}</span>
                                                        {assignment.isSubmitted && (
                                                            <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </CardTitle>
                                                <CardDescription className="text-sm line-clamp-2">
                                                    {/* {assignment.description || "No description"} */}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-5 py-3 pt-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span className={getTimeStatusColor(assignment.dateAssigned, assignment.dueDate)}>
                                                        {assignment.dueDate ? getTimeRemaining(assignment.dueDate) : 'No due date'}
                                                    </span>
                                                </div>
                                                {assignment.maxPoints && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {isStudent ? "Points: " : "Max points: "}
                                                        {isStudent ? `${assignment.rating ?? "-"}/${assignment.maxPoints}` : assignment.maxPoints}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}