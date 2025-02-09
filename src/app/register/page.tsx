
import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import Logo from "@/components/Logo";


export default function Login() {

    return (
        <>
            <Logo></Logo>
            <div className="grid place-items-center bg-[var(--black)] h-screen">
                <main className="p-8 bg-[var(--cardblack)]  rounded-lg  w-[50%] h-[50%] flex flex-col justify-around" >
                    <h1 className="text-center font-semibold text-3xl ">Rejestracja</h1>
                    <RegisterForm></RegisterForm>
                    <Link href={"/login"} className="text-center">Masz już konto? <b>Zaloguj się</b></Link>
                </main>
            </div>
        </>
    )
};
