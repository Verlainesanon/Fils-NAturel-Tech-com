'use server'

import { randomBytes } from 'node:crypto'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { detaillerPanier, viderPanier, ecrireCodePromo } from '@/lib/cart'
import { clientIdActuel } from '@/lib/auth'
import { lireReglages, entier } from '@/lib/settings'
import { lireDevises, deviseChoisie } from '@/lib/devises'

function numeroCommande(): string {
  const jour = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  return `FN-${jour}-${randomBytes(2).toString('hex').toUpperCase()}`
}

/** Recalcule le badge de fidélité d'après le nombre de commandes payées. */
async function majBadge(clientId: string): Promise<void> {
  const reglages = await lireReglages()
  const commandes = await prisma.order.count({
    where: { clientId, statutPaiement: 'payee' },
  })
  const badge =
    commandes >= entier(reglages.BADGE_OR, 15)
      ? 'or'
      : commandes >= entier(reglages.BADGE_ARGENT, 5)
        ? 'argent'
        : commandes >= entier(reglages.BADGE_BRONZE, 1)
          ? 'bronze'
          : 'aucun'
  await prisma.customer.update({ where: { id: clientId }, data: { badge } })
}

export async function passerCommande(formData: FormData) {
  const panier = await detaillerPanier()
  if (panier.lignes.length === 0) return { erreur: 'Votre panier est vide.' }

  const nom = String(formData.get('nom') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const telephone = String(formData.get('telephone') ?? '').trim()
  const adresse = String(formData.get('adresse') ?? '').trim()
  const ville = String(formData.get('ville') ?? '').trim()
  const mode = String(formData.get('mode') ?? 'hors_ligne')

  if (nom.length < 2) return { erreur: 'Indiquez le nom qui recevra la commande.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erreur: 'Cette adresse email n’est pas valide.' }
  if (adresse.length < 5) return { erreur: 'Indiquez une adresse de livraison complète.' }
  if (ville.length < 2) return { erreur: 'Indiquez la ville de livraison.' }

  // Vérification du stock juste avant écriture : le panier a pu vieillir.
  const produits = await prisma.product.findMany({
    where: { id: { in: panier.lignes.map((l) => l.produitId) } },
  })
  for (const ligne of panier.lignes) {
    const produit = produits.find((p) => p.id === ligne.produitId)
    if (!produit || produit.stock < ligne.quantite) {
      return { erreur: `Le stock de « ${ligne.nom} » a changé. Ajustez votre panier.` }
    }
  }

  let clientId = clientIdActuel()
  if (!clientId) {
    const existant = await prisma.customer.findUnique({ where: { email } })
    clientId = existant
      ? existant.id
      : (await prisma.customer.create({ data: { email, nom, telephone: telephone || null } })).id
  }

  const numero = numeroCommande()
  const jetonInvite = randomBytes(16).toString('hex')
  const devise = deviseChoisie(await lireDevises())

  const commande = await prisma.$transaction(async (tx) => {
    const creee = await tx.order.create({
      data: {
        numero,
        jetonInvite,
        clientId,
        emailContact: email,
        nomContact: nom,
        telContact: telephone || null,
        adresseTexte: adresse,
        villeLivraison: ville,
        sousTotalCentimes: panier.sousTotalCentimes,
        remiseCentimes: panier.remiseCentimes,
        livraisonCentimes: panier.livraisonCentimes,
        totalCentimes: panier.totalCentimes,
        promoId: panier.promo?.id ?? null,
        deviseCode: devise.code,
        tauxApplique: devise.taux,
        modePaiement: mode,
        statutPaiement: 'en_attente',
        statutTraitement: 'nouvelle',
        lignes: {
          create: panier.lignes.map((l) => ({
            produitId: l.produitId,
            nomProduit: l.nom,
            referenceProduit: l.reference,
            prixCentimes: l.prixCentimes,
            quantite: l.quantite,
          })),
        },
        evenements: { create: { libelle: 'Commande reçue' } },
      },
    })

    for (const ligne of panier.lignes) {
      const produit = await tx.product.update({
        where: { id: ligne.produitId },
        data: { stock: { decrement: ligne.quantite } },
      })
      await tx.stockMovement.create({
        data: {
          produitId: ligne.produitId,
          variation: -ligne.quantite,
          stockApres: produit.stock,
          motif: 'vente',
          note: `Commande ${numero}`,
        },
      })
    }

    if (panier.promo) {
      await tx.promo.update({ where: { id: panier.promo.id }, data: { usages: { increment: 1 } } })
    }

    return creee
  })

  if (clientId) await majBadge(clientId)

  viderPanier()
  ecrireCodePromo(null)
  redirect(`/commande/merci/${commande.numero}?jeton=${jetonInvite}`)
}
