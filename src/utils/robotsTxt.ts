export interface RobotsConfig {
  sitemapUrl?: string;
  allowAll?: boolean;
  disallow?: string[];
  additionalRules?: string[];
}

/**
 * Génère le contenu dynamique du fichier robots.txt.
 * ATTENTION: Ces règles sont uniquement des directives pour les moteurs de recherche.
 * Elles ne constituent JAMAIS une protection de sécurité (Zero Trust).
 */
export const generateRobotsTxt = (config: RobotsConfig = {}): string => {
  const {
    sitemapUrl,
    allowAll = true,
    disallow = [],
    additionalRules = []
  } = config;

  const lines: string[] = [];

  // User-agent global
  lines.push('User-agent: *');

  // Règle d'autorisation
  if (allowAll) {
    lines.push('Allow: /');
  }

  // Chemins interdits à l'indexation
  if (disallow && disallow.length > 0) {
    disallow.forEach(path => {
      // Nettoyage des sauts de ligne pour prévenir les injections de directives
      const cleanPath = path.replace(/[\r\n]/g, '').trim();
      if (cleanPath) {
        lines.push(`Disallow: ${cleanPath}`);
      }
    });
  }

  // Règles additionnelles
  if (additionalRules && additionalRules.length > 0) {
    additionalRules.forEach(rule => {
      const cleanRule = rule.replace(/[\r\n]/g, '').trim();
      if (cleanRule) {
        lines.push(cleanRule);
      }
    });
  }

  // Lien vers le Sitemap
  if (sitemapUrl) {
    const cleanSitemapUrl = sitemapUrl.replace(/[\r\n]/g, '').trim();
    if (cleanSitemapUrl) {
      lines.push('');
      lines.push(`Sitemap: ${cleanSitemapUrl}`);
    }
  }

  return lines.join('\n');
};
