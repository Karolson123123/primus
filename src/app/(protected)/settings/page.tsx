"use client";


import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsSchema } from "@/schema";
import { useTransition, useState } from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { settings } from "@/actions/settings";
import { 
    Form,
    FormField,
    FormControl,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage
 } from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { FormSuccess } from "@/components/FormSuccess";
import { FormError } from "@/components/FormError";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,

 } from "@/components/ui/select";
import { UserRole } from "@prisma/client";
import { Switch } from "@/components/ui/switch";

const SettingsPage =  () => {
    const user = useCurrentUser();


    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const { update } = useSession();
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof SettingsSchema>>({
        resolver: zodResolver(SettingsSchema),
        defaultValues: {
            name: user?.name || undefined,
            email: user?.email || undefined,
            password: undefined,
            newPassword: undefined,
            role: user?.role || undefined,
            isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined
        }
    })

    const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
        startTransition( () => {
            settings(values)
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    }

                    if (data.success) {
                        update();
                        setSuccess(data.success);
                    }  
                })
                .catch(() => setError("Coś poszło nie tak!"));
        });
    }


    useEffect(() => {
            const hasReloaded = sessionStorage.getItem("hasReloaded");
            if (!hasReloaded) {
                sessionStorage.setItem("hasReloaded", "true");
                window.location.reload();
            } else {
                sessionStorage.removeItem("hasReloaded");
            }
        }, []);
    return (
        <Card className="bg-[var(--cardblack)] w-[95%] max-lg:w-full mx-auto border border-[var(--yellow)]">
            <CardHeader>
                <p className="text-2xl max-lg:text-xl font-semibold text-center text-white">
                    Ustawienia
                </p>
            </CardHeader>
            <CardContent className="max-lg:p-4">
                <Form {...form}>
                    <form 
                        className="space-y-6 max-lg:space-y-4" 
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <div className="flex flex-col gap-5 max-lg:gap-4">
                            <FormField 
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="text-white">
                                        <FormLabel className="text-white text-sm max-lg:text-xs">
                                            Nazwa użytkownika
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field} 
                                                placeholder="mati usiek"
                                                disabled={isPending}
                                                type="text"
                                                className="bg-[var(--cardblack)] border-[var(--yellow)] 
                                                    focus:border-[var(--yellow)] focus:ring-[var(--yellow)]
                                                    text-white text-sm max-lg:text-xs"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs max-lg:text-[10px]"/>
                                    </FormItem>
                                )}
                            />
                            {user?.isOAuth === false && (
                                <>
                                    <FormField 
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="text-white">
                                                <FormLabel className="text-white text-sm max-lg:text-xs">
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field} 
                                                        placeholder="primus@gmail.com"
                                                        disabled={isPending}
                                                        type="email"
                                                        className="bg-[var(--cardblack)] border-[var(--yellow)] 
                                                            focus:border-[var(--yellow)] focus:ring-[var(--yellow)]
                                                            text-white text-sm max-lg:text-xs w-full
                                                            max-lg:p-2 max-lg:h-10"
                                                        autoComplete="email"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs max-lg:text-[10px]"/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField 
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="text-white w-full">
                                                <FormLabel className="text-white text-sm max-lg:text-xs">
                                                    Obecne hasło
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field} 
                                                        placeholder="******"
                                                        disabled={isPending}
                                                        type="password"
                                                        className="bg-[var(--cardblack)] border-[var(--yellow)] 
                                                            focus:border-[var(--yellow)] focus:ring-[var(--yellow)]
                                                            text-white text-sm max-lg:text-xs w-full
                                                            max-lg:p-2 max-lg:h-10"
                                                        autoComplete="current-password"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs max-lg:text-[10px]"/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField 
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem className="text-white w-full">
                                                <FormLabel className="text-white text-sm max-lg:text-xs">
                                                    Nowe hasło
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}  // Add this line to spread the field props
                                                        placeholder="******"
                                                        disabled={isPending}
                                                        type="password"
                                                        className="bg-[var(--cardblack)] border-[var(--yellow)] 
                                                            focus:border-[var(--yellow)] focus:ring-[var(--yellow)]
                                                            text-white text-sm max-lg:text-xs w-full
                                                            max-lg:p-2 max-lg:h-10"
                                                        autoComplete="new-password"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs max-lg:text-[10px]">
                                                    Minimum 6 znaków
                                                </FormDescription>
                                                <FormMessage className="text-xs max-lg:text-[10px]"/>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                            <FormField 
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white text-sm max-lg:text-xs">
                                            Rola
                                        </FormLabel>
                                        <Select 
                                            disabled={isPending}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-[var(--cardblack)] border-[var(--yellow)] 
                                                    text-white text-sm max-lg:text-xs">
                                                    <SelectValue placeholder="Wybierz role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[var(--cardblack)] border-[var(--yellow)] 
                                                text-white text-sm max-lg:text-xs">
                                                <SelectItem value={UserRole.ADMIN}>
                                                    Administrator
                                                </SelectItem>
                                                <SelectItem value={UserRole.USER}>
                                                    Użytkownik
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-xs max-lg:text-[10px]"/>
                                    </FormItem>
                                )}
                            />
                            {user?.isOAuth === false && (
                                <FormField 
                                    control={form.control}
                                    name="isTwoFactorEnabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg 
                                            border border-[var(--yellow)] p-3 max-lg:p-2 shadow-sm text-white">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-white text-sm max-lg:text-xs">
                                                    Weryfikacja dwuetapowa
                                                </FormLabel>
                                                <FormDescription className="text-xs max-lg:text-[10px]">
                                                    Włącz weryfikacje dwuetapową dla swojego konta
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    disabled={isPending}
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-[var(--yellow)]"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                        <FormError message={error} className="text-sm max-lg:text-xs"/>
                        <FormSuccess message={success} className="text-sm max-lg:text-xs"/>
                        <Button 
                            type="submit" 
                            disabled={isPending}
                            className="w-full bg-[var(--yellow)] hover:bg-[var(--darkeryellow)] text-black
                                font-semibold text-sm max-lg:text-xs"
                        >
                            Zapisz
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default SettingsPage;