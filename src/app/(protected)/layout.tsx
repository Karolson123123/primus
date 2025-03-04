import { Navbar } from "@/components/Navbar";

interface ProtectedLayoutProps{
    children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    return (
        <div className="h-full w-full flex flex-col gap-y-10 items-center justify-center">
            <Navbar />
            {children}
            <br />
            <br />
            <br />
            <br />
            <br />
        </div>
    )
}

export default ProtectedLayout