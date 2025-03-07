"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { NewPasswordSchema } from "@/schema";
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
import { useState, useTransition } from "react";
import { newPassword } from "@/actions/new-password";
import { useSearchParams } from "next/navigation";

/**
 * Komponent formularza zmiany hasła
 * Obsługuje proces ustawiania nowego hasła z wykorzystaniem tokenu resetującego
 */
export default function NewPasswordForm() {
    // Pobieranie tokenu z parametrów URL
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    // Stan komponentu
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    // Inicjalizacja formularza z walidacją
    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
        }
    });

    /**
     * Obsługa wysłania formularza
     * Przeprowadza proces zmiany hasła i obsługuje odpowiedź serwera
     */
    const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");
        
        startTransition(() => {
            newPassword(values, token)
                .then((data) => {
                    setError(data?.error);
                    setSuccess(data?.success);
                })
                .catch(() => setError("Wystąpił błąd podczas zmiany hasła"));
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Nowe hasło</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder="******" 
                                        type="password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <FormError message={error} />
                <FormSuccess message={success} />
                
                <Button 
                    disabled={isPending}
                    className="w-full bg-[var(--yellow)] hover:bg-[var(--darkeryellow)]"
                >
                    Zmień hasło
                </Button>
            </form>
        </Form>
    );
}
