"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";


export default function Socials() {
    const onClick = (provider: "google" | "github") => {
            signIn(provider,{
                callbackUrl: DEFAULT_LOGIN_REDIRECT
            })
        }
    return (
        <div className="flex my-2 gap-1">
        <Button className="px-6 py-3 flex-1" onClick={() => {onClick("google");}}>
            <FcGoogle className="w-5 h-5"></FcGoogle>
        </Button>
        <Button className="px-6 py-3 flex-1" onClick={() => {onClick("github");}}>
            <FaGithub className="w-5 h-5"></FaGithub>
        </Button>
    </div>
    );
};
