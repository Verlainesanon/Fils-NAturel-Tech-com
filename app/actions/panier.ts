'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { lirePanier, ecrirePanier, ecrireCodePromo } from '@/lib/cart'

export async function ajouterAuPanier(produitId: string, quantite = 1) {
  const produit = await prisma.product.findUnique({ where: { id: produitId } })
  if (!produit || produit.statut !== 'publie' || produit.supprimeLe) {
    return { erreur: 'Ce produit n’est plus disponible.' }
  }
  if (produit.stock <= 0) return { erreur: 'Ce produit est épuisé.' }

  const lignes = lirePanier()
  const existante = lignes.find((l) => l.produitId === produitId)
  const demande = (existante?.quantite ?? 0) + quantite

  if (demande > produit.stock) {
    return { erreur: `Il ne reste que ${produit.stock} exemplaire(s) en stock.` }
  }

  if (existante) existante.quantite = demande
  else lignes.push({ produitId, quantite })

  ecrirePanier(lignes)
  revalidatePath('/panier')
  revalidatePath('/', 'layout')
  return { ok: true, articles: lignes.reduce((t, l) => t + l.quantite, 0) }
}

export async function changerQuantite(produitId: string, quantite: number) {
  const lignes = lirePanier().filter((l) => l.produitId !== produitId)
  if (quantite > 0) {
    const produit = await prisma.product.findUnique({ where: { id: produitId } })
    const plafond = Math.min(quantite, produit?.stock ?? 0)
    if (plafond > 0) lignes.push({ produitId, quantite: plafond })
  }
  ecrirePanier(lignes)
  revalidatePath('/panier')
  revalidatePath('/', 'layout')
}

export async function retirerDuPanier(produitId: string) {
  ecrirePanier(lirePanier().filter((l) => l.produitId !== produitId))
  revalidatePath('/panier')
  revalidatePath('/', 'layout')
}

export async function appliquerCodePromo(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim().toUpperCase()
  if (!code) {
    ecrireCodePromo(null)
    revalidatePath('/panier')
    redirect('/panier')
  }

  const promo = await prisma.promo.findUnique({ where: { code } })
  const maintenant = new Date()
  const valide =
    promo &&
    promo.actif &&
    (!promo.debut || promo.debut <= maintenant) &&
    (!promo.fin || promo.fin >= maintenant)

  ecrireCodePromo(valide ? code : null)
  revalidatePath('/panier')
  redirect(valide ? '/panier' : '/panier?promo=inconnu')
}
