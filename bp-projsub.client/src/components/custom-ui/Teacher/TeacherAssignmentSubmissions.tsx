import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PartialSubmissionDto } from "@/Dtos/SubmissionDto";
import { AssignmentDto } from "@/Dtos/AssignmentDto";


async function fetchSubmissions(assignmentId: string) {
    const { data } = await axios.get(`/api/Teacher/GetSubmissions/${assignmentId}`);
    return data;
}


export function TeacherAssignmentSubmissions() {
    const { subjectId, assignmentId } = useParams<{ subjectId: string, assignmentId: string }>();
    const [isAssignmentOpen, setAssignmentOpen] = useState<boolean | undefined>(false);
    const queryClient = useQueryClient();

    const getAssignmentFromCache = () => {
        try {
            const assignments = queryClient.getQueryData<AssignmentDto[]>(['assignments', subjectId]);
            console.log('Cached Assignment:', assignments);

            const assignment = assignments?.find(a => a.id === Number(assignmentId));

            return assignment;
        } catch (error) {
            console.error('Error fetching assignment from cache:', error);
            return null;
        }
    };

    const { data: submissions, isLoading, isError } = useQuery<PartialSubmissionDto[]>({
        queryKey: ["parialsubmissions", assignmentId],
        queryFn: () => fetchSubmissions(assignmentId!),
        enabled: !!assignmentId,
    });

    return (
        <div className="w-full mx-auto p-6 space-y-4">

            <Collapsible open={isAssignmentOpen} onOpenChange={() => setAssignmentOpen(!isAssignmentOpen)}>
                <Card className="p-4 shadow-md border rounded-2xl">
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-2 border-b cursor-pointer">
                        <h2 className="text-lg font-semibold">Assignment Details</h2>
                        <ChevronDown className={`h-5 w-5 transition-transform ${isAssignmentOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <p className="text-muted-foreground p-2">Detailed description of the assignment goes here.</p>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            <h2 className="text-xl font-semibold mt-4">Submissions</h2>
            <div className="space-y-2">
                {isLoading ? (
                    <Skeleton className="h-20 w-full rounded-md" />
                ) : isError ? (
                    <p className="text-red-500">Failed to load submissions.</p>
                ) : submissions.length === 0 ? (
                    <p className="text-muted-foreground">No submissions yet.</p>
                ) : (
                    submissions.map((submission: PartialSubmissionDto) => (
                        <Card key={submission.id} className="p-4 border rounded-xl flex justify-between items-center">
                            <div>
                                <p className="font-medium">{submission.studentLogin}</p>
                                <p className="text-sm text-muted-foreground">{new Date(submission.submissionDate).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{submission.rating || "-"} / {getAssignmentFromCache()?.maxPoints ?? '-'} points</p>
                            </div>
                            {/* /subject/${subjectId}/assignment/${assignmentId}/submission/${submission.id} */}
                            <Link to={`submission/${submission.id}`}>
                                <Button variant="outline">View</Button>
                            </Link>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
