import { ColumnDef } from "@tanstack/react-table";

export interface StudentDto {
    personId: string;
    userName: string;
    email: string;
};

export const StudentColumns: ColumnDef<StudentDto>[] = [
    {
        accessorKey: "personId",
        header: "Person ID",
    },
    {
        accessorKey: "userName",
        header: "Username",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
];