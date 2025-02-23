import { auth } from "@/auth";

export async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  
  if (!session?.user?.apiToken) {
    throw new Error("No authentication token available");
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
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}