import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { AssignmentDto, CreateAssignmentDto } from "@/Dtos/AssignmentDto"
import { toast } from "@/components/ui/use-toast"


export function useCreateAssignment<CreateAssignmentDto>({
  subjectId,
}: { subjectId: number }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAssignmentDto) => {
      const response = await axios.post<AssignmentDto>(
        "/api/teacher/CreateAssignment", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      },
      )
      return response.data
    },
    onSuccess: (newAssignment) => {
      queryClient.setQueryData<AssignmentDto[]>(
        ["assignments", subjectId],
        (old = []) => [...old, newAssignment]
      )

      toast({
        title: "Assignment created",
        description: "Assignment was created successfully.",
        variant: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to create assignment",
        description: "An error occurred while creating the assignment.",
        variant: "destructive",
      })

    },
  })
}
