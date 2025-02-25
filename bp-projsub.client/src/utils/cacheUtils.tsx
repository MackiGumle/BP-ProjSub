import { QueryClient } from "@tanstack/react-query";
import { AssignmentDto } from "@/Dtos/AssignmentDto";

export const getAssignmentFromCache = (
  queryClient: QueryClient,
  subjectId: string,
  assignmentId: string
): AssignmentDto | null => {
  try {
    const assignments = queryClient.getQueryData<AssignmentDto[]>([
      "assignments",
      subjectId,
    ]);
    return assignments?.find((a) => a.id === Number(assignmentId)) || null;
  } catch (error) {
    console.error("Error fetching assignment from cache:", error);
    return null;
  }
};