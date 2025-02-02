// import { Card } from "@/components/ui/card";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// import { useQuery } from "@tanstack/react-query";
// import { ChevronDown, Folder, FolderIcon, Loader2 } from "lucide-react";
// import { useState } from "react";
// import axios from "axios";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuSubItem, SidebarProvider } from "../ui/sidebar";
// // import { CodeBlock, dracula } from "react-code-blocks";

// async function fetchFileTree(submissionId: string) {
//     const { data } = await axios.get(`/api/Upload/GetSubmissionFileTree/${submissionId}`);
//     return data;
// }

// export function SubmissionBrowser({ submissionId }: { submissionId: string }) {
//     // const { submissionId } = useParams<{ submissionId: string }>();
//     const [selectedFile, setSelectedFile] = useState<string | null>(null);
//     const { data: fileTree, isLoading, isError } = useQuery({
//         queryKey: ["fileTree", submissionId],
//         queryFn: () => fetchFileTree(submissionId!),
//         enabled: !!submissionId,
//     });

//     function renderFileTree(nodes: any[]) {
//         return (
//             <SidebarGroup>
//                 <SidebarGroupLabel>Files</SidebarGroupLabel>
//                 <SidebarGroupContent>
//                     <SidebarMenu className="pl-4">
//                         {nodes.map((node) => (
//                             <Collapsible className="group/collapsible" key={node.name}>
//                                 {node.isFolder ? (
//                                     <SidebarMenuItem key={node.name} className="cursor-pointer text-left">
//                                         <CollapsibleTrigger className="flex items-center gap-2">
//                                             <ChevronDown className="h-4 w-4" />
//                                             <FolderIcon className="h-4 w-4" />
//                                             <span className="font-semibold">{node.name}</span>
//                                         </CollapsibleTrigger>
//                                         <CollapsibleContent>{renderFileTree(node.children)}</CollapsibleContent>
//                                     </SidebarMenuItem>
//                                 ) : (
//                                     <SidebarMenuSubItem onClick={() => setSelectedFile(node.name)} className="hover:underline">{node.name}</SidebarMenuSubItem >
//                                 )}
//                             </Collapsible>
//                         ))}
//                     </SidebarMenu>
//                 </SidebarGroupContent>
//             </SidebarGroup>
//         );
//     }

//     return (
//         <SidebarProvider>
//             <div className="flex h-full">
//                 <Sidebar className="h-full">
//                     <SidebarContent>
//                         <h2 className="text-lg font-semibold mb-2">File Tree</h2>
//                         <ScrollArea className="h-full border rounded-md p-2">
//                             {isLoading ? (
//                                 <Skeleton className="h-20 w-full rounded-md" />
//                             ) : isError ? (
//                                 <p className="text-red-500">Failed to load file tree.</p>
//                             ) : (
//                                 renderFileTree(fileTree)
//                             )}
//                         </ScrollArea>
//                     </SidebarContent>
//                 </Sidebar>
//                 <div className="flex-1 p-6">
//                     <Card className="p-4 border rounded-xl shadow-md">
//                         <h2 className="text-lg font-semibold mb-2">File Content</h2>
//                         <ScrollArea className="h-80 border rounded-md p-2">
//                             {selectedFile ? (
//                                 // <CodeBlock
//                                 //     text={`// Simulated content of ${selectedFile}`}
//                                 //     language="javascript"
//                                 //     showLineNumbers
//                                 //     theme={dracula}
//                                 // />
//                                 <div>
//                                     <p className="text-muted-foreground">Simulated content of {selectedFile}</p>
//                                 </div>
//                             ) : (
//                                 <p className="text-muted-foreground">Select a file to view its content.</p>
//                             )}
//                         </ScrollArea>
//                     </Card>
//                 </div>
//             </div>
//         </SidebarProvider>
//     );
// }


import { FilePreviewer } from "@/components/custom-ui/FilePreview"
import TOCWrapper from "@/components/custom-ui/Teacher/TOCWrapper"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useParams, useSearchParams } from "react-router-dom";

export function SubmissionBrowser() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { submissionId } = useParams();
    const fileName = searchParams.get('file');

    return (
        <>
            {
                submissionId ? (
                    // <div className="min-w-full max-w-full min-h-full max-h-full">
                    <div className="w-full h-full">
                        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
                            <ResizablePanel defaultSize={15} className="max-h-full overflow-scroll">
                                <TOCWrapper submissionId={submissionId} />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={85} className="overflow-auto">
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
