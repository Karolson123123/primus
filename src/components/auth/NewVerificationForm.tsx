"use client";

import Link from "next/link";
import { PacmanLoader } from "react-spinners"
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/new-verification";
import { FormError } from "@/components/FormError";
import { FormSuccess } from "@/components/FormSuccess";
import Logo from "../Logo";

/**
 * Komponent formularza weryfikacji adresu email
 * Automatycznie weryfikuje token i wyświetla status procesu
 */
export default function NewVerificationForm() {
    // Stan komponentu
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    // Pobieranie tokenu z parametrów URL
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    /**
     * Obsługa weryfikacji tokenu
     * Przeprowadza proces weryfikacji i aktualizuje stan komponentu
     */
    const onSubmit = useCallback(() => {
        if (success || error) return;

        if (!token) {
            setError("Brak tokenu weryfikacyjnego!");
            return;
        }

        newVerification(token)
            .then((data) => {
                setSuccess(data.success);
                setError(data.error);
            })
            .catch(() => {
                setError("Wystąpił błąd podczas weryfikacji!");
            });
    }, [token, success, error]);

    // Automatyczne uruchomienie weryfikacji przy montowaniu komponentu
    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className="flex flex-col items-center gap-6">
            <Logo />
            <h1 className="text-center font-semibold text-3xl">
                Weryfikacja adresu email
            </h1>
            <div className="flex justify-center items-center w-full flex-col gap-10">
                {!success && !error && (
                    <PacmanLoader color="var(--yellow)" />
                )}
                <FormSuccess message={success}></FormSuccess>
                <FormError message={error}></FormError>
            </div>
            <Link href="/login">Powrót do logowania</Link>
        </div>
    );
}
