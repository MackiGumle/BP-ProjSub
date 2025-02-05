import { FilePreviewer } from "@/components/custom-ui/FilePreview"
import TOCWrapper from "@/components/custom-ui/Teacher/TOCWrapper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowBigLeft, ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PartialSubmissionDto } from "@/Dtos/SubmissionDto";

export function SubmissionBrowser() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { subjectId, assignmentId, submissionId } = useParams();
    const fileName = searchParams.get('file');

    async function GetSubmissionVersionIds() {
        const response = await axios.get(
            `/api/Teacher/GetSubmissionVersionIds/${submissionId}`,
        );

        return response.data;
    }

    const { data: submissionIds, isLoading: isLoadingIds, error: errorIds } = useQuery<number[], Error>(
        ["submissionVersionsIds", submissionId],
        GetSubmissionVersionIds,
        {
            enabled: !!submissionId,
        }
    );

    async function getPartialSubmission() {
        const response = await axios.get<PartialSubmissionDto>(
            `/api/Teacher/GetSubmission/${submissionId}`,
        );

        return response.data;
    }

    const { data: partialSubmission, isLoading: isLoadingPartialSubmission, error: errorPartialSubmission } = useQuery<PartialSubmissionDto, Error>(
        ["partialSubmission", submissionId],
        getPartialSubmission,
        {
            enabled: !!submissionId,
        }
    );

    function cycleSubmission(direction: 'next' | 'prev') {
        if (!submissionIds || !submissionId) return;

        const currentIndex = submissionIds.findIndex(id => id === parseInt(submissionId));
        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0 || nextIndex >= submissionIds.length) return;

        return submissionIds[nextIndex];
    }

    return (
        <>
            {
                submissionId ? (
                    // <div className="min-w-full max-w-full min-h-full max-h-full">
                    // <div className="w-full h-full">
                    // <ResizablePanelGroup direction="horizontal" className="w-full h-full">
                    //     <ResizablePanel defaultSize={15}>
                    //         <div className="overflow-auto">
                    //             <TOCWrapper submissionId={submissionId} />
                    //         </div>
                    //     </ResizablePanel>
                    //     <ResizableHandle withHandle />
                    //     <ResizablePanel defaultSize={85}>
                    //         <div className="overflow-auto">
                    //             <FilePreviewer submissionId={submissionId} fileName={fileName} />
                    //         </div>
                    //     </ResizablePanel>
                    // </ResizablePanelGroup>
                    <ResizablePanelGroup direction="horizontal" className="w-full h-full">
                        <ResizablePanel defaultSize={15}>
                            <div className="flex items-center justify-between p-0">
                                {submissionIds && submissionIds.length > 1 && (
                                    <>
                                        <div className="flex-1 flex justify-start">
                                            {cycleSubmission('prev') ? (
                                                <Link to={`/subject/${subjectId}/assignments/${assignmentId}/submission/${cycleSubmission('prev')}`}>
                                                    <Button variant="ghost">
                                                        <ArrowLeft />
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button variant="ghost" disabled>
                                                    <ArrowLeft />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex-1 flex justify-end">
                                            {cycleSubmission('next') ? (
                                                <Link to={`/subject/${subjectId}/assignments/${assignmentId}/submission/${cycleSubmission('next')}`}>
                                                    <Button variant="ghost">
                                                        <ArrowRight />
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button variant="ghost" disabled>
                                                    <ArrowRight />
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            <TOCWrapper submissionId={submissionId} />
                            <div className="p-4">bottom 1</div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={85}>
                            {/* <div className="p-4">top 2</div> */}
                            <div className="flex-1 justify-center items-center">
                                {
                                    isLoadingPartialSubmission ? 'Loading...' :
                                        errorPartialSubmission ? 'Error loading submission' :
                                            (new Date(partialSubmission?.submissionDate ?? '').toLocaleString())
                                }
                            </div>
                            <FilePreviewer submissionId={submissionId} fileName={fileName} />
                            <div className="p-4">bottom 2 end</div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
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
