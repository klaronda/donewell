import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  noindex?: boolean;
}

export function SEO({
  title = 'DoneWell – Web and App Builds, DoneWell',
  description = 'We turn your vision into professional websites and apps that your customers will love — without the tech headaches. Average 14-day delivery.',
  image = 'https://udiskjjuszutgpvkogzw.supabase.co/storage/v1/object/public/site-assets/Homepage/OG.png',
  url = 'https://donewellco.com',
  type = 'website',
  keywords = 'website design, web development, custom websites, business websites, donewell, web design agency',
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    const currentPath = window.location.pathname;
    const fullUrl = `${url}${currentPath === '/' ? '' : currentPath}`;
    const fullTitle = title.includes('DoneWell') ? title : `${title} | DoneWell`;
    // Use title as-is for OG/Twitter, but default to OG-specific title if using default browser title
    // This ensures OG titles stay as "Your idea. Built right. Delivered fast." when no title prop is provided
    const ogTitle = title === 'DoneWell – Web and App Builds, DoneWell' 
      ? 'Your idea. Built right. Delivered fast.' 
      : title;

    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('title', fullTitle);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph meta tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', ogTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:site_name', 'DoneWell', true);

    // Twitter meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:domain', 'donewellco.com', true);
    updateMetaTag('twitter:url', fullUrl, true);
    updateMetaTag('twitter:title', ogTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
  }, [title, description, image, url, type, keywords, noindex]);

  return null;
}




