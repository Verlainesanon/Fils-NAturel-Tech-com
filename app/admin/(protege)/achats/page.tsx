import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireDevises, deviseDeBase } from '@/lib/devises'
import { formaterPrix, formaterDateHeure } from '@/lib/format'
import { supprimerAchat } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'
import SaisieAchat from '@/components/admin/SaisieAchat'

export const metadata: Metadata = { title: 'Achats' }

export default async function Achats() {
  const [produits, achats, devises] = await Promise.all([
    prisma.product.findMany({
      where: { supprimeLe: null, statut: { not: 'archive' } },
      orderBy: { nom: 'asc' },
      select: { id: true, nom: true, reference: true, stock: true, coutCentimes: true },
    }),
    prisma.purchase.findMany({
      orderBy: { achteLe: 'desc' },
      take: 100,
      include: { produit: { select: { id: true, nom: true } } },
    }),
    lireDevises(),
  ])
  const symbole = deviseDeBase(devises).symbole
  const totalDepense = achats.reduce((t, a) => t + a.prixTotalCentimes, 0)
  const totalUnites = achats.reduce((t, a) => t + a.quantite, 0)
  const aujourdhui = new Date().toISOString().slice(0, 10)

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Achats</h1>
          <p>
            {achats.length} achat(s) enregistré(s) · {totalUnites} unité(s) entrées ·{' '}
            {formaterPrix(totalDepense, symbole)} dépensés.
          </p>
        </div>
        <Link className="btn btn-line" href="/admin/bilan">
          Voir le bilan
        </Link>
      </header>

      <div className="deux-colonnes">
        <div>
          <div className="cadre-tableau">
            <table className="admin-tableau">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Article</th>
                  <th>Quantité</th>
                  <th>Coût unitaire</th>
                  <th>Total payé</th>
                  <th className="colonne-actions">Retirer</th>
                </tr>
              </thead>
              <tbody>
                {achats.length === 0 && (
                  <tr>
                    <td colSpan={6} className="lede">
                      Aucun achat enregistré. Le premier vous donnera le prix de revient de vos articles.
                    </td>
                  </tr>
                )}
                {achats.map((a) => (
                  <tr key={a.id}>
                    <td className="mono">{formaterDateHeure(a.achteLe)}</td>
                    <td>
                      <Link href={`/admin/produits/${a.produit.id}`}>{a.produit.nom}</Link>
                      {a.fournisseur && (
                        <>
                          <br />
                          <span className="mono">{a.fournisseur}</span>
                        </>
                      )}
                    </td>
                    <td>
                      <strong>{a.quantite}</strong>
                      {a.mode === 'lot' && (
                        <>
                          <br />
                          <span className="mono">
                            {a.nombre} × {a.quantiteParLot}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="mono">{formaterPrix(a.coutUnitaireCentimes, symbole)}</td>
                    <td>
                      <strong>{formaterPrix(a.prixTotalCentimes, symbole)}</strong>
                    </td>
                    <td className="colonne-actions">
                      <FormulaireAdmin
                        action={supprimerAchat}
                        confirmation="Supprimer cet achat ? Les unités concernées repartent du stock."
                      >
                        <input type="hidden" name="id" value={a.id} />
                        <button className="bouton-mini" type="submit">
                          Supprimer
                        </button>
                      </FormulaireAdmin>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <SaisieAchat produits={produits} symbole={symbole} aujourdhui={aujourdhui} />
        </div>
      </div>
    </>
  )
}
