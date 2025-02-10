import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import remarkGfm from 'remark-gfm'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useAssignmentQuery } from "@/hooks/useCustomQuery";
import { useParams } from "react-router-dom";


export function AssignmentEdit() {
    const { assignmentId } = useParams<{ assignmentId: string }>()
    const { data: assignment, isLoading: isAssignmentLoading, error: errorAssignment } = useAssignmentQuery({ assignmentId: parseInt(assignmentId || "") })


    return (
        <>
            <ResizablePanelGroup direction="horizontal" className="w-full h-full">

                <ResizablePanel defaultSize={10}>
                    fileTree
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={45}>
                    editor
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={45}>
                    <Markdown className='markdown'
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code(props) {
                                const { children, className, node, ...rest } = props
                                const match = /language-(\w+)/.exec(className || '')
                                console.log(match)
                                return match ? (
                                    <SyntaxHighlighter
                                        PreTag="div"
                                        children={String(children).replace(/\n$/, '')}
                                        language={match[1]}
                                        style={docco}
                                    />
                                ) : (
                                    <code {...rest} className={className}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >{assignment?.description}</Markdown>
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    );
}
