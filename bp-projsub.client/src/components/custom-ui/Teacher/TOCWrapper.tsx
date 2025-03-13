import {
  Tree,
  TreeViewElement,
  File,
  Folder,
} from "@/components/extension/tree-view-api";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LinkIcon, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

type TOCProps = {
  toc: TreeViewElement[];
  contextMenu?: boolean;
};

const TOC = ({ toc, contextMenu = false }: TOCProps) => {
  return (
    <Tree className="bg-background p-2 rounded-md" indicator={true}>
      {toc.map((element) => (
        <TreeItem
          key={element.id}
          elements={[element]}
          parentPath=""
          contextMenu={contextMenu}
        />
      ))}
      {/* <CollapseButton elements={toc} expandAll={false} /> */}
    </Tree>
  );
};

type TreeItemProps = {
  elements: TreeViewElement[];
  parentPath?: string;
  contextMenu?: boolean;
};

interface FileTreeItem {
  id: string;
  name: string;
  isFolder: boolean;
  children: FileTreeItem[];
}

async function fetchSubmissionFileTree(endpoint: string): Promise<FileTreeItem[]> {
  const response = await axios.get(endpoint);
  return response.data;
}


export const TreeItem = ({ elements, parentPath = '', contextMenu }: TreeItemProps) => {
  const [, setSearchParams] = useSearchParams()
  const [newFileName, setNewFileName] = useState<string>('');
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const queryClient = useQueryClient();


  const handleRename = async (element: TreeViewElement) => {
    try {
      await axios.put(`/api/Upload/RenameAttachmentFile/${assignmentId}`, {
        oldFileName: `${parentPath}${element.name}`,
        newFileName: `${parentPath}${newFileName}`
      }
      );

      toast({ title: "Success", description: "File renamed successfully.", variant: "default" })
      console.log('File renamed successfully');
      queryClient.invalidateQueries(["fileTree", `/api/Upload/GetAssignmentFileTree/${assignmentId}`]);
      setNewFileName('');
    } catch (error) {
      toast({ title: "Error", description: "Error renaming file.", variant: "destructive" })
      console.error('Error renaming file:', error);
      setNewFileName(element.name);
    }
  };

  const handleDelete = async (element: TreeViewElement) => {
    try {
      // await axios.post(`/api/Upload/RemoveAttachmentFile/${assignmentId}`, element.name
      // );
      await axios.post(
        `/api/Upload/RemoveAttachmentFile/${assignmentId}`,
        JSON.stringify(element.name),
        { headers: { "Content-Type": "application/json" } }
      );


      toast({ title: "Success", description: `File '${element.name}' deleted successfully.`, variant: "default" })
      console.log('File deleted successfully');
      queryClient.invalidateQueries(["fileTree", `/api/Upload/GetAssignmentFileTree/${assignmentId}`]);
    } catch (error) {
      toast({ title: "Error", description: "Error deleting file.", variant: "destructive" })
      console.error('Error deleting file:', error);
    }
  };

  return (
    <ul className="w-full space-y-1">
      {elements.map((element) => {
        const currentPath = `${parentPath}${element.name}`;
        return (
          contextMenu ? (
            <li key={element.id} className="w-full space-y-2 flex items-center">
              {(element.children ?? []).length > 0 ? (
                <Folder
                  element={element.name}
                  value={element.id}
                  isSelectable={element.isSelectable}
                  className="px-px pr-1"
                >
                  <TreeItem
                    elements={element.children ?? []}
                    parentPath={`${currentPath}/`}
                    aria-label={`folder ${element.name}`}
                    contextMenu={contextMenu}
                  />
                </Folder>
              ) : (
                <>
                  <DropdownMenu
                    // onOpenChange={() => { setNewFileName(element.name) }}
                    modal={false}
                    key={element.id}
                  >
                    <DropdownMenuTrigger>
                      <File
                        key={element.id}
                        value={element.id}
                        isSelectable={element.isSelectable}
                        onClick={() => { setNewFileName(element.name) }}
                      >
                        <span onClick={() => {
                          setSearchParams({ file: currentPath }, { replace: true });
                        }}>{element.name}</span>
                      </File>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      // https://github.com/radix-ui/primitives/discussions/2198
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyDownCapture={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuLabel className="flex items-center">
                        <input
                          type="text"
                          className="w-full"
                          value={newFileName || element.name}
                          onChange={(e) => { setNewFileName(e.target.value) }}
                        // onKeyDown={(e) => e.key === 'Enter' && handleRename(element)}
                        />
                        <Button className="ml-1 p-1 h-fit w-fit" onClick={() => handleRename(element)} variant={"default"}><Save /></Button>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center"
                        onClick={() => handleDelete(element)}

                      >
                        <Trash2 className="mr-2 w-4 h-4 inline-block" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center"
                        onClick={() => {
                          navigator.clipboard.writeText(`[${element.name}](/api/Upload/GetAttachmentFile/${assignmentId}/?file=${encodeURIComponent(currentPath)})`);
                          toast({ title: "Copied", description: "Path copied to clipboard.", variant: "default" });
                        }}
                      >
                        <LinkIcon className="mr-2 w-4 h-4 inline-block" /> Copy link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </li>

          ) : ( // No context menu
            <li key={element.id} className="w-full space-y-2 flex items-center">
              {(element.children ?? []).length > 0 ? (
                <Folder
                  element={element.name}
                  value={element.id}
                  isSelectable={element.isSelectable}
                  className="px-px pr-1"
                >
                  <TreeItem
                    elements={element.children ?? []}
                    parentPath={`${currentPath}/`}
                    aria-label={`folder ${element.name}`}
                  />
                </Folder>
              ) : (
                <File
                  key={element.id}
                  value={element.id}
                  isSelectable={element.isSelectable}
                >
                  <span onClick={() => {
                    setSearchParams({ file: currentPath }, { replace: true });
                  }}>{element.name}</span>
                </File>
              )}
            </li>
          )
        );
      })}
    </ul >
  );
};

const TOCWrapper = ({ endpoint, contextMenu = false }: { endpoint: string, contextMenu?: boolean }) => {
  const {
    data: fileTree,
    isLoading,
    error,
  } = useQuery<FileTreeItem[], Error>(
    ["fileTree", endpoint],
    () => fetchSubmissionFileTree(endpoint)
  );

  if (error) {
    return <>
      <div>Error loading file tree.</div>
      <div>{error.message}</div>
    </>
  }

  if (isLoading) {
    return <div>Loading file tree...</div>;
  }

  if (!fileTree) {
    return <div>Error file tree is null?.</div>;
  }

  return <TOC toc={fileTree} contextMenu={contextMenu} />;
};

export default TOCWrapper;