import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useDeleteStudentMutation({ subjectId, userName }: { subjectId: number, userName: string }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(
                `/api/RemoveStudentsFromSubject/${subjectId}`, { data: [userName] });

            return response.data;
        },
        onSuccess: (data) => {
            toast({
                title: 'Success',
                description: data.message,
            });

            queryClient.invalidateQueries({ queryKey: ['students', subjectId] });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return mutation;
}