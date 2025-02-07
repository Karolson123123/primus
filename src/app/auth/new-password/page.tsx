import NewPasswordForm from "@/components/auth/NewPasswordForm";
import Link from "next/link";

const NewPasswordPage = () =>{
    return(
        <div className="grid place-items-center bg-[var(--black)] h-screen">
            <main className="p-8 bg-[var(--cardblack)]  rounded-lg  w-[50%] h-[50%] flex flex-col justify-around" >
                <h1 className="text-center font-semibold text-3xl ">Wprowadź nowe hasło</h1>
                <NewPasswordForm/>
                <Link href={"/login"} className="text-center">Powrót do logowania</Link>
            </main>
        </div>
    );
}

export default NewPasswordPage;