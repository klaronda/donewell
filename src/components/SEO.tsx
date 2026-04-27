import { useEffect, useState } from 'react';
import { canonicalUrlForPath } from '../utils/canonical';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  /** Unused; canonical is derived from hostname + path (see canonical.ts). */
  url?: string;
  type?: string;
  keywords?: string;
  noindex?: boolean;
}

export function SEO({
  title = 'DoneWell – Web and App Builds, DoneWell',
  description = 'We turn your vision into professional websites and apps that your customers will love – without the tech headaches. Average 14-day delivery.',
  image = 'https://udiskjjuszutgpvkogzw.supabase.co/storage/v1/object/public/site-assets/Homepage/OG.png',
  url: _url,
  type = 'website',
  keywords = 'website design, web development, custom websites, business websites, donewell, web design agency',
  noindex = false,
}: SEOProps) {
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  );

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);

    window.addEventListener('popstate', syncPath);
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      syncPath();
    };

    return () => {
      window.removeEventListener('popstate', syncPath);
      window.history.pushState = originalPushState;
    };
  }, []);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'donewellco.com';
    const fullUrl = canonicalUrlForPath(host, pathname);
    const fullTitle = title.includes('DoneWell') ? title : `${title} | DoneWell`;
    const ogTitle =
      title === 'DoneWell – Web and App Builds, DoneWell'
        ? 'Your idea. Built right. Delivered fast.'
        : title;

    document.title = fullTitle;

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

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('title', fullTitle);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', ogTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:site_name', 'DoneWell', true);

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:domain', 'donewellco.com', true);
    updateMetaTag('twitter:url', fullUrl, true);
    updateMetaTag('twitter:title', ogTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
  }, [title, description, image, type, keywords, noindex, pathname]);

  return null;
}
