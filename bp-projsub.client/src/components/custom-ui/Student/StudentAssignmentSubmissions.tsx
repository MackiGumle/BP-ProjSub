import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UppyDragDrop } from "../UppyDragDrop";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { PartialSubmissionDto } from "@/Dtos/SubmissionDto";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getAssignmentFromCache } from "@/utils/cacheUtils";

// actually gets only the latest submission
async function fetchSubmission(assignmentId: string) {
    const { data } = await axios.get(`/api/Student/GetSubmissions/${assignmentId}`);
    return data;
}

export function StudentAssignmentSubmissions() {
    const { subjectId, assignmentId } = useParams<{ subjectId: string; assignmentId: string }>();
    const [isAssignmentOpen, setAssignmentOpen] = useState<boolean>(false);
    const queryClient = useQueryClient()

    const { data: submission, isLoading, isError, error } = useQuery<PartialSubmissionDto>({
        queryKey: ["parialsubmissions", assignmentId],
        queryFn: () => fetchSubmission(assignmentId!),
        enabled: !!assignmentId,
    });

    return (
        <div className="w-4xl mx-3 p-6">
            <div className="space-y-6">
                <Collapsible
                    open={isAssignmentOpen}
                    onOpenChange={() => setAssignmentOpen(!isAssignmentOpen)}
                >
                    <Card className="shadow-lg rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                            <span className="text-xl font-semibold">Název zadání</span>
                            <ChevronDown
                                className={`h-5 w-5 transition-transform duration-200 ${isAssignmentOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-6 py-4">
                            <p className="text-gray-700">Popis zadání</p>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                <div className="space-y-2">
                    {isLoading ? (
                        <Skeleton className="h-20 w-full rounded-md" />
                    ) : isError ? (
                        <p className="text-red-500">Failed to load submissions.</p>

                    ) : !submission ? (
                        <p className="text-muted-foreground">No submissions yet.</p>
                    ) : (
                        <Card className="p-4 border rounded-xl flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground">{new Date(submission.submissionDate).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{submission.rating || "-"} / {getAssignmentFromCache(queryClient, subjectId!, assignmentId!)?.maxPoints ?? '-'} points</p>
                            </div>
                            <Link to={`submission/${submission.id}`}>
                                <Button variant="outline">View</Button>
                            </Link>
                        </Card>
                    )
                    }
                </div>

                {assignmentId && (
                    <Card className="shadow-lg rounded-lg p-6">
                        <UppyDragDrop assignmentId={parseInt(assignmentId)} />
                    </Card>
                )}
            </div>


        </div>
    );
}
