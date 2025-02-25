import { useAuth } from "@/context/UserContext";
import { TeacherAssignmentSubmissions } from "./Teacher/TeacherAssignmentSubmissions";
import { StudentAssignmentSubmissions } from "./Student/StudentAssignmentSubmissions";
import { Outlet } from "react-router-dom";

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

