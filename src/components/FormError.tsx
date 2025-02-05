import { FaExclamationTriangle } from "react-icons/fa";

interface FormErrorProps {
    message?: string
}

export const FormError = ({message}: FormErrorProps) => {
    if (!message) return null;

    return (
        <div className="bg-destructive/15 p-3 flex items-center text-sm gap-4 text-destructive">
            <FaExclamationTriangle className="h-4 w-4" />
            <p>{message}</p>
        </div>
    )
}