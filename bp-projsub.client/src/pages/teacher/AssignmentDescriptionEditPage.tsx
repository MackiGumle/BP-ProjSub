import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useAssignmentQuery } from "@/hooks/useCustomQuery";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import 'katex/dist/katex.min.css'; // Keeps unformated text hidden
import { MarkdownRenderer } from "../../components/custom-ui/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Save, Trash, Undo2 } from "lucide-react";
import TOCWrapper from "../../components/custom-ui/Teacher/TOCWrapper";
import { UppyDragDrop } from "../../components/custom-ui/UppyDragDrop";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmActionDialog } from "@/components/custom-ui/Dialogs/ConfirmActionDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function AssignmentDescriptionEditPage() {
    const { subjectId, assignmentId } = useParams<{ subjectId: string, assignmentId: string }>()
    const { data: assignment, isLoading: isAssignmentLoading, error: errorAssignment } = useAssignmentQuery({ assignmentId: assignmentId || "", disableRefetch: true });
    const [description, setDescription] = useState("")
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (assignment?.description) {
            setDescription(assignment.description || "");
        }
    }, [assignment?.description]);

    const handleAssignmentEdit = async () => {
        try {
            if (assignment) {
                assignment.description = description;
                await axios.put(`/api/Teacher/EditAssignment`,
                    assignment
                );
                queryClient.invalidateQueries(["assignments", subjectId]);
                toast({ title: "Success", description: "Assignment edited successfully.", variant: "default" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Error editing assignment file.", variant: "destructive" })

        }
    };

    const handleAssignmentDelete = async () => {
        try {
            await axios.delete(`/api/Teacher/DeleteAssignment/${assignmentId}`);
            queryClient.invalidateQueries(["assignments", subjectId]);
            toast({ title: "Success", description: "Assignment deleted successfully.", variant: "default" })
            navigate("../..", { replace: true });
        } catch (error) {
            toast({ title: "Error", description: "Error deleting assignment file.", variant: "destructive" })
        }
    }

    return (
        <>
            {isAssignmentLoading ? (
                <ResizablePanelGroup direction="horizontal" className="w-full h-full">
                    <ResizablePanel defaultSize={10} className="">
                        <Skeleton className="h-10 w-full mb-4 p-2" />
                        <Skeleton className="h-[calc(100%-40px)] w-full p-2" />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={45}>
                        <Skeleton className="h-full w-full" />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={45}>
                        <Skeleton className="h-full w-full" />
                    </ResizablePanel>
                </ResizablePanelGroup>
            ) : errorAssignment ? (
                <p className="text-red-500">Failed to load assignment.</p>
            ) : (
                <>
                    <ResizablePanelGroup direction="horizontal" className="w-full h-full">
                        <ResizablePanel defaultSize={10} className="">
                            <div className="flex flex-col items-center justify-between p-2">
                                <Link to={`..`} className="w-full overflow-hidden p-0">
                                    <Button variant="secondary" className="w-full p-1 overflow-hidden">
                                        <Undo2 className="" />
                                        Go back
                                    </Button>
                                </Link>
                                <div className="flex flex-col w-full h-auto mt-2 space-y-2">
                                    <div className="flex-grow overflow-y-auto">
                                        <TOCWrapper
                                            endpoint={`/api/Upload/GetAssignmentFileTree/${assignmentId}`}
                                            contextMenu={true}
                                        />
                                    </div>
                                    <div className="">
                                        <UppyDragDrop
                                            endpoint={`/api/Upload/UploadAttachmentFiles/${assignmentId}`}
                                            invalidateQueries={[
                                                ["fileTree", `/api/Upload/GetAssignmentFileTree/${assignmentId}`]
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle />

                        <ResizablePanel defaultSize={45}>
                            <Textarea
                                // autoFocus
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-full border-none rounded-none"
                            />
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={45}>
                            <MarkdownRenderer content={description} />
                        </ResizablePanel>
                    </ResizablePanelGroup>

                    <div className="fixed bottom-3 right-3 z-10 flex justify-end items-center gap-4 p-1 bg-secondary rounded-lg shadow-md">
                        <div className="space-x-2">
                            <ConfirmActionDialog
                                title={`Confirm removal of '${assignment?.title}'`}
                                description="Are you sure you want to remove the assignment from the subject?"
                                onConfirm={handleAssignmentDelete}
                                confirmText="Confirm Removal"
                                triggerButton={
                                    <Button variant="destructive">
                                        <Trash />
                                    </Button>
                                }
                            />
                            <Button variant="default" onClick={handleAssignmentEdit}>
                                <Save />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
