import ErrorCard from "@/components/auth/ErrorCard";
import Logo from "@/components/Logo";

/**
 * Strona błędu autoryzacji
 * Wyświetla informacje o błędzie logowania wraz z opcjami nawigacji
 */
const AuthErrorPage = () => {
    return (
        <>  
            {/* Logo w lewym górnym rogu */}
            <div className="absolute top-4 left-4 z-10">
                <Logo />
            </div>

            {/* Kontener główny z kartą błędu */}
            <div className="grid place-items-center bg-[var(--black)] min-h-screen p-4">
                <main 
                    className="p-4 md:p-8 bg-[var(--cardblack)] rounded-lg 
                        w-[95%] md:w-[70%] lg:w-[50%] 
                        min-h-[400px] md:min-h-[450px] 
                        flex flex-col justify-around items-center"
                >
                    <ErrorCard />                
                </main>
            </div>
        </>
    )
}

export default AuthErrorPage;