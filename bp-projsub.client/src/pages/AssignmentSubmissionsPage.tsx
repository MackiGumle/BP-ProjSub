import { useAuth } from "@/context/UserContext";
import { TeacherAssignmentSubmissions } from "../components/custom-ui/Teacher/TeacherAssignmentSubmissions";
import { StudentAssignmentSubmissions } from "../components/custom-ui/Student/StudentAssignmentSubmissions";

export function AssignmentSubmissionsPage() {
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

