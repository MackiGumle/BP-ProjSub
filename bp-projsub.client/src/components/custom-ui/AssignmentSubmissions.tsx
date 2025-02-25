import { useAuth } from "@/context/UserContext";
import { TeacherAssignmentSubmissions } from "./Teacher/TeacherAssignmentSubmissions";
import { StudentAssignmentSubmissions } from "./Student/StudentAssignmentSubmissions";

export function AssignmentSubmissions() {
    const { hasRole } = useAuth();

    return (
        <>
            {hasRole("Teacher") ? (
                <TeacherAssignmentSubmissions />
            ) : (
                <StudentAssignmentSubmissions />
            )}
        </>
    );
}

