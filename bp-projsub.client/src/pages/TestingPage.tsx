import { FilePreviewer } from "@/components/custom-ui/FilePreview"
import TOCWrapper from "@/components/custom-ui/Teacher/TOCWrapper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useParams, useSearchParams } from "react-router-dom";

export function TestingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const submissionId = "1035";
  const fileName = searchParams.get('file');

  return (
    <>
      {
        submissionId ? (
          <div className="min-w-full max-w-full min-h-full max-h-full">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={15}>
                <div className="p-4">top 1</div>
                <TOCWrapper submissionId={submissionId} />
                <div className="p-4">bottom 1</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={85}>
                <div className="p-4">top 2</div>
                <FilePreviewer submissionId={submissionId} fileName={fileName} />
                <div className="p-4">bottom 2</div>
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
