import NewVerificationForm from "@/components/auth/NewVerificationForm";
import Logo from "@/components/Logo";

const NewVerificationPage = () =>{
    return(
        <>
            <Logo></Logo>
            <div className="grid place-items-center bg-[var(--black)] h-screen">
                        <main className="p-8 bg-[var(--cardblack)] rounded-lg w-[50%] h-[50%] flex flex-col justify-around items-center" >
                            <NewVerificationForm />                
                        </main>
            </div>
        </>
    );
}

export default NewVerificationPage;