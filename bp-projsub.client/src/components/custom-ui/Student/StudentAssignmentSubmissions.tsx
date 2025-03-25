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
import { useAssignmentQuery } from "@/hooks/useCustomQuery";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import materialLight from "react-syntax-highlighter/dist/cjs/styles/prism/material-light";


// actually gets only the latest submission
async function fetchSubmission(assignmentId: string) {
    const { data } = await axios.get(`/api/Student/GetSubmissions/${assignmentId}`);
    return data;
}

export function StudentAssignmentSubmissions() {
    const { subjectId, assignmentId } = useParams<{ subjectId: string; assignmentId: string }>();
    const [isAssignmentOpen, setAssignmentOpen] = useState<boolean>(true);
    const queryClient = useQueryClient()

    const { data: submission, isLoading, isError } = useQuery<PartialSubmissionDto>({
        queryKey: ["parialsubmissions", assignmentId],
        queryFn: () => fetchSubmission(assignmentId!),
        enabled: !!assignmentId,
    });

    const { data: assignment, isLoading: isAssignmentLoading, error: errorAssignment } = useAssignmentQuery({ assignmentId: assignmentId || "" });


    return (
        <div className="w-4xl mx-3 p-6">
            <div className="space-y-6">
                {isAssignmentLoading ? (
                    <Skeleton className="h-20 w-full rounded-md" />
                ) : errorAssignment ? (
                    <p className="text-red-500">Failed to load assignment.</p>
                ) : (
                    <Collapsible
                        open={isAssignmentOpen}
                        onOpenChange={() => setAssignmentOpen(!isAssignmentOpen)}
                    >
                        <Card className="shadow-lg rounded-lg overflow-hidden">
                            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                <span className="text-xl font-semibold">{assignment?.title}</span>
                                <span className="text-muted-foreground">{assignment?.dueDate && "Due: " + new Date(assignment.dueDate).toLocaleString()}</span>
                                <ChevronDown
                                    className={`h-5 w-5 transition-transform duration-200 ${isAssignmentOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-6 py-4">
                                {/* <p className="text-gray-700">Popis zadání</p> */}
                                <Markdown className='markdown'
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code(props) {
                                            const { children, className, node, ...rest } = props
                                            const match = /language-(\w+)/.exec(className || '')
                                            return match ? (
                                                <SyntaxHighlighter
                                                    PreTag="div"
                                                    children={String(children).replace(/\n$/, '')}
                                                    language={match[1]}
                                                    style={materialLight}
                                                />
                                            ) : (
                                                <code {...rest} className={className}>
                                                    {children}
                                                </code>
                                            )
                                        }
                                    }}
                                >{assignment?.description}</Markdown>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                )}

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

                {isLoading ? (
                    <Skeleton className="h-60 w-full rounded-md" />
                ) : !isError && (
                    <Card className="shadow-lg rounded-lg p-6">
                        <UppyDragDrop endpoint={`/api/upload/UploadSubmissionFiles/${parseInt(assignmentId!)}`}
                            invalidateQueries={[["parialsubmissions", assignmentId!]]} />
                    </Card>
                )}
            </div>


        </div>
    );
}
