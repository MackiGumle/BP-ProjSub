import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { StudentDto } from "@/Dtos/StudentDto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, Trash2, User } from "lucide-react";
import { useParams } from "react-router-dom";


export const StudentColumns: ColumnDef<StudentDto>[] = [
    {
        accessorKey: "userName",
        header: () => <div className="text-center">
            Login
        </div>,
        cell: ({ row }) => <div className="">{row.getValue("userName")}</div>,
    },
    {
        accessorKey: "email",
        header: () => <div className="text-center">Email</div>,
        cell: ({ row }) => <div className="">{row.getValue("email")}</div>,
    },
    // {
    //     id: "delete",
    //     cell: ({ row }) => {
    //         const student = row.original
    //         const { subjectId } = useParams<{ subjectId: string }>();

    //         return (
    //             <Button variant="ghost" onClick={() => {console.log("Delete student", student);} }>
    //                 <Trash2 />
    //             </Button>
    //         )
    //     },
    // }
];