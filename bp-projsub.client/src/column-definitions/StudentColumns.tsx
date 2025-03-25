import { StudentDto } from "@/Dtos/StudentDto";
import { ColumnDef } from "@tanstack/react-table";


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
];