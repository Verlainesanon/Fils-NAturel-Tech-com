import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { adminActuel } from '@/lib/auth'
import { peut } from '@/lib/roles'
import { lireDevises, deviseDeBase } from '@/lib/devises'
import { prixEffectif } from '@/lib/format'
import SaisieCommande, { type ArticleSaisie, type ClientSaisie } from '@/components/admin/SaisieCommande'

export const metadata: Metadata = { title: 'Nouvelle commande' }

export default async function NouvelleCommande() {
  const admin = await adminActuel()
  if (!peut(admin?.role, 'vendeur')) redirect('/admin')

  const [produits, clients, categories, devises] = await Promise.all([
    prisma.product.findMany({
      where: { statut: 'publie', supprimeLe: null },
      orderBy: { nom: 'asc' },
      include: { categorie: { select: { id: true, nom: true } } },
    }),
    prisma.customer.findMany({
      where: { supprimeLe: null },
      orderBy: { nom: 'asc' },
      include: { adresses: { where: { parDefaut: true }, take: 1 } },
    }),
    prisma.category.findMany({ orderBy: { ordre: 'asc' }, select: { id: true, nom: true } }),
    lireDevises(),
  ])

  // Le prix retenu est celui que paierait le client : promotion comprise.
  const articles: ArticleSaisie[] = produits.map((p) => ({
    id: p.id,
    nom: p.nom,
    reference: p.reference,
    categorieId: p.categorie.id,
    categorieNom: p.categorie.nom,
    prixCentimes: prixEffectif(p).centimes,
    stock: p.stock,
  }))

  const clientsSaisie: ClientSaisie[] = clients.map((c) => ({
    id: c.id,
    nom: c.nom,
    email: c.email,
    telephone: c.telephone,
    adresse: c.adresses[0] ? `${c.adresses[0].ligne1}${c.adresses[0].ligne2 ? `\n${c.adresses[0].ligne2}` : ''}` : null,
    ville: c.adresses[0]?.ville ?? null,
  }))

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Nouvelle commande</h1>
          <p>
            Pour une vente au comptoir, par téléphone ou par message. Le stock est décrémenté comme pour une
            commande passée sur le site.
          </p>
        </div>
        <Link className="btn btn-line" href="/admin/commandes">
          Retour aux commandes
        </Link>
      </header>

      <SaisieCommande
        articles={articles}
        clients={clientsSaisie}
        categories={categories}
        symbole={deviseDeBase(devises).symbole}
      />
    </>
  )
}
