import Link from "next/link";

/**
 * Interfejs właściwości przycisku nawigacji
 * @property text - Tekst wyświetlany na przycisku
 * @property href - Adres URL do którego kieruje przycisk
 */
interface NavButtonProps {
    text: string;
    href: string;
}

/**
 * Komponent przycisku nawigacji
 * Wyświetla klikalny link w formie przycisku z efektem hover
 */
export default function NavButton({ text, href }: NavButtonProps) {
    return (
        <Link 
            className="flex justify-center items-center w-60 h-20 
                text-[--text-color] text-center font-semibold text-xl
                transition-transform hover:text-[var(--yellow)] 
                hover:bg-[rgba(60,_60,_60,_0.2)]" 
            href={href}
        >
            {text}
        </Link>
    );
}