import { FaExclamationTriangle } from "react-icons/fa";

/**
 * Interfejs właściwości komponentu błędu formularza
 * @property message - Opcjonalna wiadomość błędu do wyświetlenia
 */
interface FormErrorProps {
    message?: string;
}

/**
 * Komponent wyświetlający komunikat błędu w formularzu
 * Renderuje czerwony alert z ikoną trójkąta i tekstem błędu
 */
export const FormError = ({
    message
}: FormErrorProps) => {
    // Jeśli brak wiadomości, nie renderuj niczego
    if (!message) return null;

    return (
        <div className="bg-destructive/15 p-3 flex items-center text-sm gap-4 text-destructive">
            <FaExclamationTriangle className="h-4 w-4" />
            <p>{message}</p>
        </div>
    );
};