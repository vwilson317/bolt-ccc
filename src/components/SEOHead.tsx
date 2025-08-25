import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
  locale?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  keywords?: string;
  author?: string;
}

const SEOHead: React.FC<SEOProps> = ({
  title = 'Carioca Coastal Club - Beach Vendor Discovery',
  description = 'Discover the best beach vendors (barracas) in Rio de Janeiro. Real-time weather, status updates, and more.',
  image = '/logo_320x320.png',
  url,
  type = 'website',
  siteName = 'Carioca Coastal Club',
  locale = 'en_US',
  twitterCard = 'summary_large_image',
  keywords = 'beach barracas, Rio de Janeiro, beach vendors, Copacabana, Ipanema, beach food, beach drinks, beach culture, Carioca',
  author = 'Carioca Coastal Club',
}) => {
  // Construct full URL if relative image path is provided
  const fullImageUrl = image?.startsWith('http') 
    ? image 
    : `${window.location.origin}${image}`;

  // Construct full page URL if not provided
  const fullUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Viewport and Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta name="theme-color" content="#f97316" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* WhatsApp specific tags */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:type" content="image/png" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Additional Meta Tags for better social sharing */}
      <meta property="fb:app_id" content="" /> {/* Add your Facebook App ID if you have one */}
      <meta name="twitter:site" content="" /> {/* Add your Twitter handle if you have one */}
      <meta name="twitter:creator" content="" /> {/* Add your Twitter handle if you have one */}
      
      {/* LinkedIn specific tags */}
      <meta property="og:image:secure_url" content={fullImageUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Additional sharing optimization */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Structured Data for better SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? "Article" : "WebSite",
          "name": title,
          "description": description,
          "url": fullUrl,
          "image": fullImageUrl,
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/logo_320x320.png`
            }
          },
          "author": {
            "@type": "Organization",
            "name": author
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;