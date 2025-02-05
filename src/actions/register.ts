"use server";
import * as z from "zod";
import { RegisterSchema } from "@/schema";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success){
        return { error: "Nieprawidłowe wartości!"}
    }

    const { email, password, name } = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return { error: "Email jest zajęty!"}
    }
    
    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    return { success: "Utworzyłeś konto!"}
}

