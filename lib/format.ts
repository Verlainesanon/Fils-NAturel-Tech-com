// Formatage partagé vitrine + admin. Les prix vivent en centimes (entiers) et
// ne sont convertis en flottant qu'au moment de l'affichage.

export function formaterPrix(centimes: number, symbole = '€'): string {
  const valeur = (centimes / 100).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${valeur} ${symbole}`
}

export function formaterDate(valeur: Date | string | null | undefined): string {
  if (!valeur) return '—'
  const d = typeof valeur === 'string' ? new Date(valeur) : valeur
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formaterDateHeure(valeur: Date | string | null | undefined): string {
  if (!valeur) return '—'
  const d = typeof valeur === 'string' ? new Date(valeur) : valeur
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Prix effectif d'un produit : promo si elle est active à la date donnée. */
export function prixEffectif(
  produit: {
    prixCentimes: number
    promoCentimes: number | null
    promoDebut: Date | null
    promoFin: Date | null
  },
  maintenant = new Date()
): { centimes: number; enPromo: boolean } {
  const p = produit.promoCentimes
  if (p == null || p >= produit.prixCentimes) return { centimes: produit.prixCentimes, enPromo: false }
  if (produit.promoDebut && maintenant < produit.promoDebut) {
    return { centimes: produit.prixCentimes, enPromo: false }
  }
  if (produit.promoFin && maintenant > produit.promoFin) {
    return { centimes: produit.prixCentimes, enPromo: false }
  }
  return { centimes: p, enPromo: true }
}

export function parserJson<T>(valeur: string | null | undefined, defaut: T): T {
  if (!valeur) return defaut
  try {
    return JSON.parse(valeur) as T
  } catch {
    return defaut
  }
}
