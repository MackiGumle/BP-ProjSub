// import React from "react";
// import axios from "axios";
// import { useQuery } from "@tanstack/react-query";


// interface FileTreeItem {
//     name: string;
//     isFolder: boolean;
//     children: FileTreeItem[];
// }

// async function fetchSubmissionFileTree(submissionId: string): Promise<FileTreeItem[]> {
//     const response = await axios.get(`/api/Upload/GetSubmissionFileTree/${submissionId}`);
//     return response.data;
// }



// export function Nevim({ submissionId }: { submissionId: string }) {
//     const {
//         data: fileTree,
//         isLoading,
//         error,
//     } = useQuery<FileTreeItem[], Error>(
//         ["submissionFileTree", submissionId],
//         () => fetchSubmissionFileTree(submissionId)
//     );

//     if (isLoading) {
//         return <div>Loading file tree...</div>;
//     }

//     if (error) {
//         return <div>Error loading file tree.</div>;
//     }

//     return (
//         <TreeView
//             elements={fileTree}
//             initialSelectedId="3"
//             initialExpendedItems={["1", "2"]}
//         />
//         // <SidebarProvider>
//         //   <SidebarContent>
//         //     <SidebarGroup>
//         //       <SidebarGroupLabel>Files</SidebarGroupLabel>
//         //       <SidebarGroupContent>
//         //         <SidebarMenu>
//         //           {fileTree?.map((item, index) => (
//         //             <Tree key={index} item={item} />
//         //           ))}
//         //         </SidebarMenu>
//         //       </SidebarGroupContent>
//         //     </SidebarGroup>
//         //   </SidebarContent>
//         // </SidebarProvider>
//     );
// }



// import { TreeView } from "@/components/extension/tree-view";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";


// interface FileTreeItem {
//   id: string;
//   name: string;
//   isFolder: boolean;
//   children: FileTreeItem[];
// }

// async function fetchSubmissionFileTree(submissionId: string): Promise<FileTreeItem[]> {
//   const response = await axios.get(`/api/Upload/GetSubmissionFileTree/${submissionId}`);
//   return response.data;
// }


// const elements = [
//   {
//     id: "1",
//     name: "components",
//     children: [
//       {
//         id: "2",
//         name: "extension",
//         children: [
//           {
//             id: "3",
//             name: "tree-view.tsx",
//           },
//           {
//             id: "4",
//             name: "tree-view-api.tsx",
//           },
//         ],
//       },
//       {
//         id: "5",
//         name: "dashboard-tree.tsx",
//       },
//     ],
//   },
// ];

// export default function TreeViewExample({submissionId}: {submissionId: string}) {
// const {
//   data: fileTree,
//   isLoading,
//   error,
// } = useQuery<FileTreeItem[], Error>(
//   ["submissionFileTree", submissionId],
//   () => fetchSubmissionFileTree(submissionId)
// );

//   if (isLoading) {
//     return <div>Loading file tree...</div>;
//   }

//   if (error) {
//     return <div>Error loading file tree.</div>;
//   }

//   return (
//     <TreeView
//       elements={fileTree}
//       initialSelectedId="3"
//       initialExpendedItems={["1", "2"]}
//     />
//   );
// }


import {
  Tree,
  TreeViewElement,
  File,
  Folder,
  CollapseButton,
} from "@/components/extension/tree-view-api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";

type TOCProps = {
  toc: TreeViewElement[];
};

// const TOC = ({ toc }: TOCProps) => {
//   return (
//     <Tree className="min-w-full min-h-full bg-background p-2 rounded-md" indicator={true}>
//       {toc.map((element, _) => (
//         <TreeItem key={element.id} elements={[element]} />
//       ))}
//       <CollapseButton elements={toc} expandAll={true} />
//     </Tree>
//   );
// };

const TOC = ({ toc }: TOCProps) => {
  return (
    <Tree className="min-w-full min-h-full bg-background p-2 rounded-md" indicator={true}>
      {toc.map((element) => (
        <TreeItem
          key={element.id}
          elements={[element]}
          parentPath=""
        />
      ))}
      <CollapseButton elements={toc} expandAll={true} />
    </Tree>
  );
};


type TreeItemProps = {
  elements: TreeViewElement[];
  parentPath?: string;
};

interface FileTreeItem {
  id: string;
  name: string;
  isFolder: boolean;
  children: FileTreeItem[];
}

async function fetchSubmissionFileTree(submissionId: string): Promise<FileTreeItem[]> {
  const response = await axios.get(`/api/Upload/GetSubmissionFileTree/${submissionId}`);
  return response.data;
}

// export const TreeItem = ({ elements }: TreeItemProps) => {
//   const [searchParams, setSearchParams] = useSearchParams()
//   // const { selectedFile } = useParams();

//   return (
//     <ul className="w-full space-y-1">
//       {elements.map((element) => (
//         <li key={element.id} className="w-full space-y-2">
//           {element.children && element.children?.length > 0 ? (
//             <Folder
//               element={element.name}
//               value={element.id}
//               isSelectable={element.isSelectable}
//               className="px-px pr-1"
//             >
//               <TreeItem
//                 key={element.id}
//                 aria-label={`folder ${element.name}`}
//                 elements={element.children}
//               />
//             </Folder>
//           ) : (
//             <File
//               key={element.id}
//               value={element.id}
//               isSelectable={element.isSelectable}
//             >
//               <span onClick={() => {
//                 setSearchParams({ file: element?.name }, { replace: true });
//               }}>{element?.name}</span>
//             </File>
//           )}
//         </li>
//       ))}
//     </ul>
//   );
// };

export const TreeItem = ({ elements, parentPath = '' }: TreeItemProps) => {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <ul className="w-full space-y-1">
      {elements.map((element) => {
        const currentPath = `${parentPath}${element.name}`;
        return (
          <li key={element.id} className="w-full space-y-2">
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
        );
      })}
    </ul>
  );
};

const TOCWrapper = ({ submissionId }: { submissionId: string }) => {
  const {
    data: fileTree,
    isLoading,
    error,
  } = useQuery<FileTreeItem[], Error>(
    ["submissionFileTree", submissionId],
    () => fetchSubmissionFileTree(submissionId)
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

  return <TOC toc={fileTree} />;
};

export default TOCWrapper;