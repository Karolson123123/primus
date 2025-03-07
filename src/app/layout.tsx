import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "sonner";
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: "EVolve",
  description: "Ładowanie samochodów elektrycznych"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="pl">
        <body className={`antialiased`}>
          <ThemeProvider>
            <Toaster 
              theme="dark" 
              position="top-right"
              expand={false}
              richColors
              closeButton
              toastOptions={{
                style: {
                  backgroundColor: "var(--yellow)",
                },
                actionButtonStyle: {
                  backgroundColor: "var(--cardblack)",
                  color: "white",
                },
                descriptionStyle: {
                  color: "var(--cardblack)",
                },
              }}
            />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
