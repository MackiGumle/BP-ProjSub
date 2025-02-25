import { z } from "zod"
import { studentLoginsSchema } from "./studentLogins";

export const subjectSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().max(500, "Description too long").optional(),
    // studentLogins: z
    //     .string()
    //     .optional()
    //     .refine(
    //         (value) => {
    //             if (!value) return true;
    //             const logins = value
    //                 .split(",")
    //                 .map((login) => login.trim())
    //                 .filter((login) => login.length > 0);

    //             return logins.every((login) => /^[A-Za-z]{3}\d{1,5}$/.test(login));
    //         },
    //         {
    //             message:
    //                 "Logins must be comma-separated and match the pattern: 'abc123', 'def4567'",
    //         }
    //     ),
    studentLogins: studentLoginsSchema
});