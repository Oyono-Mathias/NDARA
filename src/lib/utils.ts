/**
 * Utilitaires partagés pour l'application Ndara Afrique.
 * Privilégier les fonctions pures, sans dépendances externes lourdes.
 */

/**
 * Formate un montant en Franc CFA (XAF).
 * Garantit l'affichage propre d'un entier, conforme aux règles financières du projet.
 */
export function formatXAF(amount: number): string {
  if (isNaN(amount)) return '0 XAF';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0 // Le XAF ne prend pas de décimales
  }).format(Math.floor(amount));
}

/**
 * Formate une date ISO ou un Timestamp en chaîne lisible.
 */
export function formatDate(dateInput: Date | string | number): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Utilitaire basique de fusion de classes.
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
