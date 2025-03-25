import { AssignmentDto } from "@/Dtos/AssignmentDto";
import { useQueryClient } from "@tanstack/react-query";

export function useAssignmentSubmissionsCache({ subjectId, assignmentId }: { subjectId: string | undefined, assignmentId: string | undefined }) {
    if (!subjectId || !assignmentId) {
        return null;
    }

    const queryClient = useQueryClient();

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

    return getAssignmentFromCache();
}