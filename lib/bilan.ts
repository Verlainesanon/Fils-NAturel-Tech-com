/**
 * Calculs d'achat, de vente et de marge, isolés de la base pour être
 * vérifiables directement par les tests.
 *
 * Tous les montants sont en centimes de la devise de base.
 */

export type ModeAchat = 'unite' | 'lot'

export type Achat = {
  mode: ModeAchat
  /** Nombre d'unités si mode « unite », nombre de lots si mode « lot ». */
  nombre: number
  /** Unités contenues dans un lot ; ignoré en mode « unite ». */
  quantiteParLot: number
  /** Ce qui a été payé en tout, ou par unité / par lot selon `prixPour`. */
  prix: number
  /** Le prix saisi porte-t-il sur le total, ou sur une unité / un lot ? */
  prixPour: 'total' | 'piece'
}

export type ResultatAchat =
  | { quantite: number; prixTotalCentimes: number; coutUnitaireCentimes: number }
  | { erreur: string }

/**
 * Traduit une saisie d'achat en quantité entrée et coût unitaire.
 * Acheter 10 cartons de 12 à 6 000 la boîte, c'est 120 unités à 500 pièce.
 */
export function resoudreAchat(achat: Achat): ResultatAchat {
  const { mode, nombre, quantiteParLot, prix, prixPour } = achat

  if (!Number.isFinite(nombre) || nombre <= 0) return { erreur: 'Indiquez une quantité supérieure à zéro.' }
  if (!Number.isFinite(prix) || prix <= 0) return { erreur: 'Indiquez le prix payé.' }
  if (mode === 'lot' && (!Number.isFinite(quantiteParLot) || quantiteParLot <= 0)) {
    return { erreur: 'Indiquez combien d’unités contient un lot.' }
  }

  const quantite = mode === 'lot' ? nombre * quantiteParLot : nombre
  const prixTotalCentimes = prixPour === 'total' ? prix : prix * nombre
  if (!Number.isInteger(quantite) || quantite <= 0) return { erreur: 'Quantité illisible.' }

  return {
    quantite,
    prixTotalCentimes: Math.round(prixTotalCentimes),
    coutUnitaireCentimes: Math.round(prixTotalCentimes / quantite),
  }
}

/**
 * Coût unitaire après un nouvel achat : moyenne pondérée du stock déjà là et
 * de ce qui entre. Sans stock antérieur, c'est simplement le nouveau coût.
 */
export function coutMoyenPondere(
  stockActuel: number,
  coutActuelCentimes: number,
  quantiteEntree: number,
  coutEntreeCentimes: number,
): number {
  const stock = Math.max(0, stockActuel)
  if (stock === 0 || coutActuelCentimes <= 0) return Math.round(coutEntreeCentimes)
  const total = stock * coutActuelCentimes + quantiteEntree * coutEntreeCentimes
  return Math.round(total / (stock + quantiteEntree))
}

export type LigneVendue = { prixCentimes: number; coutCentimes: number; quantite: number }

export type Marge = {
  chiffreAffairesCentimes: number
  coutMarchandiseCentimes: number
  margeCentimes: number
  /** Marge en pourcentage du chiffre d'affaires, arrondie au dixième. */
  tauxMarge: number
  unitesVendues: number
}

/** Agrège des lignes vendues en chiffre d'affaires, coût et marge. */
export function calculerMarge(lignes: LigneVendue[]): Marge {
  let chiffreAffairesCentimes = 0
  let coutMarchandiseCentimes = 0
  let unitesVendues = 0

  for (const ligne of lignes) {
    chiffreAffairesCentimes += ligne.prixCentimes * ligne.quantite
    coutMarchandiseCentimes += ligne.coutCentimes * ligne.quantite
    unitesVendues += ligne.quantite
  }

  const margeCentimes = chiffreAffairesCentimes - coutMarchandiseCentimes
  const tauxMarge =
    chiffreAffairesCentimes === 0 ? 0 : Math.round((margeCentimes / chiffreAffairesCentimes) * 1000) / 10

  return { chiffreAffairesCentimes, coutMarchandiseCentimes, margeCentimes, tauxMarge, unitesVendues }
}

export type Periode = 'jour' | 'semaine' | 'mois' | 'annee'

export const PERIODES: { valeur: Periode; libelle: string }[] = [
  { valeur: 'jour', libelle: 'Aujourd’hui' },
  { valeur: 'semaine', libelle: 'Cette semaine' },
  { valeur: 'mois', libelle: 'Ce mois' },
  { valeur: 'annee', libelle: 'Cette année' },
]

/**
 * Début de la période contenant `reference`. La semaine commence le lundi,
 * comme partout en Haïti et en France.
 */
export function debutPeriode(periode: Periode, reference: Date): Date {
  const d = new Date(reference)
  d.setHours(0, 0, 0, 0)

  if (periode === 'semaine') {
    const jour = (d.getDay() + 6) % 7 // lundi = 0
    d.setDate(d.getDate() - jour)
  } else if (periode === 'mois') {
    d.setDate(1)
  } else if (periode === 'annee') {
    d.setMonth(0, 1)
  }

  return d
}

/** Début de la période précédente, pour comparer « avant / maintenant ». */
export function debutPeriodePrecedente(periode: Periode, reference: Date): Date {
  const debut = debutPeriode(periode, reference)
  const d = new Date(debut)

  if (periode === 'jour') d.setDate(d.getDate() - 1)
  else if (periode === 'semaine') d.setDate(d.getDate() - 7)
  else if (periode === 'mois') d.setMonth(d.getMonth() - 1)
  else d.setFullYear(d.getFullYear() - 1)

  return d
}

/** Évolution en pourcentage entre deux montants, arrondie au dixième. */
export function evolution(avant: number, maintenant: number): number | null {
  if (avant === 0) return maintenant === 0 ? 0 : null
  return Math.round(((maintenant - avant) / avant) * 1000) / 10
}
