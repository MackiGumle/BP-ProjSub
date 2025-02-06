import { FilePreviewer } from "@/components/custom-ui/FilePreview"
import TOCWrapper from "@/components/custom-ui/Teacher/TOCWrapper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";

export function TestingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const submissionId = "1035";
  const fileName = searchParams.get('file');

  // const { data: assignments, isLoading } = useQuery(["assignments"], getAssignments);

  // if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {/* <div>
        {assignments.map((assignment: any) => (
          <div key={assignment.id} className="p-4 border-b">
            <h2>{assignment.title}</h2>
            <ReactMarkdown>{assignment.contentMarkdown}</ReactMarkdown>
            {assignment.attachments.length > 0 && (
              <div>
                <h3>Attachments:</h3>
                <ul>
                  {assignment.attachments.map((att: any) => (
                    <li key={att.id}>
                      <a href={att.filePath} target="_blank" rel="noopener noreferrer">{att.fileName}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div> */}
    </>
  );
}
