
import Link from "next/link";

export default function ErrorCard() {
    return(
        <>
            <h1 className="text-center font-semibold text-3xl">Ups! Coś poszło nie tak</h1>
            <Link href="/login"  >Powrót do logowania</Link>
            
        </>
    );
};