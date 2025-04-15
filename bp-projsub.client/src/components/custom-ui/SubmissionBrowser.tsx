import { FilePreviewer } from "@/components/custom-ui/FilePreview"
import TOCWrapper from "@/components/custom-ui/Teacher/TOCWrapper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Undo2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { PartialSubmissionDto } from "@/Dtos/SubmissionDto";
import { useAuth } from "@/context/UserContext";
import { getAssignmentFromCache } from "@/utils/cacheUtils";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "../ui/dialog";
import { toast } from "../ui/use-toast";
import { Separator } from "../ui/separator";

export function SubmissionBrowser() {
    const [searchParams] = useSearchParams()
    const { subjectId, assignmentId, submissionId } = useParams();
    const fileName = searchParams.get('file');
    const { getRole } = useAuth();
    const queryClient = useQueryClient();

    const assignment = getAssignmentFromCache(
        queryClient,
        subjectId!,
        assignmentId!
    );

    async function GetSubmissionVersionIds() {
        const response = await axios.get(
            `/api/${getRole()}/GetSubmissionVersionIds/${submissionId}`,
        );

        return response.data;
    }

    const { data: submissionIds } = useQuery<number[], Error>(
        ["submissionVersionsIds", submissionId],
        GetSubmissionVersionIds,
        {
            enabled: !!submissionId,
        }
    );

    async function getPartialSubmission() {
        const response = await axios.get<PartialSubmissionDto>(
            `/api/${getRole()}/GetSubmission/${submissionId}`,
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

    const addRatingMutation = useMutation({
        mutationFn: async (data: { submissionId: number; rating: number; note: string }) => {
            return axios.post(`/api/Teacher/AddSubmissionRating`, data)
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Rating added" })
            queryClient.invalidateQueries(["partialSubmission", submissionId])
        },
        onError: (error) => {
            toast({ title: "Error", description: "Failed to add rating", variant: "destructive" })
            console.error("Failed to add rating", error)
        },
    })

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [ratingValue, setRatingValue] = useState<number | "">("")
    const [noteValue, setNoteValue] = useState("")

    function handleRatingSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (typeof ratingValue !== "number" || Number.isNaN(ratingValue)) {
            return
        }

        addRatingMutation.mutate({
            submissionId: Number(submissionId),
            rating: ratingValue,
            note: noteValue,
        })

        setIsDialogOpen(false)
    }

    return (
        <>
            {
                submissionId ? (
                    <>
                        <div className="flex justify-between items-center p-1 text-muted-foreground">
                            <div className="text-sm font-semibold">
                                <Link to={`/subject/${subjectId}/assignments/${assignmentId}`} className="text-muted-foreground hover:text-primary transition-colors">
                                    <Button variant="secondary" className="">
                                        <Undo2 className="" />
                                        Back to assignment
                                    </Button>
                                </Link>
                            </div>
                            <div>
                                {
                                    isLoadingPartialSubmission ? 'Loading...' :
                                        errorPartialSubmission ? 'Error loading submission' :
                                            (`Submitted on: ${new Date(partialSubmission?.submissionDate ?? '').toLocaleString()}`)
                                }
                            </div>
                            <div className="">
                                {partialSubmission?.rating ?? '-'} / {assignment?.maxPoints} points
                            </div>
                            <div>
                                {getRole() === "Teacher" && (
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="default" className="mr-2">
                                                Rate
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>

                                            </DialogHeader>

                                            <form onSubmit={handleRatingSubmit} className="space-y-4 py-2">
                                                <div className="flex flex-col space-y-2">
                                                    <label className="text-sm font-semibold" htmlFor="rating">
                                                        Rating
                                                    </label>
                                                    <input
                                                        id="rating"
                                                        type="number"
                                                        placeholder={`Max points:  ${assignment?.maxPoints}`}
                                                        className="border p-2 rounded"
                                                        value={ratingValue}
                                                        onChange={(e) => {
                                                            const val = e.target.value
                                                            if (val === "") {
                                                                setRatingValue("")
                                                            } else {
                                                                setRatingValue(parseInt(val, 10))
                                                            }
                                                        }}
                                                        min={0}
                                                        max={assignment?.maxPoints}
                                                        required
                                                    />
                                                </div>

                                                <div className="flex flex-col space-y-2">
                                                    <label className="text-sm font-semibold" htmlFor="note">
                                                        Note
                                                    </label>
                                                    <textarea
                                                        id="note"
                                                        className="border p-2 rounded"
                                                        value={noteValue}
                                                        onChange={(e) => setNoteValue(e.target.value)}
                                                    />
                                                </div>

                                                <DialogFooter>
                                                    <Button
                                                        type="submit"
                                                        disabled={addRatingMutation.isLoading}
                                                    >
                                                        {addRatingMutation.isLoading ? "Saving..." : "Save"}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>
                        <Separator />
                        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
                            <ResizablePanel defaultSize={15}>
                                <div className="flex items-center justify-between p-0">
                                    {submissionIds && (
                                        <>
                                            <div className="flex-1 flex justify-start">
                                                {cycleSubmission('prev') ? (
                                                    <Link to={`/subject/${subjectId}/assignments/${assignmentId}/submission/${cycleSubmission('prev')}`}>
                                                        <Button variant="ghost">
                                                            <ArrowLeft />
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <></>
                                                    // <Button variant="ghost" disabled>
                                                    //     <ArrowLeft />
                                                    // </Button>
                                                )}
                                            </div>
                                            <div className="text-sm">{`submission ${submissionIds.length - submissionIds.findIndex(id => id === parseInt(submissionId))}/${submissionIds.length}`}</div>
                                            <div className="flex-1 flex justify-end">
                                                {cycleSubmission('next') ? (
                                                    <Link to={`/subject/${subjectId}/assignments/${assignmentId}/submission/${cycleSubmission('next')}`}>
                                                        <Button variant="ghost">
                                                            <ArrowRight />
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <></>
                                                    // <Button variant="ghost" disabled>
                                                    //     <ArrowRight />
                                                    // </Button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <TOCWrapper endpoint={`/api/Upload/GetSubmissionFileTree/${submissionId}`} />
                                {/* <div className="p-4">bottom 1</div> */}
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={85}>
                                {/* <div className="p-4">top 2</div> */}
                                <FilePreviewer submissionId={submissionId} fileName={fileName} />
                                {/* <div className="p-4">bottom 2 end</div> */}
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </>
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
