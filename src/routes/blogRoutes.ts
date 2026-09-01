/**
 * Routes du module Blog & Actualités (Ndara Phase 25)
 * Ces constantes préparent l'intégration au routeur global sans le modifier directement.
 */
export class BlogRoutes {
  static get BlogListPath(): string {
    return '/blog';
  }

  static BlogPostPath(slug: string = ':slug'): string {
    return `/blog/${slug}`;
  }

  static get BlogAdminPath(): string {
    return '/admin/blog';
  }
}
