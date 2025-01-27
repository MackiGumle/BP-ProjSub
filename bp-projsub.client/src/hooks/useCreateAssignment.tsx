import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { AssignmentDto, CreateAssignmentDto } from "@/Dtos/AssignmentDto"
import { UseFormSetError } from "react-hook-form"
import { FieldValues } from "react-hook-form"
import { handleFormErrors } from "@/utils/handleFormErrors"

interface UseCreateAssignmentOptions<T extends FieldValues> {
  subjectId: number
  setError?: UseFormSetError<T>     // This will be called on error
  onSuccess?: (newAssignment: AssignmentDto) => void
  onError?: (error: unknown) => void // For custom error handling
}

export function useCreateAssignment<T extends FieldValues>({
  subjectId,
  setError,
  onSuccess,
  onError,
}: UseCreateAssignmentOptions<T>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateAssignmentDto, "subjectId">) => {
      const response = await axios.post<AssignmentDto>(
        "/api/teacher/CreateAssignment",
        { ...data, subjectId }
      )
      return response.data
    },
    onSuccess: (newAssignment) => {
      // Update React Query cache
      queryClient.setQueryData<AssignmentDto[]>(
        ["assignments", subjectId],
        (old = []) => [...old, newAssignment]
      )

      onSuccess?.(newAssignment)
    },
    onError: (error) => {
      // The custom onError callback
      onError?.(error)

      // If setError is provided, call handleFormErrors
      if (setError) {
        handleFormErrors<T>(error, setError, "Failed to create assignment.")
      }
    },
  })
}
