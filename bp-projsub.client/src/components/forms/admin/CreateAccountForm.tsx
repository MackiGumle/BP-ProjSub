import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/UserContext"
import axios from "axios"
import { toast } from "@/components/ui/use-toast"


const formSchema = z.object({
  userName: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  email: z.string().email({
    message: "Invalid email"
  }),
  role: z.string().min(1, { message: "Role is empty" }),
  // password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  // confirmPassword: z.string(),
})
//.refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })


export default function CreateAccountForm() {
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      email: "",
      role: "Teacher",
    },
  })


  async function onSubmit(values: z.infer<typeof formSchema>) {
    await axios.post("api/Admin/createAccount", values).then(response => {
      console.log(response);
      toast({ title: "Success", description: response.data.message });
    }
    ).catch(error => {
      // console.error(error);
      console.log(error.response.data.message);
      toast({ title: "Error", description: error.response.data.message, variant: "destructive" });

      
    });
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="userName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">Role</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent {...field}>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  )
}
