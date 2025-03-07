import { auth } from "@/auth";

/**
 * Wykonuje uwierzytelnione żądanie do API
 * @param endpoint - Ścieżka końcowa API
 * @param options - Opcje żądania fetch
 * @returns Odpowiedź z API w formacie JSON
 * @throws Error gdy brak tokenu uwierzytelniającego lub błąd API
 */
export async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  
  if (!session?.user?.apiToken) {
    throw new Error("Brak dostępnego tokenu uwierzytelniającego");
  }

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`;
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.user.apiToken}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`Błąd żądania API: ${response.statusText}`);
  }

  return response.json();
}