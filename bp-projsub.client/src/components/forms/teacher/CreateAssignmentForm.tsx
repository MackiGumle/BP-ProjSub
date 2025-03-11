import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { assignmentSchema } from "@/schemas/assignment"
import { useCreateAssignment } from "@/hooks/useCreateAssignment"
import { CreateAssignmentDto } from "@/Dtos/AssignmentDto"
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
import { Textarea } from "@/components/ui/textarea"
import { DatetimePicker } from "@/components/ui/datetime-picker"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

type AssignmentFormValues = z.infer<typeof assignmentSchema>


export function CreateAssignmentForm({
  subjectId,
}: { subjectId: number }) {
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      type: "Homework",
      title: "",
      description: "",
      dateAssigned: new Date(Date.now()).toISOString(),
      dueDate: new Date(Date.now()).toISOString(),
      maxPoints: "",
    },
  })

  const createAssignment = useCreateAssignment<CreateAssignmentDto>({
    subjectId
  })

  function onSubmit(values: AssignmentFormValues) {
    const payload: CreateAssignmentDto = {
      SubjectId: subjectId,
      Type: values.type,
      Title: values.title,
      Description: values.description,
      DateAssigned: values.dateAssigned ? new Date(values.dateAssigned).toISOString() : undefined,
      DueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      MaxPoints: values.maxPoints ? Number(values.maxPoints) : undefined,
    }

    createAssignment.mutate(payload);
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CardHeader>
              <CardTitle>Create Assignment</CardTitle>
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
                        defaultValue={field.value}
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

              <FormField
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
              />

              <FormField
                control={form.control}
                name="dateAssigned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Date</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        value={new Date()}
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
                        value={new Date()}
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
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={createAssignment.isLoading}>
                {createAssignment.isLoading ? "Creating..." : "Create Assignment"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
