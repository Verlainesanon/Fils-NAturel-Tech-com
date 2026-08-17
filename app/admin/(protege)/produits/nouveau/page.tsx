import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireDevises, deviseDeBase } from '@/lib/devises'
import FormulaireProduit from '@/components/admin/FormulaireProduit'

export const metadata: Metadata = { title: 'Nouveau produit' }

export default async function NouveauProduit() {
  const [categories] = await Promise.all([
    prisma.category.findMany({ orderBy: { ordre: 'asc' } }),
  ])

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Nouveau produit</h1>
          <p>Il apparaîtra dans la boutique dès qu’il sera publié.</p>
        </div>
      </header>

      <FormulaireProduit produit={null} categories={categories} symbole={deviseDeBase(await lireDevises()).symbole} />
    </>
  )
}
