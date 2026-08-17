import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireReglages } from '@/lib/settings'
import { formaterDateHeure } from '@/lib/format'
import FormulaireProduit from '@/components/admin/FormulaireProduit'

export const metadata: Metadata = { title: 'Modifier un produit' }

export default async function ModifierProduit({ params }: { params: { id: string } }) {
  const [produit, categories, reglages] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { ordre: 'asc' } }),
    lireReglages(),
  ])
  if (!produit) notFound()

  const mouvements = await prisma.stockMovement.findMany({
    where: { produitId: produit.id },
    orderBy: { creeLe: 'desc' },
    take: 10,
  })

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>{produit.nom}</h1>
          <p>Dernière modification {formaterDateHeure(produit.majLe)}.</p>
        </div>
      </header>

      <FormulaireProduit produit={produit} categories={categories} symbole={reglages.DEVISE_SYMBOLE} />

      <h2 className="admin-groupe" style={{ paddingLeft: 0, marginTop: '2rem' }}>
        Mouvements de stock
      </h2>
      <div className="cadre-tableau">
        <table className="admin-tableau">
          <thead>
            <tr>
              <th>Date</th>
              <th>Variation</th>
              <th>Stock après</th>
              <th>Motif</th>
              <th>Auteur</th>
            </tr>
          </thead>
          <tbody>
            {mouvements.length === 0 && (
              <tr>
                <td colSpan={5} className="lede">
                  Aucun mouvement enregistré.
                </td>
              </tr>
            )}
            {mouvements.map((m) => (
              <tr key={m.id}>
                <td className="mono">{formaterDateHeure(m.creeLe)}</td>
                <td className={m.variation < 0 ? 'etat-annulee' : 'or'}>
                  {m.variation > 0 ? '+' : ''}
                  {m.variation}
                </td>
                <td>{m.stockApres}</td>
                <td className="lede">
                  {m.motif}
                  {m.note ? ` — ${m.note}` : ''}
                </td>
                <td className="lede">{m.auteur ?? 'automatique'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
