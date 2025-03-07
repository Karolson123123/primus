import NewVerificationForm from "@/components/auth/NewVerificationForm";
import Logo from "@/components/Logo";

/**
 * Strona weryfikacji nowego konta
 * Wyświetla formularz weryfikacyjny dla nowych użytkowników
 */
const NewVerificationPage = () => {
    return (
        <>
            {/* Logo w lewym górnym rogu */}
            <div className="absolute top-4 left-4 z-10">
                <Logo />
            </div>

            {/* Główny kontener z formularzem weryfikacji */}
            <div className="grid place-items-center bg-[var(--black)] min-h-screen p-4">
                <main className="p-4 md:p-8 bg-[var(--cardblack)] rounded-lg 
                    w-[95%] md:w-[70%] lg:w-[50%] 
                    min-h-[400px] md:min-h-[450px] 
                    flex flex-col justify-around items-center"
                >
                    <h1 className="text-center font-semibold text-2xl md:text-3xl mt-4">
                        Weryfikacja konta
                    </h1>
                    <NewVerificationForm />                
                </main>
            </div>
        </>
    );
}

export default NewVerificationPage;