import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { AssignmentDto } from "@/Dtos/AssignmentDto"
import { toast } from "@/components/ui/use-toast"

export function useEditAssignment<EditAssignmentDto>({
    subjectId,
}: { subjectId: string }) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: EditAssignmentDto) => {
            const response = await axios.put<AssignmentDto>(
                "/api/teacher/EditAssignment",
                data
            )
            return response.data
        },
        onSuccess: (updatedAssignment) => {
            queryClient.setQueryData<AssignmentDto[]>(
                ["assignments", `${subjectId}`],
                (old = []) => old.map(assignment =>
                    assignment.id === updatedAssignment.id ? updatedAssignment : assignment
                )
            )

            toast({
                title: "Assignment updated",
                description: "Assignment was updated successfully.",
                variant: "default",
            })
        },
        onError: () => {
            toast({
                title: "Failed to update assignment",
                description: "An error occurred while updating the assignment.",
                variant: "destructive",
            })
        },
    })
}