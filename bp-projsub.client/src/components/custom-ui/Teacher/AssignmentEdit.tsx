import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import { useAssignmentQuery } from "@/hooks/useCustomQuery";
import { useNavigate, useParams } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import 'katex/dist/katex.min.css'; // Keeps unformated text hidden
import { MarkdownRenderer } from "../MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Save, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator"
import TOCWrapper from "./TOCWrapper";
import { UppyDragDrop } from "../UppyDragDrop";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";


export function AssignmentEdit() {
    const { subjectId, assignmentId } = useParams<{ subjectId: string, assignmentId: string }>()
    const { data: assignment, isLoading: isAssignmentLoading, error: errorAssignment } = useAssignmentQuery({ assignmentId: assignmentId || "" })
    const [description, setDescription] = useState("")
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (assignment) {
            setDescription(assignment.description || "");
        }
    }, [assignment]);

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
                <p>Loading...</p>
            ) : errorAssignment ? (
                <p className="text-red-500">Failed to load assignment.</p>
            ) : (
                <>
                    {/* <div className="flex justify-between items-center"> */}

                    {/* </div> */}
                    {/* <Separator /> */}
                    <ResizablePanelGroup direction="horizontal" className="w-full h-full">
                        <ResizablePanel defaultSize={10}>
                            <div className="flex flex-col">
                                <div className="flex-grow top-0 overflow-y-auto">
                                    <TOCWrapper endpoint={`/api/Upload/GetAssignmentFileTree/${assignmentId}`} contextMenu={true} />
                                </div>

                                <div className="">
                                    <UppyDragDrop endpoint={`/api/Upload/UploadAttachmentFiles/${assignmentId}`}
                                        invalidateQueries={[["submissionFileTree", `/api/Upload/GetAssignmentFileTree/${assignmentId}`]]}
                                    />
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
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"
                                    ><Trash /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm removal of '{assignment?.title}'</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to remove the assignment from the subject?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleAssignmentDelete()}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Confirm Removal
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button variant="default"
                                onClick={handleAssignmentEdit}
                            ><Save /></Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
