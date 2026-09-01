import React, { useEffect } from 'react';
import { SeoConfig, SeoService } from '../../services/seoService';

interface SeoHeadProps {
  config?: Partial<SeoConfig>;
}

/**
 * Composant de gestion des balises SEO dans le <head>.
 * ZERO TRUST: Le SEO est uniquement informatif, il ne constitue en rien 
 * un mécanisme de protection de données ou d'authentification.
 */
export const SeoHead: React.FC<SeoHeadProps> = ({ config = {} }) => {
  useEffect(() => {
    const seoData = SeoService.buildSeoMetadata(config);

    // Titre global du document
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Fonction utilitaire pour mettre à jour ou créer des balises <meta>
    const setMetaTag = (attributeName: string, attributeValue: string, content?: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (content) {
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attributeName, attributeValue);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      } else if (element) {
        element.remove();
      }
    };

    // Fonction utilitaire pour mettre à jour ou créer des balises <link>
    const setLinkTag = (rel: string, href?: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (href) {
        if (!element) {
          element = document.createElement('link');
          element.setAttribute('rel', rel);
          document.head.appendChild(element);
        }
        element.setAttribute('href', href);
      } else if (element) {
        element.remove();
      }
    };

    // Balises de Base
    setMetaTag('name', 'description', seoData.description);
    setMetaTag('name', 'robots', seoData.robots);

    // Open Graph (Réseaux sociaux)
    setMetaTag('property', 'og:title', seoData.ogTitle);
    setMetaTag('property', 'og:description', seoData.ogDescription);
    setMetaTag('property', 'og:type', seoData.ogType);
    setMetaTag('property', 'og:locale', seoData.ogLocale);
    setMetaTag('property', 'og:site_name', seoData.siteName);
    
    if (seoData.ogUrl) setMetaTag('property', 'og:url', seoData.ogUrl);
    if (seoData.ogImage) setMetaTag('property', 'og:image', seoData.ogImage);
    if (seoData.ogImageAlt) setMetaTag('property', 'og:image:alt', seoData.ogImageAlt);

    // Twitter Cards
    setMetaTag('name', 'twitter:card', seoData.twitterCard);
    setMetaTag('name', 'twitter:title', seoData.twitterTitle);
    setMetaTag('name', 'twitter:description', seoData.twitterDescription);
    if (seoData.twitterImage) setMetaTag('name', 'twitter:image', seoData.twitterImage);

    // Canonical URL
    setLinkTag('canonical', seoData.canonicalUrl);

  }, [config]);

  // Ce composant manipule le DOM directement (head) et ne retourne aucune UI
  return null;
};
