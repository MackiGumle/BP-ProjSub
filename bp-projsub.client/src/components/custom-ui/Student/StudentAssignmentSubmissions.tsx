import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { UppyDragDrop } from "../UppyDragDrop";
import { useQueryClient } from "@tanstack/react-query";

export function StudentAssignmentSubmissions() {
    const { subjectId, assignmentId } = useParams<{ subjectId: string; assignmentId: string }>();
    const [isAssignmentOpen, setAssignmentOpen] = useState<boolean>(false);
    // const { queryClient } = useQueryClient()

    return (
        <div className="w-4xl mx-3 p-6">


            <div className="space-y-6">
                <Collapsible
                    open={isAssignmentOpen}
                    onOpenChange={() => setAssignmentOpen(!isAssignmentOpen)}
                >
                    <Card className="shadow-lg rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                            <span className="text-xl font-semibold">Název zadání</span>
                            <ChevronDown
                                className={`h-5 w-5 transition-transform duration-200 ${isAssignmentOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-6 py-4">
                            <p className="text-gray-700">Popis zadání</p>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {assignmentId && (
                    <Card className="shadow-lg rounded-lg p-6">
                        <UppyDragDrop assignmentId={parseInt(assignmentId)} />
                    </Card>
                )}
            </div>
        </div>
    );
}
