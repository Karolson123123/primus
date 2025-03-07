"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResetSchema } from "@/schema";
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
import { reset } from "@/actions/reset";

/**
 * Komponent formularza resetowania hasła
 * Obsługuje proces wysyłania linku resetującego hasło na podany adres email
 */
export default function ResetForm() {
    // Stan komponentu
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    // Inicjalizacja formularza z walidacją
    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        }
    });

    /**
     * Obsługa wysłania formularza
     * Przeprowadza proces resetowania hasła i obsługuje odpowiedź serwera
     */
    const onSubmit = (values: z.infer<typeof ResetSchema>) => {
        setError("");
        setSuccess("");
        
        startTransition(() => {
            reset(values)
                .then((data) => {
                    setError(data?.error);
                    setSuccess(data?.success);
                })
                .catch(() => setError("Wystąpił błąd podczas wysyłania linku resetującego"));
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Adres email</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder="jan.kowalski@example.com" 
                                        type="email"
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
                    className="bg-[var(--yellow)] hover:bg-[var(--darkeryellow)]"
                >
                    Wyślij link resetujący
                </Button>
            </form>
        </Form>
    );
};
