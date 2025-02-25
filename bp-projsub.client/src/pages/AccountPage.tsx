import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function AccountPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: { oldPassword: string; newPassword: string }) => {
      const response = await axios.post("/api/account/changePassword", {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      })
      return response.data
    },
    onSuccess: (data: { message: string }) => { 
        toast({
          title: "Success",
          description: data.message,
          variant: "default",
        })
        form.reset()
      },
    onError: (error: AxiosError<{ message?: string; errors?: Array<{ code: string; description: string }> }>) => {
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.errors?.map(e => e.description).join(". ") || 
        "Failed to change password"

        form.setError('root', { message: errorMessage });

    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword
    })
  }

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            {form.formState.errors.root && (
                <p className="text-red-500 text-sm">
                {form.formState.errors.root.message}
                </p>
            )}
              <Button 
                type="submit" 
                className="w-full"
                disabled={mutation.isLoading }
              >
                {mutation.isLoading  ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}