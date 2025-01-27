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
import { toast } from "@/components/ui/use-toast"

type AssignmentFormValues = z.infer<typeof assignmentSchema>

interface CreateAssignmentFormProps {
  subjectId: number
  onSuccess?: () => void
}

export function CreateAssignmentForm({
  subjectId,
  onSuccess,
}: CreateAssignmentFormProps) {
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      type: "Homework",
      title: "",
      description: "",
      dueDate: "",
      maxPoints: "",
    },
  })

  // Custom hook uses <T extends FieldValues> to pass form.setError
  const createAssignment = useCreateAssignment<AssignmentFormValues>({
    subjectId,
    // Pass form.setError so the hook can call handleFormErrors
    setError: form.setError,
    onSuccess: () => {
      toast({
        title: "Assignment created",
        description: "Assignment was created successfully.",
        variant: "success",
      })
      // form.reset()
      onSuccess?.()
    },
  })

  function onSubmit(values: AssignmentFormValues) {
    // Transform form string to numbers or keep as string
    const payload: Omit<CreateAssignmentDto, "subjectId"> = {
      type: values.type,
      title: values.title,
      description: values.description,
      dueDate: values.dueDate || undefined,
      maxPoints: values.maxPoints ? Number(values.maxPoints) : undefined,
    }

    createAssignment.mutate(payload)
  }

  return (
    <div className="max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

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
                    className="resize-none"
                    {...field}
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
                  <Input
                    type="date"
                    placeholder="yyyy-mm-dd"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
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

          {/* ROOT LEVEL ERROR MESSAGES */}
          {form.formState.errors.root && (
            <div className="text-sm text-red-600">
              {form.formState.errors.root.message}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={createAssignment.isLoading}
            >
              {createAssignment.isLoading ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
