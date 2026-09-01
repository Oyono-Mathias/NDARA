export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  url: string;
  lastModified?: string; // Format ISO 8601 (YYYY-MM-DD)
  changeFrequency?: ChangeFrequency;
  priority?: number; // De 0.0 à 1.0
}

/**
 * Échappe les caractères spéciaux pour le XML afin d'éviter les injections XSS
 * et de garantir la stricte validité du document sitemap.xml.
 */
export const escapeXml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Génère le contenu XML complet d'un sitemap à partir d'une liste d'entrées.
 */
export const generateSitemap = (entries: SitemapEntry[]): string => {
  if (!entries || entries.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
  }

  const urlsXml = entries
    .filter(entry => entry.url && entry.url.trim() !== '') // Évite les URLs vides et cassées
    .map(entry => {
      const url = escapeXml(entry.url.trim());
      
      let xml = `  <url>\n    <loc>${url}</loc>\n`;
      
      if (entry.lastModified) {
        xml += `    <lastmod>${escapeXml(entry.lastModified)}</lastmod>\n`;
      }
      if (entry.changeFrequency) {
        xml += `    <changefreq>${escapeXml(entry.changeFrequency)}</changefreq>\n`;
      }
      if (entry.priority !== undefined && entry.priority >= 0 && entry.priority <= 1) {
        xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      }
      
      xml += `  </url>`;
      return xml;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>`;
};
