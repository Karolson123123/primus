import Link from "next/link";

/**
 * Komponent karty błędu
 * Wyświetla komunikat o błędzie i link powrotu do strony logowania
 */
export default function ErrorCard() {
    return(
        <div className="flex flex-col items-center gap-6">
            <h1 className="text-center font-semibold text-3xl">
                Ups! Coś poszło nie tak
            </h1>
            <Link 
                href="/login" 
                className="text-[var(--yellow)] hover:text-[var(--darkeryellow)] transition-colors"
            >
                Powrót do logowania
            </Link>
        </div>
    );
}