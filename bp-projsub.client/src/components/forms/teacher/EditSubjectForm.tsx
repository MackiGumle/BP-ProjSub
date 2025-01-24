import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import SubjectDto from "@/Dtos/SubjectDto";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().max(500, "Description too long").optional(),
});

interface EditSubjectFormProps {
    subject: SubjectDto;
    onSuccess?: () => void;
}

export function EditSubjectForm({ subject, onSuccess }: EditSubjectFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: subject.name,
            description: subject.description || "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const payload = { ...values, id: subject.id };
            const response = await axios.put(
                `/api/Teacher/EditSubject`, payload
            );
            return response.data;
        },
        onSuccess: (data: { message: string; subjectId: number }) => {
            toast({
                title: "Success!",
                description: data.message,
                variant: "success",
            });
            form.reset();
            onSuccess?.();
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
                        form.setError(field as keyof z.infer<typeof formSchema>, {
                            type: "server",
                            message: messages.join(", "),
                        });
                    });
                }
            } else {
                form.setError("root", {
                    message: errorData?.message || "Failed to update subject",
                });
            }
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values);
    }

    return (
        <div className="flex justify-center items-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Edit Subject</CardTitle>
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
                                            <Input placeholder="Mathematics" {...field} />
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
                                        <FormLabel>Description (optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Course description..."
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

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={mutation.isLoading}
                            >
                                {mutation.isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}