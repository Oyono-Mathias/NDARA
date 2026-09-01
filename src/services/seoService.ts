export interface SeoConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  robots: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType: string;
  ogLocale: string;
  siteName: string;
  twitterCard: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export const defaultSeoConfig: SeoConfig = {
  title: 'Ndara - Plateforme e-learning',
  description: 'Ndara est une plateforme e-learning innovante.',
  robots: 'index, follow',
  ogType: 'website',
  ogLocale: 'fr_FR',
  siteName: 'Ndara',
  twitterCard: 'summary_large_image',
};

export class SeoService {
  /**
   * Normalise une URL (enlève les doubles slashes indésirables, etc.)
   */
  static normalizeUrl(url?: string): string | undefined {
    if (!url || typeof url !== 'string' || url.trim() === '') return undefined;
    try {
      // Si c'est une URL absolue, on la valide via l'objet URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return new URL(url).toString();
      }
      // Pour les URLs relatives, on s'assure d'une syntaxe propre
      const cleanUrl = url.replace(/([^:]\/)\/+/g, '$1').trim();
      return cleanUrl;
    } catch (e) {
      // En cas d'URL invalide, on retourne undefined pour ne pas casser les balises
      return undefined;
    }
  }

  /**
   * Construit et fusionne les métadonnées SEO avec les valeurs par défaut.
   */
  static buildSeoMetadata(config: Partial<SeoConfig>): SeoConfig {
    const mergedConfig = { ...defaultSeoConfig, ...config };
    
    // Normalisation des URLs
    mergedConfig.canonicalUrl = this.normalizeUrl(mergedConfig.canonicalUrl);
    mergedConfig.ogUrl = this.normalizeUrl(mergedConfig.ogUrl) || mergedConfig.canonicalUrl;
    mergedConfig.ogImage = this.normalizeUrl(mergedConfig.ogImage);
    mergedConfig.twitterImage = this.normalizeUrl(mergedConfig.twitterImage) || mergedConfig.ogImage;

    // Fallbacks logiques
    mergedConfig.ogTitle = mergedConfig.ogTitle || mergedConfig.title;
    mergedConfig.ogDescription = mergedConfig.ogDescription || mergedConfig.description;
    mergedConfig.twitterTitle = mergedConfig.twitterTitle || mergedConfig.ogTitle;
    mergedConfig.twitterDescription = mergedConfig.twitterDescription || mergedConfig.ogDescription;

    return mergedConfig;
  }
}
