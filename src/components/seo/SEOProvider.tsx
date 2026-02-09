/**
 * SEOProvider - Provides React Helmet context for the app
 */
import { HelmetProvider } from 'react-helmet-async';
import type { ReactNode } from 'react';

interface SEOProviderProps {
  children: ReactNode;
}

export default function SEOProvider({ children }: SEOProviderProps) {
  return <HelmetProvider>{children}</HelmetProvider>;
}
