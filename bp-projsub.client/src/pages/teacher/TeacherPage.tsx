import { SubjectsList } from "@/components/custom-ui/SubjectList";
import Page from "@/components/custom-ui/TeacherSidebar";

import { CreateSubjectForm } from "@/components/forms/teacher/CreateSubjectForm";
import { SidebarProvider } from "@/components/ui/sidebar";

export function TeacherPage() {
    return (
        <>
             {/* <SidebarProvider> */}
                {/* <CreateSubjectForm /> */}
                {/* <SubjectsList /> */}
                <Page />
            {/* </SidebarProvider> */}
        </>
    );
}