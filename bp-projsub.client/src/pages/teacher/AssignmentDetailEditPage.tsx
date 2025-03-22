import { EditAssignmentForm } from "@/components/forms/teacher/EditAssignmentForm";
import { AssignmentDto } from "@/Dtos/AssignmentDto";
import { useAssignmentQuery } from "@/hooks/useCustomQuery";
import { Navigate, useParams } from "react-router-dom";

export function AssignmentDetailEditPage() {
    const { subjectId, assignmentId } = useParams<{ subjectId: string, assignmentId: string }>()
    
    // Redirect to NotFoundPage if subjectId is missing
    if (!subjectId) {
        return <Navigate to="/not-found" replace />;
    }
    
    const { data: assignment, isLoading, error } = useAssignmentQuery({ assignmentId: assignmentId || "" });
    
    return (
        <div className="mt-2">
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {assignment && <EditAssignmentForm subjectId={subjectId} assignment={assignment as AssignmentDto} />}
        </div>
    )
}