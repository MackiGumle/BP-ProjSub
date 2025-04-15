import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCog, ChevronDown, Eye, FolderArchive, LetterText, Loader2, Pencil, Star, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PartialSubmissionDto } from "@/Dtos/SubmissionDto";
import { AssignmentDto } from "@/Dtos/AssignmentDto";
import { useAssignmentQuery } from "@/hooks/useCustomQuery";
import materialLight from "react-syntax-highlighter/dist/cjs/styles/prism/material-light";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AssignmentViewLogDto } from "@/Dtos/AssignmentViewLogDto";
import PlagiarismDialog from "../Dialogs/PlagiatismDialog";
import { toast } from "@/components/ui/use-toast";
import { ConfirmActionDialog } from "../Dialogs/ConfirmActionDialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"





async function fetchSubmissions(assignmentId: string) {
    const { data } = await axios.get(`/api/Teacher/GetSubmissions/${assignmentId}`);
    return data;
}


export function TeacherAssignmentSubmissions() {
    const { subjectId, assignmentId } = useParams<{ subjectId: string, assignmentId: string }>();
    const [isAssignmentOpen, setAssignmentOpen] = useState<boolean | undefined>(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();


    const getAssignmentFromCache = () => {
        try {
            const assignments = queryClient.getQueryData<AssignmentDto[]>(['assignments', subjectId]);

            const assignment = assignments?.find(a => a.id === Number(assignmentId));

            return assignment;
        } catch (error) {
            console.error('Error fetching assignment from cache:', error);
            return null;
        }
    };

    const { data: assignment, isLoading: isAssignmentLoading, error: errorAssignment } = useAssignmentQuery({ assignmentId: assignmentId || "" })

    const { data: submissions, isLoading, isError } = useQuery<PartialSubmissionDto[]>({
        queryKey: ["parialsubmissions", assignmentId],
        queryFn: () => fetchSubmissions(assignmentId!),
        enabled: !!assignmentId,
    });

    const [isExportLoading, setExportLoading] = useState<boolean>(false);

    const getExportSubmissionRatings = () => {
        setExportLoading(true);
        axios.get(`/api/Teacher/ExportSubmissionsRating/${assignmentId}`, { responseType: 'blob' })
            .then((response) => {
                setExportLoading(false);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'submissions_ratings.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                console.error('Error exporting ratings:', error);
            });
    }

    const getExportSubmissionsFiles = () => {
        setExportLoading(true);
        axios.get(`/api/upload/ExportSubmissionFiles/${assignmentId}`, { responseType: 'blob' })
            .then((response) => {
                setExportLoading(false);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'submissions_files.zip');
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                console.error('Error exporting submissions:', error);
            });
    }

    const handleAssignmentDelete = async () => {
        try {
            await axios.delete(`/api/Teacher/DeleteAssignment/${assignmentId}`);
            queryClient.invalidateQueries(["assignments", subjectId]);
            toast({ title: "Success", description: "Assignment deleted successfully.", variant: "default" })
            navigate("../", { replace: true });
        } catch (error) {
            toast({ title: "Error", description: "Error deleting assignment file.", variant: "destructive" })
        }
    }

    return (
        <div className="w-full mx-auto p-6 space-y-4">
            {isAssignmentLoading ? (
                <Skeleton className="h-20 w-full rounded-md" />
            ) : errorAssignment ? (
                <p className="text-red-500">Failed to load assignment.</p>
            ) : (
                <Collapsible
                    open={isAssignmentOpen}
                    onOpenChange={() => setAssignmentOpen(!isAssignmentOpen)}
                >
                    <Card className="rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                            <span className="text-xl font-semibold">{assignment?.title}</span>
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm text-muted-foreground">{assignment?.dateAssigned && "Assigned: " + new Date(assignment.dateAssigned).toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground">{assignment?.dueDate && "Due: " + new Date(assignment.dueDate).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild className="">
                                        <Button variant="outline" className="p-2">
                                            <Pencil className="" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center" className="w-auto p-1.5">
                                        <DropdownMenuItem>
                                            <Link to={`editdetails/`} className="flex items-center space-x-2">
                                                <CalendarCog />
                                                <span>Edit Details</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link to={`editdescription/`} className="flex items-center space-x-2">
                                                <LetterText />
                                                <span>Edit Description</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <ConfirmActionDialog
                                    title={`Confirm removal of '${assignment?.title}'`}
                                    description="Are you sure you want to remove this assignment?"
                                    onConfirm={handleAssignmentDelete}
                                    triggerButton={
                                        <Button variant="outline" className="p-2"
                                            onClick={(e) => { e.stopPropagation() }}
                                        >
                                            <Trash2 />
                                        </Button>
                                    } />

                                <ChevronDown
                                    className={`h-5 w-5 transition-transform duration-200 ${isAssignmentOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </div>
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

            <h2 className="text-xl font-semibold mt-4 flex">Submissions
                {
                    submissions && submissions.length > 0 && (
                        <div className="ml-auto">
                            {submissions.length > 1 && (<PlagiarismDialog assignmentId={Number(assignmentId)} />)}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild className="">
                                    <Button variant="ghost" size={'sm'}>
                                        {
                                            isExportLoading ?
                                                (<><Loader2 className="h-4 w-4 animate-spin" /> Exporting...</>) :
                                                (<><Upload /> Export</>)
                                        }
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="w-auto">
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            getExportSubmissionRatings();
                                        }}>
                                        <Star className="mr-2" />
                                        Export Ratings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            getExportSubmissionsFiles();
                                        }}>
                                        <FolderArchive className="mr-2" />
                                        Export Submissions
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                }
            </h2>
            <Separator />
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
                            <div className="flex items-center space-x-3">
                                {submission.isSuspicious && (
                                    <HoverCard>
                                        <HoverCardTrigger>
                                            <Badge className="bg-red-500">Multiple IPs</Badge>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="space-y-1 w-fit p-0">
                                            <div className="max-h-64 overflow-y-auto p-2">
                                                {submission.assignmentViewLogs?.length > 0 ? (
                                                    // Group logs by IP address
                                                    Object.entries(
                                                        submission.assignmentViewLogs.reduce<Record<string, AssignmentViewLogDto[]>>(
                                                            (acc, log) => {
                                                                if (!acc[log.ipAddress])
                                                                    acc[log.ipAddress] = [];

                                                                acc[log.ipAddress].push(log);

                                                                return acc;
                                                            },
                                                            {}
                                                        )
                                                    )
                                                        .map(([ip, logs]) => (
                                                            <div key={ip} className="mb-1 last:mb-0">
                                                                <div className="font-mono text-red-500 bg-red-50 px-2 py-0 rounded">
                                                                    {ip} ({logs.length})
                                                                </div>
                                                                <div className="text-center">
                                                                    {logs.map((log: AssignmentViewLogDto, logIndex: number) => (
                                                                        <div
                                                                            key={logIndex}
                                                                            className="text-sm text-muted-foreground p-1 border-b last:border-0"
                                                                        >
                                                                            {new Date(log.viewedOn).toLocaleTimeString()}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))
                                                ) : (
                                                    <div className="text-sm text-muted-foreground p-2">
                                                        No access logs found
                                                    </div>
                                                )}
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                )}
                                <Link to={`submission/${submission.id}`}>
                                    <Button variant="outline">
                                        <Eye />
                                        View
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
