import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  noindex = false,
}: SEOHeadProps) {
  const location = useLocation();

  useEffect(() => {
    if (title) {
      document.title = title;
    }

    updateMetaTag('name', 'description', description);
    updateMetaTag('property', 'og:title', ogTitle || title);
    updateMetaTag('property', 'og:description', ogDescription || description);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', canonicalUrl || `https://easyrentcars.rentals${location.pathname}`);

    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage);
    }

    updateMetaTag('name', 'twitter:title', ogTitle || title);
    updateMetaTag('name', 'twitter:description', ogDescription || description);

    if (ogImage) {
      updateMetaTag('name', 'twitter:image', ogImage);
    }

    if (noindex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      updateMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    updateCanonicalLink(canonicalUrl || `https://easyrentcars.rentals${location.pathname}`);

    const htmlElement = document.documentElement;
    const currentLang = htmlElement.getAttribute('lang') || 'en';
    if (currentLang) {
      htmlElement.setAttribute('lang', currentLang);
    }
  }, [title, description, ogTitle, ogDescription, ogImage, ogType, canonicalUrl, noindex, location.pathname]);

  return null;
}

function updateMetaTag(attribute: string, key: string, content?: string) {
  if (!content) return;

  let element = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', url);
}
