import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, File, Folder } from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarProvider,

} from "@/components/ui/sidebar";

interface FileTreeItem {
    name: string;
    isFolder: boolean;
    children: FileTreeItem[];
}

async function fetchSubmissionFileTree(submissionId: string): Promise<FileTreeItem[]> {
    const response = await axios.get(`/api/Upload/GetSubmissionFileTree/${submissionId}`);
    return response.data;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    submissionId: string;
}

export function Sidebar11({ submissionId, ...props }: AppSidebarProps) {
    const {
        data: fileTree,
        isLoading,
        error,
    } = useQuery<FileTreeItem[], Error>(
        ["submissionFileTree", submissionId],
        () => fetchSubmissionFileTree(submissionId)
    );

    if (isLoading) {
        return <div>Loading file tree...</div>;
    }

    if (error) {
        return <div>Error loading file tree.</div>;
    }

    return (
        <>
            <SidebarProvider>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Files</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {fileTree?.map((item, index) => (
                                    <Tree key={index} item={item} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </SidebarProvider>
        </>
    );
}

interface TreeProps {
    item: FileTreeItem;
}

function Tree({ item }: TreeProps) {
    if (!item.isFolder) {
        return (
            <SidebarMenuButton className="mr-0 pr-0 whitespace-nowrap">
                <File />
                {item.name}
            </SidebarMenuButton>
        );
    }

    return (
        <SidebarInset>
            <SidebarMenuItem className="mr-0 pr-0">
                <Collapsible
                    className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90 p-0"
                    defaultOpen={false}
                >
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                            <ChevronRight className="transition-transform" />
                            <Folder />
                            <span>{item.name}</span>
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mr-0 pr-0 border border-red-800">
                        <SidebarMenuSub className="mr-0 pr-0">
                            {item.children?.map((child, index) => (
                                <Tree key={index} item={child} />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>
        </SidebarInset>
    );
}
