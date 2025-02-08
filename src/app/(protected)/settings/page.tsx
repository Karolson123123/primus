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
        <Card className="bg-[var(--cardblack)] w-[90%]">
            <CardHeader>
                <p className="text-2xl font-semibold text-center text-white">
                    Ustawienia
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form 
                        className="space-y-6" 
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <div className="flex flex-col gap-5 ">
                            <FormField 
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="text-white">
                                        <FormLabel className="text-white">Nazwa użytkownika</FormLabel>
                                        <FormControl>
                                            <Input
                                            {...field} 
                                            placeholder="mati usiek"
                                            disabled={isPending}
                                            type="text"
                                            />
                                        </FormControl>
                                        <FormMessage/>
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
                                                <FormLabel className="text-white">Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                    {...field} 
                                                    placeholder="primus@gmail.com"
                                                    disabled={isPending}
                                                    type="email"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField 
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="text-white">
                                                <FormLabel className="text-white">Hasło</FormLabel>
                                                <FormControl>
                                                    <Input
                                                    {...field} 
                                                    placeholder="******"
                                                    disabled={isPending}
                                                    type="password"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField 
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem className="text-white">
                                                <FormLabel className="text-white">Nowe hasło</FormLabel>
                                                <FormControl>
                                                    <Input
                                                    {...field} 
                                                    placeholder="******"
                                                    disabled={isPending}
                                                    type="password"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
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
                                        <FormLabel className="text-white">Rola</FormLabel>
                                        <Select 
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        >
                                            <FormControl className="text-white" >
                                                <SelectTrigger>
                                                   <SelectValue placeholder="Wybierz role" >
                                                    </SelectValue> 
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[var(--cardblack)] text-white">
                                                <SelectItem value={UserRole.ADMIN}>
                                                    Administrator
                                                </SelectItem>
                                                <SelectItem value={UserRole.USER}>
                                                    Użytkownik
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            {user?.isOAuth === false && (
                            <FormField 
                                control={form.control}
                                name="isTwoFactorEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm  text-white">
                                        <div className="space-y-0.5">
                                        <FormLabel className="text-white">Weryfikacja dwuetapowa</FormLabel>
                                        <FormDescription>Włącz weryfikacje dwuetapową dla swojego konta</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                disabled={isPending}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            )}
                        </div>
                        <FormError message={error}></FormError>
                        <FormSuccess message={success}></FormSuccess>
                        <Button type="submit" disabled={isPending}>Zapisz</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default SettingsPage;