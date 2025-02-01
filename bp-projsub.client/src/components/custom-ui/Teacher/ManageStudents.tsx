import { useState } from "react";
import { StudentColumns } from "@/column-definitions/StudentColumns";
import { DataTable } from "@/components/ui/data-table";
import { useStudentsQuery } from "@/hooks/useCustomQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export function ManageStudents({ subjectId }: { subjectId: number }) {
    const queryClient = useQueryClient();
    const { data: students, isLoading: isStudentsLoading, error: errorStudents } = useStudentsQuery({ subjectId: subjectId });

    const [studentLogins, setStudentLogins] = useState("");

    const addStudentsMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`/api/Teacher/AddStudentsToSubject/`, {
                subjectId: subjectId,
                studentLogins: studentLogins.split(",").map(login => login.trim()),
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast({ title: "Success", description: data.message });
            queryClient.invalidateQueries(["students", subjectId]);
            // queryClient.refetchQueries(["students", subjectId]);
            setStudentLogins("");
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to add students", variant: "destructive" });
        },
    });

    const removeStudentsMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`/api/Teacher/RemoveStudentsFromSubject/`, {
                subjectId: subjectId,
                studentLogins: studentLogins.split(",").map(login => login.trim()),
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast({ title: "Success", description: data.message });
            queryClient.invalidateQueries(["students", subjectId]);
            // queryClient.refetchQueries(["students", subjectId]);
            setStudentLogins("");
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to remove students", variant: "destructive" });
        },
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            {/* Student Management Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage Students</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Enter comma-separated student logins (e.g., abc123, xyz45)"
                        value={studentLogins}
                        onChange={(e) => setStudentLogins(e.target.value)}
                    />
                    <div className="flex space-x-4">
                        <Button onClick={() => addStudentsMutation.mutate()} disabled={addStudentsMutation.isLoading}>
                            Add Students
                        </Button>
                        <Button variant="destructive" onClick={() => removeStudentsMutation.mutate()} disabled={removeStudentsMutation.isLoading}>
                            Remove Students
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Student List */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent>
                    {isStudentsLoading ? (
                        <div>Loading students...</div>
                    ) : errorStudents ? (
                        <div className="text-red-500">Error loading students</div>
                    ) : (
                        <DataTable columns={StudentColumns} data={students || []} filterColumn="userName" filterAlias="Login" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
