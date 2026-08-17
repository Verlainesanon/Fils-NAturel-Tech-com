/**
 * Règles de saisie du stock et des lignes de commande, isolées de la base pour
 * être vérifiables directement par les tests.
 */

export type ModeQuantite = 'definir' | 'variation'

export type ResultatStock = { stockApres: number; ecart: number } | { erreur: string }

/**
 * « definir » : la valeur tapée devient le stock (comptage après inventaire).
 * « variation » : la valeur tapée est ajoutée ou retirée au stock actuel.
 */
export function resoudreStock(stockActuel: number, mode: ModeQuantite, saisie: number): ResultatStock {
  if (!Number.isFinite(saisie)) return { erreur: 'Quantité illisible.' }

  if (mode === 'definir') {
    if (saisie < 0) return { erreur: 'La quantité ne peut pas être négative.' }
    if (saisie === stockActuel) return { erreur: 'Le stock est déjà à cette valeur.' }
    return { stockApres: saisie, ecart: saisie - stockActuel }
  }

  if (saisie === 0) return { erreur: 'Indiquez une quantité différente de zéro.' }
  const stockApres = Math.max(0, stockActuel + saisie)
  if (stockApres === stockActuel) return { erreur: 'Le stock est déjà à cette valeur.' }
  return { stockApres, ecart: stockApres - stockActuel }
}

/** Total d'un ensemble de lignes, en centimes de la devise de base. */
export function totalLignes(lignes: { prixCentimes: number; quantite: number }[]): number {
  return lignes.reduce((total, ligne) => total + ligne.prixCentimes * ligne.quantite, 0)
}
