import { FilePreviewer } from "@/components/custom-ui/FilePreview"
import TOCWrapper from "@/components/custom-ui/Teacher/TOCWrapper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useParams, useSearchParams } from "react-router-dom";

export function TestingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { submissionId } = useParams();
  const fileName = searchParams.get('file');

  return (
    <>
      {
        submissionId ? (
          <div className="min-w-full max-w-full min-h-full max-h-full">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={15}>
                <TOCWrapper submissionId={submissionId} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={85}>
                <FilePreviewer submissionId={submissionId} fileName={fileName} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        )
          : (
            <div className="flex justify-center items-center h-full">
              <h1 className="text-2xl">Please select a submission to preview</h1>
            </div>
          )
      }

    </>
  )
}
