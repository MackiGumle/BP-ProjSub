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
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/UserContext"
import { useEffect, useState } from "react"

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email"
  }),
  password: z.string().min(1, { message: "Password is empty" }),
})


export default function LoginForm() {
  const { login } = useAuth();  

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      login(values.email, values.password);
    } catch (error) {
      console.error("Login failed:", error);
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md flex flex-col gap-4">
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>

          )}
        />
        {/* <FormMessage>Form message</FormMessage> */}
        <Button type="submit">Login</Button>
      </form>
    </Form>
  )
}
