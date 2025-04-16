import { UseQueryResult, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/context/UserContext";
import { SubjectDto } from "@/Dtos/SubjectDto";
import { StudentDto } from "@/Dtos/StudentDto";
import { AssignmentDto } from "@/Dtos/AssignmentDto";

export const useSubjectsQuery = (): UseQueryResult<SubjectDto[], Error> => {
    const { getRole } = useAuth();

    return useQuery<SubjectDto[], Error>({
        queryKey: ['subjects'],
        queryFn: async () => {
            try {
                const response = await axios.get<SubjectDto[]>(
                    `/api/${getRole()}/GetSubjects`,
                    { withCredentials: true }
                );
                return response.data;
            } catch (error) {
                throw new Error("Failed to fetch subjects");
            }
        },
        staleTime: 2 * 60 * 1000,
        retry: 2
    });
};

export const useAssignmentQuery = ({ assignmentId, disableRefetch = false }: { assignmentId: string, disableRefetch?: boolean }): UseQueryResult<AssignmentDto, Error> => {
    const { getRole } = useAuth();

    return useQuery<AssignmentDto, Error>({
        queryKey: ['assignment', assignmentId],
        queryFn: async () => {
            try {
                const response = await axios.get<AssignmentDto>(
                    `/api/${getRole()}/GetAssignment/${assignmentId}`,
                    { withCredentials: true }
                );
                return response.data;
            } catch (error) {
                throw new Error("Failed to fetch assignment");
            }
        },
        enabled: !!assignmentId && !disableRefetch,
        staleTime: 2 * 60 * 1000,
        retry: 2
    });
}

export const useAssignmentsQuery = (subjectId?: string): UseQueryResult<AssignmentDto[], Error> => {
    const { getRole } = useAuth();

    return useQuery<AssignmentDto[], Error>({
        queryKey: ['assignments', subjectId],
        queryFn: async () => {
            if (!subjectId) return [];
            try {
                const response = await axios.get<AssignmentDto[]>(
                    `/api/${getRole()}/GetAssignments/${subjectId}`,
                    { withCredentials: true }
                );
                return response.data;
            } catch (error) {
                throw new Error("Failed to fetch assignments");
            }
        },
        enabled: !!subjectId,
        staleTime: 2 * 60 * 1000,
        retry: 2
    });
};

export const useStudentsQuery = ({ subjectId }: { subjectId: number }): UseQueryResult<StudentDto[], Error> => {
    const { getRole } = useAuth();

    return useQuery<StudentDto[], Error>({
        queryKey: ['students', subjectId],
        queryFn: async () => {
            try {
                const response = await axios.get<StudentDto[]>(
                    `/api/${getRole()}/GetSubjectTudents/${subjectId}`,
                    { withCredentials: true }
                );
                return response.data;
            } catch (error) {
                throw new Error("Failed to fetch subjects");
            }
        },
        staleTime: 2 * 60 * 1000,
        retry: 2
    });
};
