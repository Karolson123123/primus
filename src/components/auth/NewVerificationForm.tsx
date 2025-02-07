"use client";

import Link from "next/link";
import { PacmanLoader } from "react-spinners"
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/new-verification";
import { FormError } from "@/components/FormError";
import { FormSuccess } from "@/components/FormSuccess";


export default function NewVerificationForm() {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if ( success || error) return;

        if (!token) {
            setError("Brak tokenu!")
            return;
        };

        newVerification(token).then((data) => {
            setSuccess(data.success);
            setError(data.error);

        })
        .catch(() => {
            setError("Coś poszło nie tak!");
        })
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);
    return(
        <>
            <h1 className="text-center font-semibold text-3xl">Potwierdzanie twojego adresu email</h1>
            <div className="flex justify-center items-center w-full flex-col gap-10">
                {!success && !error &&(
                <PacmanLoader color="var(--yellow)" />
            )}
                <FormSuccess message={success}></FormSuccess>
                <FormError message={error}></FormError>
            </div>
            <Link href="/login">Powrót do logowania</Link>

            
        </>
    )
    
};
