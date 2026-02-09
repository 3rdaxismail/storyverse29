/**
 * SEOHead - Dynamic meta tags for SEO
 */
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object;
}

export default function SEOHead({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  noindex = false,
  structuredData
}: SEOHeadProps) {
  const fullTitle = title.includes('Storyverse') ? title : `${title} | Storyverse`;
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://storyverse.co.in';
  const fullCanonical = canonical || window.location.href;
  const defaultImage = `${baseUrl}/pwa-512x512.png`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:site_name" content="Storyverse" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
