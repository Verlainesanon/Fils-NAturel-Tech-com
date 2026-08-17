import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

/**
 * Les prix sont enregistrés une seule fois, en centimes de la devise de base.
 * Les autres devises sont calculées à l'affichage avec leur taux : rien à
 * ressaisir quand le taux bouge, et aucun risque de prix incohérents.
 */

const COOKIE_DEVISE = 'fntc_devise'

export type Devise = {
  code: string
  nom: string
  symbole: string
  taux: number
  decimales: number
  base: boolean
  actif: boolean
  ordre: number
}

export const DEVISES_DEFAUT: Devise[] = [
  { code: 'HTG', nom: 'Gourde haïtienne', symbole: 'G', taux: 1, decimales: 2, base: true, actif: true, ordre: 1 },
  { code: 'USD', nom: 'Dollar américain', symbole: '$', taux: 0.0076, decimales: 2, base: false, actif: true, ordre: 2 },
  { code: 'EUR', nom: 'Euro', symbole: '€', taux: 0.007, decimales: 2, base: false, actif: true, ordre: 3 },
]

export async function lireDevises(): Promise<Devise[]> {
  try {
    const lignes = await prisma.devise.findMany({ orderBy: { ordre: 'asc' } })
    if (lignes.length > 0) {
      return lignes.map((d) => ({
        code: d.code,
        nom: d.nom,
        symbole: d.symbole,
        taux: d.taux,
        decimales: d.decimales,
        base: d.base,
        actif: d.actif,
        ordre: d.ordre,
      }))
    }
  } catch {
    // base injoignable : on affiche quand même des prix cohérents
  }
  return DEVISES_DEFAUT
}

export function deviseDeBase(devises: Devise[]): Devise {
  return devises.find((d) => d.base) ?? devises[0] ?? DEVISES_DEFAUT[0]
}

/** Devise choisie par le visiteur, sinon celle de base. */
export function deviseChoisie(devises: Devise[]): Devise {
  const code = cookies().get(COOKIE_DEVISE)?.value
  const choisie = devises.find((d) => d.code === code && d.actif)
  return choisie ?? deviseDeBase(devises)
}

/** Convertit un montant exprimé en centimes de la devise de base. */
export function convertir(centimesBase: number, devise: Devise): number {
  if (devise.base || devise.taux === 1) return centimesBase
  return Math.round(centimesBase * devise.taux)
}

export function formaterMontant(centimesBase: number, devise: Devise, langue = 'fr'): string {
  const montant = convertir(centimesBase, devise) / 100
  const texte = montant.toLocaleString(langue === 'en' ? 'en-US' : 'fr-FR', {
    minimumFractionDigits: devise.decimales,
    maximumFractionDigits: devise.decimales,
  })
  return `${texte} ${devise.symbole}`
}
