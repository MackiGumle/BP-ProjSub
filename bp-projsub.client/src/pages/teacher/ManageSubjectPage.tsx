import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectDto } from "@/Dtos/SubjectDto";
import { useSubjectsQuery } from "@/hooks/useCustomQuery";
import { useParams } from "react-router-dom";
import { ManageStudents } from "../../components/custom-ui/Teacher/ManageStudents";
import { EditSubjectForm } from "@/components/forms/teacher/EditSubjectForm";
import { CreateAssignmentForm } from "@/components/forms/teacher/CreateAssignmentForm";

export function ManageSubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { data: subjects, isLoading: isSubjectsLoading, error: errorSubjecst } = useSubjectsQuery();

  const currentSubject = subjects?.find(
    (sub: SubjectDto) => sub.id === parseInt(subjectId || "")
  );

  if (isSubjectsLoading) return <div>Loading subjects...</div>;

  if (errorSubjecst) return <div>Error: {errorSubjecst.message}</div>;

  return (
    <div className="flex flex-col justify-center items-center w-full">
      {subjects && (<div className="text-2xl font-bold mb-4">Manage {currentSubject?.name}</div>)}

      {currentSubject ? (
        <>
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="mx-auto flex justify-center w-fit">
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="subject">Subject</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="p-4">
              {subjectId &&
                <ManageStudents subjectId={parseInt(subjectId || "")} />
              }
            </TabsContent>

            <TabsContent value="assignment" className="p-4">
              <CreateAssignmentForm subjectId={parseInt(subjectId || "")} />
            </TabsContent>

            <TabsContent value="subject" className="p-4">
              <EditSubjectForm subject={currentSubject} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div>Subject not found</div>
      )}
    </div>
  );
}