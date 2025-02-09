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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/FormError";
import { FormSuccess } from "@/components/FormSuccess";
import { login } from "@/actions/login";
import { useState, useTransition } from "react";
import Socials from "@/components/auth/Socials";
import { useSearchParams } from "next/navigation";
import Link from "next/link";



export default function LoginForm() {
    const searchParams = useSearchParams();
    const urlError = searchParams.get("error") === "OAuthAccountNotLinked" ? "Email jest już za pomocą innej platformy!" : "";


    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
            code: "",
        }
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            login(values)
                .then((data) => {
                    if(data?.error) {
                        form.reset();
                        setError(data.error);
                    }

                    if (data?.success) {
                        form.reset();
                        setSuccess(data.success);
                    }

                    if (data?.twoFactor) {
                        setShowTwoFactor(true);
                    }

                })
                .catch(() => setError("Coś poszło nie tak!"));
    });
    }

    return (
        <>
            

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="space-y-4">
                        {showTwoFactor && (
                            <FormField
                                control={form.control}
                                name="code"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Kod uwierzytelniania dwuetapowego</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="123456" 
                                                    
                                                    />
                                            </FormControl>
                                            <FormMessage></FormMessage>
                                    </FormItem>
                                )}
                            />
                        )}
                        {!showTwoFactor && (
                        <>
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
                                            <Button 
                                                size="sm"
                                                variant="link"
                                                asChild
                                                className="text-white px-0 "
                                            >
                                                <Link href="reset">Nie pamiętasz hasła?</Link>

                                            </Button>
                                            <FormMessage></FormMessage>
                                    </FormItem>
                                )}
                            />
                        </>
                        )}
                    </div>
                    
                    <FormError message={error || urlError}></FormError>
                    <FormSuccess message={success}></FormSuccess>
                    
                    <Button disabled={isPending}>{showTwoFactor ? "Confirm" : "Login"}</Button>
                    <Socials></Socials>
                </form>
            </Form>
        </>
    )
};
