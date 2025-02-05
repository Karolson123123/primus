import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email jest wymagany"
    }),
    password: z.string().min(1, {
        message: "Hasło jest wymagane"
    })
});



export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Email jest wymagany"
    }),
    password: z.string().min(6, {
        message: "Hasło musie mieć co najmniej 6 znaków"
    }),
    name: z.string().min(1, {
        message: "Nazwa użytkownika jest wymagana"
    })
});

