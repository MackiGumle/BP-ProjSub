import { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { AddSubmissionCommentDto, SubmissionCommentDto } from "@/Dtos/SubmissionCommentDto";

interface CommentDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedLine: number | null;
    submissionId: string;
    fileName: string;
}

const CommentDialog = ({
    isOpen,
    onOpenChange,
    selectedLine,
    submissionId,
    fileName,
}: CommentDialogProps) => {
    const [commentText, setCommentText] = useState("");
    const queryClient = useQueryClient();

    const addCommentMutation = useMutation({
        mutationFn: async (newComment: AddSubmissionCommentDto) => {
            const response = await axios.post<SubmissionCommentDto>(
                "/api/Teacher/AddSubmissionComment",
                newComment
            );
            return response.data;
        },
        onSuccess: (newComment) => {
            toast({ title: "Comment added", variant: "default" });
            setCommentText("");
            onOpenChange(false);
            queryClient.setQueryData<SubmissionCommentDto[]>(
                ["submissionComments", submissionId],
                (oldData = []) => [...oldData, newComment]
            );
        },
        onError: (error) => {
            console.error("Error adding comment", error);
            toast({ title: "Error adding comment", variant: "destructive" });
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add Comment on Line {selectedLine !== null ? selectedLine + 1 : ""}
                    </DialogTitle>
                </DialogHeader>
                <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Enter your comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                />
                <DialogFooter>
                    <Button
                        onClick={() => {
                            if (fileName && selectedLine !== null) {
                                addCommentMutation.mutate({
                                    submissionId,
                                    fileName,
                                    lineCommented: selectedLine + 1,
                                    comment: commentText,
                                });
                            }
                        }}
                        disabled={addCommentMutation.isLoading || !commentText.trim()}
                    >
                        {addCommentMutation.isLoading ? "Submitting..." : "Submit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CommentDialog;