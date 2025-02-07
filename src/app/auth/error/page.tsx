import ErrorCard from "@/components/auth/ErrorCard";

const AuthErrorPage = () => {
    return (
        <div className="grid place-items-center bg-[var(--black)] h-screen">
            <main className="p-8 bg-[var(--cardblack)] rounded-lg w-[50%] h-[50%] flex flex-col justify-around items-center" >
                <ErrorCard />                
            </main>
        </div>
    )
}

export default AuthErrorPage;