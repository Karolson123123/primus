import Link from "next/link";
import Image from "next/image";

/**
 * Komponent logo aplikacji
 * Wyświetla logo i przekierowuje do strony głównej po kliknięciu
 */
export default function Logo() {
    return (
        <div className="flex justify-start items-start">
            <Link href={"/"} className="h-fit w-fit">
                <Image 
                    src={'Logo.svg'} 
                    alt="Logo aplikacji EVolve" 
                    width={64} 
                    height={64} 
                />
            </Link>
        </div>
    );
}