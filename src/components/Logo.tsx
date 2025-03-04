import Link from "next/link";
import Image from "next/image";

export default function Logo() {
    return(
        <div className="flex justify-start items-start">
            <Link href={"/"} className="h-fit w-fit">
                <Image src={'Logo.svg'} alt="Logo EVolve" width={64} height={64} />
            </Link>
        </div>
    );
};
