import {  Upload,  MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"


export function StudentAssignmentActions({ assignmentId }: { assignmentId: number }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => console.log('Submit to assignment', assignmentId)}
    >
      <Upload className="h-4 w-4" />
    </Button>
  )
}

export function TeacherAssignmentActions({ assignmentId }: { assignmentId: number }) {
  return (
    // <div className="flex-col gap-1">
    //   <SidebarMenuAction
    //     onClick={() => console.log('Edit assignment', assignmentId)}
    //   >
    //     <Pencil className="h-4 w-4" />
    //   </SidebarMenuAction>
    //   <SidebarMenuAction
    //     onClick={() => console.log('Delete assignment', assignmentId)}
    //   >
    //     <Trash className="h-4 w-4" />
    //   </SidebarMenuAction>
    // </div>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
            <MoreHorizontal />
          <span className="sr-only">Assignment action</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => console.log('Edit assignment', assignmentId)}>
          {/* <Edit className="mr-1" /> */}
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log('Delete assignment', assignmentId)}>
            {/* <Trash className="mr-1" /> */}
            Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}