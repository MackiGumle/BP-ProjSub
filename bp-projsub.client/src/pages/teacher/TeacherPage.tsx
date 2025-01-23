import { SubjectsList } from "@/components/custom-ui/SubjectList";
import { CreateSubjectForm } from "@/components/forms/teacher/CreateSubjectForm";

export function TeacherPage() {
    return (
        <div>
            <h1>Teacher Page</h1>
            <CreateSubjectForm />
            <SubjectsList />
        </div>
    );
}