import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Łączy klasy CSS z różnych źródeł i rozwiązuje konflikty
 * @param inputs - Lista klas CSS do połączenia
 * @returns Połączone i zoptymalizowane klasy CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}