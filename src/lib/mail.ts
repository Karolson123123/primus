import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Wysyła email z kodem do weryfikacji dwuetapowej
 * @param email - Adres email odbiorcy
 * @param token - Kod weryfikacyjny
 */
export const sendTwoFactorTokenEmail = async (
    email: string,
    token: string
) => {
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Kod weryfikacji dwuetapowej",
        html: `<p>Twój kod do weryfikacji dwuetapowej: ${token}</p>`
    });
};

/**
 * Wysyła email z linkiem do resetowania hasła
 * @param email - Adres email odbiorcy
 * @param token - Token resetowania hasła
 */
export const sendPasswordResetEmail = async (
    email: string,
    token: string
) => {
    const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Zresetuj swoje hasło",
        html: `<p>Wciśnij <a href="${resetLink}">tutaj</a>, aby zresetować swoje hasło.</p>`
    });
};

/**
 * Wysyła email z linkiem do weryfikacji adresu email
 * @param email - Adres email odbiorcy
 * @param token - Token weryfikacyjny
 */
export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Potwierdź swój email",
        html: `<p>Wciśnij <a href="${confirmLink}">tutaj</a>, aby potwierdzić swój email.</p>`
    });
};