import { z } from "zod"

export const assignmentSchema = z.object({
    type: z.enum(["Homework", "Test", "Project"]),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),

    assignmentDate: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true // optional
            const d = new Date(val)
            return !isNaN(d.getTime())
        }, { message: "Invalid date" }),

    dueDate: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true // optional
            const d = new Date(val)
            return !isNaN(d.getTime())
        }, { message: "Invalid date" }),

    maxPoints: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true // optional
            const num = Number(val)
            return !isNaN(num) && num >= 0
        }, { message: "Max Points must be a non-negative number" }),
})
