import { Card, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentColumns } from "@/Dtos/StudentDto";
import { SubjectDto } from "@/Dtos/SubjectDto";
import { useStudentsQuery, useSubjectsQuery } from "@/hooks/useCustomQuery";
import { useParams } from "react-router-dom";

export function ManageSubject() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { data: subjects, isLoading: isSubjectsLoading, error: errorSubjecst } = useSubjectsQuery();
  const { data: students, isLoading: isStudentssLoading, error: errorStudents } = useStudentsQuery({ subjectId: parseInt(subjectId || "") });


  const currentSubject = subjects?.find(
    (sub: SubjectDto) => sub.id === parseInt(subjectId || "")
  );

  if (isSubjectsLoading) return <div>Loading subjects...</div>;

  if (errorSubjecst) return <div>Error: {errorSubjecst.message}</div>;

  return (
    <div className="flex flex-col justify-center items-center w-full">
      Manage Subject
      {currentSubject ? (
        <>
          <Tabs defaultValue="students" className="w-full">
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="subject">Subject</TabsTrigger>
            </TabsList>
            <TabsContent value="students"><DataTable columns={StudentColumns} data={students || []} /></TabsContent>
            <TabsContent value="assignment">Add assignment form</TabsContent>
            <TabsContent value="subject">Edit subject form</TabsContent>
          </Tabs>
        </>
      ) : (
        <div>Subject not found</div>
      )}
    </div>
  );
}