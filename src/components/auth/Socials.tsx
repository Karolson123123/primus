"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

/**
 * Komponent przycisków logowania przez media społecznościowe
 * Umożliwia logowanie przez Google i GitHub
 */
export default function Socials() {
    /**
     * Obsługa logowania przez wybrany provider
     * @param provider - Nazwa dostawcy uwierzytelniania (google/github)
     */
    const onClick = (provider: "google" | "github") => {
        signIn(provider, {
            callbackUrl: DEFAULT_LOGIN_REDIRECT
        });
    };

    return (
        <div className="flex my-2 gap-1">
            <Button 
                className="px-6 py-3 flex-1" 
                onClick={() => onClick("google")}
                aria-label="Zaloguj się przez Google"
            >
                <FcGoogle className="w-5 h-5" />
            </Button>
            <Button 
                className="px-6 py-3 flex-1" 
                onClick={() => onClick("github")}
                aria-label="Zaloguj się przez GitHub"
            >
                <FaGithub className="w-5 h-5" />
            </Button>
        </div>
    );
}