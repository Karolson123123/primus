import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

interface ProtectedLayoutProps{
    children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    return (
        <div className="h-full w-full flex flex-col gap-y-10 items-center justify-center">
            <ThemeProvider>
            <Navbar />
            {children}
            <br />
            <br />
            <br />
            <br />
            <br />
            </ThemeProvider>
        </div>
    )
}

export default ProtectedLayout