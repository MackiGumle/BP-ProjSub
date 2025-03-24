import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { assignmentSchema } from "@/schemas/assignment"
import { useEditAssignment } from "@/hooks/useEditAssignment"
import { AssignmentDto, EditAssignmentDto } from "@/Dtos/AssignmentDto"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
import { DatetimePicker } from "@/components/ui/datetime-picker"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

type AssignmentFormValues = z.infer<typeof assignmentSchema>

interface EditAssignmentFormProps {
    subjectId: string
    assignment: AssignmentDto
}

export function EditAssignmentForm({
    subjectId,
    assignment,
}: EditAssignmentFormProps) {
    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            type: (assignment.type as "Homework" | "Test" | "Project") || "Homework",
            title: assignment.title,
            description: assignment.description ?? "",
            dateAssigned: assignment.dateAssigned,
            dueDate: assignment.dueDate,
            maxPoints: assignment.maxPoints?.toString(),
        },
    })

    const editAssignment = useEditAssignment<EditAssignmentDto>({
        subjectId
    })

    function onSubmit(values: AssignmentFormValues) {
        console.log(values)
        const payload: EditAssignmentDto = {
            Id: assignment.id,
            Type: values.type,
            Title: values.title,
            Description: values.description,
            DateAssigned: values.dateAssigned ? new Date(values.dateAssigned) : new Date(),
            DueDate: values.dueDate ? new Date(values.dueDate) : undefined,
            MaxPoints: values.maxPoints ? Number(values.maxPoints) : undefined,
        }

        editAssignment.mutate(payload)
    }

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <CardHeader>
                            <CardTitle>Edit Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select assignment type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Homework">Homework</SelectItem>
                                                    <SelectItem value="Test">Test</SelectItem>
                                                    <SelectItem value="Project">Project</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Assignment title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Optional description"
                                                className="resize-y"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}

                            <FormField
                                control={form.control}
                                name="dateAssigned"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignment Date</FormLabel>
                                        <FormControl>
                                            <DatetimePicker
                                                value={field.value ? new Date(field.value) : new Date()}
                                                onChange={(date) => field.onChange(date?.toISOString())}
                                                format={[
                                                    ["days", "months", "years"],
                                                    ["hours", "minutes", "seconds"],
                                                ]}
                                                dtOptions={{ hour12: false }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <DatetimePicker
                                                value={field.value ? new Date(field.value) : undefined}
                                                onChange={(date) => field.onChange(date?.toISOString())}
                                                format={[
                                                    ["days", "months", "years"],
                                                    ["hours", "minutes", "seconds"],
                                                ]}
                                                dtOptions={{ hour12: false }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="maxPoints"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Points</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 100"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                type="submit"
                                disabled={editAssignment.isLoading}
                            >
                                {editAssignment.isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}