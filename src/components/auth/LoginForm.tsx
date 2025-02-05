"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginSchema } from "@/schema";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage


} from "@/components/ui/form"
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/FormError";
import { FormSuccess } from "@/components/FormSuccess";
import { login } from "@/actions/login";
import { useState, useTransition } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";


export default function LoginForm() {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");


        startTransition(() => {
            login(values)
                .then((data) => {
                    setError(data.error);
                    setSuccess(data.success);
                })
    });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="primus@ngineers.pl" 
                                            type = "email"
                                            />
                                    </FormControl>
                                    <FormMessage></FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Hasło</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="*******" 
                                            type = "password"
                                            />
                                    </FormControl>
                                    <FormMessage></FormMessage>
                            </FormItem>
                        )}
                    />
                </div>
                
                <FormError message={error}></FormError>
                <FormSuccess message={success}></FormSuccess>
                
                <Button disabled={isPending}>Zaloguj się</Button>
                <div className="flex my-2 gap-1">
                    <Button className="px-6 py-3 flex-1">
                        <FcGoogle className="w-5 h-5"></FcGoogle>
                    </Button>
                    <Button className="px-6 py-3 flex-1">
                        <FaGithub className="w-5 h-5"></FaGithub>
                    </Button>
                </div>
                
                
            </form>
        </Form>
    )
};
