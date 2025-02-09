import ResetForm from "@/components/auth/ResetForm";
import Logo from "@/components/Logo";
import Link from "next/link";


export default function ResetPage() {
    
    
    
    return (
        <>
            <Logo></Logo>
            <div className="grid place-items-center bg-[var(--black)] h-screen">
                <main className="p-8 bg-[var(--cardblack)]  rounded-lg  w-[50%] h-[30%] flex flex-col justify-around" >
                    <h1 className="text-center font-semibold text-3xl ">Zapomniałeś hasła?</h1>
                    <ResetForm/>
                    <Link href={"/login"} className="text-center">Powrót do logowania</Link>
                </main>
            </div>
        </>
    );
};
