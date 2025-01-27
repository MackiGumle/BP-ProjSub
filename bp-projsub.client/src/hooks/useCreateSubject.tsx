import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { SubjectDto, CreateSubjectDto } from "@/Dtos/SubjectDto"
import { handleFormErrors } from "@/utils/handleFormErrors"
import { FieldValues, UseFormSetError } from "react-hook-form"

interface UseCreateSubjectOptions<T extends FieldValues> {
  onSuccess?: (newSubject: SubjectDto) => void
  onError?: (error: unknown) => void
  setError?: UseFormSetError<T>
}

export function useCreateSubject<T extends FieldValues>({
  onSuccess,
  onError,
  setError,
}: UseCreateSubjectOptions<T>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSubjectDto) => {
      const response = await axios.post<SubjectDto>(
        "/api/teacher/CreateSubject",
        data
      )
      return response.data
    },
    onSuccess: (newSubject) => {
      // Update React Query cache
      queryClient.setQueryData<SubjectDto[]>(
        ["subjects"],
        (oldSubjects = []) => [...oldSubjects, newSubject]
      )
      onSuccess?.(newSubject)
    },
    onError: (error) => {
      if (setError) {
        handleFormErrors<T>(error, setError, "Failed to create subject")
      }
      onError?.(error)
    },
  })
}
