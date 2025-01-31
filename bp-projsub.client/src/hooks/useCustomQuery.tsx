import { UseQueryResult, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/context/UserContext";
import { SubjectDto } from "@/Dtos/SubjectDto";
import { StudentDto } from "@/Dtos/StudentDto";

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
        staleTime: 5 * 60 * 1000,
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
        staleTime: 5 * 60 * 1000,
        retry: 2
    });
};
