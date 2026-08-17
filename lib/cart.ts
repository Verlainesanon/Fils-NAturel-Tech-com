import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { prixEffectif, parserJson } from '@/lib/format'
import { lireReglages, entier, type Reglages } from '@/lib/settings'

const COOKIE_PANIER = 'fntc_panier'

export type LignePanier = { produitId: string; quantite: number }

export type LigneDetaillee = {
  produitId: string
  slug: string
  nom: string
  reference: string | null
  image: string | null
  prixCentimes: number
  prixBarreCentimes: number | null
  quantite: number
  stock: number
  totalCentimes: number
}

export type PanierDetaille = {
  lignes: LigneDetaillee[]
  sousTotalCentimes: number
  remiseCentimes: number
  livraisonCentimes: number
  totalCentimes: number
  nombreArticles: number
  promo: { id: string; code: string; libelle: string } | null
  reglages: Reglages
}

export function lirePanier(): LignePanier[] {
  const brut = cookies().get(COOKIE_PANIER)?.value
  const lignes = parserJson<LignePanier[]>(brut, [])
  return Array.isArray(lignes)
    ? lignes.filter((l) => typeof l?.produitId === 'string' && l.quantite > 0)
    : []
}

export function ecrirePanier(lignes: LignePanier[]): void {
  cookies().set(COOKIE_PANIER, JSON.stringify(lignes), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 30 * 24 * 3600,
  })
}

export function viderPanier(): void {
  cookies().delete(COOKIE_PANIER)
}

const COOKIE_PROMO = 'fntc_promo'

export function lireCodePromo(): string | null {
  return cookies().get(COOKIE_PROMO)?.value ?? null
}

export function ecrireCodePromo(code: string | null): void {
  if (code) {
    cookies().set(COOKIE_PROMO, code, { sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600 })
  } else {
    cookies().delete(COOKIE_PROMO)
  }
}

/** Calcule remise, livraison et total. Source unique de vérité côté serveur. */
export async function detaillerPanier(): Promise<PanierDetaille> {
  const reglages = await lireReglages()
  const brut = lirePanier()
  const produits = brut.length
    ? await prisma.product.findMany({
        where: { id: { in: brut.map((l) => l.produitId) }, supprimeLe: null },
      })
    : []

  const lignes: LigneDetaillee[] = []
  for (const ligne of brut) {
    const produit = produits.find((p) => p.id === ligne.produitId)
    if (!produit || produit.statut !== 'publie') continue
    const { centimes, enPromo } = prixEffectif(produit)
    const quantite = Math.min(ligne.quantite, Math.max(produit.stock, 0))
    if (quantite <= 0) continue
    const images = parserJson<string[]>(produit.images, [])
    lignes.push({
      produitId: produit.id,
      slug: produit.slug,
      nom: produit.nom,
      reference: produit.reference,
      image: images[0] ?? null,
      prixCentimes: centimes,
      prixBarreCentimes: enPromo ? produit.prixCentimes : null,
      quantite,
      stock: produit.stock,
      totalCentimes: centimes * quantite,
    })
  }

  const sousTotalCentimes = lignes.reduce((t, l) => t + l.totalCentimes, 0)

  let remiseCentimes = 0
  let livraisonGratuite = false
  let promoRetenue: PanierDetaille['promo'] = null

  const code = lireCodePromo()
  if (code && sousTotalCentimes > 0) {
    const promo = await prisma.promo.findUnique({ where: { code } })
    const maintenant = new Date()
    const valide =
      promo &&
      promo.actif &&
      (!promo.debut || promo.debut <= maintenant) &&
      (!promo.fin || promo.fin >= maintenant) &&
      sousTotalCentimes >= promo.minimumCentimes &&
      (promo.usagesMax == null || promo.usages < promo.usagesMax)

    if (promo && valide) {
      const cibles = parserJson<string[]>(promo.cibleIds, [])
      const base =
        promo.portee === 'tout'
          ? sousTotalCentimes
          : lignes
              .filter((l) => cibles.includes(l.produitId))
              .reduce((t, l) => t + l.totalCentimes, 0)

      if (base > 0) {
        if (promo.type === 'pourcentage') remiseCentimes = Math.round((base * promo.valeur) / 100)
        else if (promo.type === 'montant') remiseCentimes = Math.min(promo.valeur, base)
        else livraisonGratuite = true

        promoRetenue = {
          id: promo.id,
          code: promo.code,
          libelle:
            promo.type === 'pourcentage'
              ? `-${promo.valeur} %`
              : promo.type === 'montant'
                ? 'Remise fixe'
                : 'Livraison offerte',
        }
      }
    }
  }

  const seuilGratuit = entier(reglages.LIVRAISON_GRATUITE_DES, 0)
  const fraisBase = entier(reglages.LIVRAISON_CENTIMES, 0)
  const livraisonCentimes =
    sousTotalCentimes === 0 || livraisonGratuite || (seuilGratuit > 0 && sousTotalCentimes >= seuilGratuit)
      ? 0
      : fraisBase

  return {
    lignes,
    sousTotalCentimes,
    remiseCentimes,
    livraisonCentimes,
    totalCentimes: Math.max(sousTotalCentimes - remiseCentimes + livraisonCentimes, 0),
    nombreArticles: lignes.reduce((t, l) => t + l.quantite, 0),
    promo: promoRetenue,
    reglages,
  }
}
