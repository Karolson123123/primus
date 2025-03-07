'use client';

import dynamic from 'next/dynamic';

/**
 * Dynamiczne ładowanie komponentu mapy
 * Wyłączone renderowanie po stronie serwera (SSR)
 */
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <p>Ładowanie mapy...</p>
});

/**
 * Komponent mapy klienta
 * Wrapper dla komponentu Map z dynamicznym ładowaniem
 */
export default function ClientMap() {
  return <Map />;
}