"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface NavButtonPhoneProps {
    href: string;
    src: string;
}

const NavButtonPhone = ({ href, src }: NavButtonPhoneProps) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push(href);
    };

    return (
        <button 
            onClick={handleClick}
            className="flex items-center justify-center p-3 rounded-lg 
                hover:bg-[var(--background)] transition-colors relative z-[10000000]
                active:scale-95 transform duration-150"
        >
            <Image
                src={src}
                alt="Navigation Icon"
                width={32}
                height={32}
                className="w-10 h-10 invert"
                priority
            />
        </button>
    );
};

export default NavButtonPhone;
