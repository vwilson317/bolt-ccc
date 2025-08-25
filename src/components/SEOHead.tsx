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
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Additional Meta Tags for better social sharing */}
      <meta property="fb:app_id" content="" /> {/* Add your Facebook App ID if you have one */}
      <meta name="twitter:site" content="" /> {/* Add your Twitter handle if you have one */}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEOHead;