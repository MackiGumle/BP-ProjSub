import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import SyntaxHighlighter from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import materialLight from "react-syntax-highlighter/dist/cjs/styles/prism/material-light";
import { useAssignmentQuery } from "@/hooks/useCustomQuery";
import { useParams } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import 'katex/dist/katex.min.css'; // Keeps unformated text hidden
import { MarkdownRenderer } from "../MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Save, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator"


export function AssignmentEdit() {
    const { assignmentId } = useParams<{ assignmentId: string }>()
    const { data: assignment, isLoading: isAssignmentLoading, error: errorAssignment } = useAssignmentQuery({ assignmentId: parseInt(assignmentId || "") })
    const [description, setDescription] = useState("")

    useEffect(() => {
        if (assignment) {
            setDescription(assignment.description || "");
        }
    }, [assignment]);

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="ml-auto mr-2 space-x-2">
                    <Button variant="destructive"><Trash /></Button>
                    <Button variant="default"><Save /></Button>
                </div>
            </div>
            <Separator />
            <ResizablePanelGroup direction="horizontal" className="w-full h-full">

                <ResizablePanel defaultSize={10}>
                    fileTree
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={45}>
                    <Textarea
                        // autoFocus
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-full border-none rounded-none"
                    />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={45}>
                    <MarkdownRenderer content={description} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    );
}
