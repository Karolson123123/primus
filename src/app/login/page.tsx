
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";


export default function Login() {

    return (
        <div className="grid place-items-center bg-[var(--black)] h-screen">
            <main className="p-8 bg-[var(--cardblack)]  rounded-lg  w-[50%] h-[50%] flex flex-col justify-around" >
                <h1 className="text-center font-semibold text-3xl ">Logowanie</h1>
                <LoginForm></LoginForm>
                <Link href={"/register"} className="text-center">Nie masz jeszcze konta? <b>Zarejestruj się</b></Link>
            </main>
        </div>
    )
};
