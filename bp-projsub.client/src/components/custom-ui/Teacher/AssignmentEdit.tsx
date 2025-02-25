import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import SyntaxHighlighter from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import materialLight from "react-syntax-highlighter/dist/cjs/styles/prism/material-light";
import { useAssignmentQuery } from "@/hooks/useCustomQuery";
import { replace, useNavigate, useParams } from "react-router-dom";
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


export function AssignmentEdit() {
    const { assignmentId } = useParams<{ assignmentId: string }>()
    const { data: assignment, isLoading: isAssignmentLoading, error: errorAssignment } = useAssignmentQuery({ assignmentId: parseInt(assignmentId || "") })
    const [description, setDescription] = useState("")
    const navigate = useNavigate();


    useEffect(() => {
        if (assignment) {
            setDescription(assignment.description || "");
        }
    }, [assignment]);

    const handleAssignmentEdit = async () => {
        try {
            if (assignment) {
                assignment.description = description;
                const response = await axios.put(`/api/Teacher/EditAssignment`,
                    assignment
                );

                toast({ title: "Success", description: "Assignment edited successfully.", variant: "default" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Error editing assignment file.", variant: "destructive" })

        }
    };

    const handleAssignmentDelete = async () => {
        try {
            const response = await axios.delete(`/api/Teacher/DeleteAssignment/${assignmentId}`);
            toast({ title: "Success", description: "Assignment deleted successfully.", variant: "default" })
            navigate("../..", { replace: true });
        } catch (error) {
            toast({ title: "Error", description: "Error deleting assignment file.", variant: "destructive" })
        }
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="ml-auto mr-2 space-x-2">


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
            <Separator />
            <ResizablePanelGroup direction="horizontal" className="w-full h-full">

                <ResizablePanel defaultSize={10}>
                    <div className="flex flex-col h-full">
                        <div className="flex-grow min-h-0 overflow-y-auto">
                            <TOCWrapper endpoint={`/api/Upload/GetAssignmentFileTree/${assignmentId}`} contextMenu={true} />
                        </div>

                        <div className="h-fit overflow-hidden">
                            <UppyDragDrop endpoint={`/api/Upload/UploadAttachmentFiles/${assignmentId}`}
                                invalidateQueries={[["submissionFileTree", `/api/Upload/GetAssignmentFileTree/${assignmentId}`]]} />
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
        </>
    );
}
