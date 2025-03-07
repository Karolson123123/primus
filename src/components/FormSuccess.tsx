import { FaCheckCircle } from "react-icons/fa";

/**
 * Interfejs właściwości komponentu sukcesu formularza
 * @property message - Opcjonalna wiadomość sukcesu do wyświetlenia
 */
interface FormSuccessProps {
    message?: string;
}

/**
 * Komponent wyświetlający komunikat sukcesu w formularzu
 * Renderuje zielony alert z ikoną potwierdzenia i tekstem sukcesu
 */
export const FormSuccess = ({
    message
}: FormSuccessProps) => {
    // Jeśli brak wiadomości, nie renderuj niczego
    if (!message) return null;

    return (
        <div className="bg-emerald-500/15 p-3 flex items-center gap-4 text-sm text-emerald-500">
            <FaCheckCircle className="h-4 w-4" />
            <p>{message}</p>
        </div>
    );
};