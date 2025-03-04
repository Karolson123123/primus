import Link from "next/link";

export default function NavButton({ text, href }:{ text: string, href: string }) {
    return (
        <Link className="flex justify-center items-center w-60 h-20  text-[--white] text-center transition-transform hover:text-[var(--yellow)] hover:bg-[rgba(60,_60,_60,_0.2)] font-semibold text-xl" href={ href }>
            {text}
        </Link>
    )
};
