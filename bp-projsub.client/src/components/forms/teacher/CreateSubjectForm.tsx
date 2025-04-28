import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { SubjectDto, CreateSubjectDto } from "@/Dtos/SubjectDto";
import { subjectSchema } from "@/schemas/subject";


export function CreateSubjectForm({
  onSuccess,
  // onCancel
}: {
  onSuccess?: (newSubject: SubjectDto) => void
  // onCancel?: () => void
}) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      description: "",
      studentLogins: "",
    },
  });

  // const handleCancel = () => {
  //   onCancel?.()
  // }
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof subjectSchema>) => {
      const pattern: RegExp = /^[A-Za-z]{3}\d{1,5}$/;
      const processedValues: CreateSubjectDto = {
        name: values.name,
        description: values.description || undefined,
        studentLogins: values.studentLogins
          ? values.studentLogins
            .split(',')
            .map(login => login.trim())
            .filter(login => {
              return pattern.test(login)
            }) : undefined,
      };

      const response = await axios.post<SubjectDto>("/api/teacher/CreateSubject", processedValues)
      return response.data
    },
    onSuccess: (newSubject) => {
      toast({
        title: "Success!",
        description: "Subject created successfully",
        variant: "default",
      })
      // form.reset()

      queryClient.setQueryData<SubjectDto[]>(['subjects'], (oldSubjects = []) => [
        ...oldSubjects,
        newSubject
      ])

      onSuccess?.(newSubject)
    },
    onError: (error: AxiosError<{
      message?: string;
      errors?: Record<string, string[]> | Array<{ code: string; description: string }>;
    }>) => {
      const errorData = error.response?.data;

      if (errorData?.errors) {
        if (Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(e => e.description);
          form.setError("root", { message: errorMessages.join("\n") });
        } else {
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            form.setError(field as keyof z.infer<typeof subjectSchema>, {
              type: "server",
              message: messages.join(", "),
            });
          });
        }
      } else {
        form.setError("root", {
          message: errorData?.message || "Failed to create subject",
        });
      }
    },
  });

  function onSubmit(values: z.infer<typeof subjectSchema>) {
    mutation.mutate(values);
  }

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md mt-5">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject name" {...field} />
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
                    <FormLabel>Subject Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter subject description"
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
                name="studentLogins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Logins (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter comma-separated student logins (e.g., abc123, xyz45)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="text-destructive text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? "Creating..." : "Create Subject"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}