import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formaterDateHeure } from '@/lib/format'
import { ajusterStock } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Stock et ruptures' }

export default async function Stock() {
  const produits = await prisma.product.findMany({
    where: { supprimeLe: null, statut: { not: 'archive' } },
    orderBy: [{ stock: 'asc' }, { nom: 'asc' }],
  })

  const critiques = produits.filter((p) => p.stock <= p.seuilAlerte)
  const mouvements = await prisma.stockMovement.findMany({
    orderBy: { creeLe: 'desc' },
    take: 20,
    include: { produit: { select: { nom: true } } },
  })

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Stock et ruptures</h1>
          <p>
            {critiques.length} produit(s) au seuil d’alerte ou en dessous. Chaque ajustement demande un motif et
            reste tracé.
          </p>
        </div>
      </header>

      <div className="cadre-tableau">
        <table className="admin-tableau">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Stock</th>
              <th>Seuil</th>
              <th>Ajustement</th>
            </tr>
          </thead>
          <tbody>
            {produits.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/produits/${p.id}`}>{p.nom}</Link>
                  <br />
                  <span className="mono">{p.reference ?? ''}</span>
                </td>
                <td>
                  <span
                    className={`temoin ${
                      p.stock <= 0 ? 'temoin-vide' : p.stock <= p.seuilAlerte ? 'temoin-bas' : 'temoin-ok'
                    }`}
                    aria-hidden
                  />{' '}
                  <strong>{p.stock}</strong>
                </td>
                <td className="mono">{p.seuilAlerte}</td>
                <td>
                  <FormulaireAdmin action={ajusterStock} className="ligne-ajustement">
                    <input type="hidden" name="produitId" value={p.id} />
                    <input
                      name="variation"
                      type="number"
                      defaultValue={0}
                      aria-label={`Ajustement pour ${p.nom}`}
                      style={{ width: '5.5rem' }}
                    />
                    <select name="motif" aria-label="Motif">
                      <option value="reception">Réception</option>
                      <option value="inventaire">Inventaire</option>
                      <option value="casse">Casse</option>
                      <option value="correction">Correction</option>
                    </select>
                    <input name="note" placeholder="Note (facultative)" aria-label="Note" />
                    <button className="bouton-mini" type="submit">
                      Appliquer
                    </button>
                  </FormulaireAdmin>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="admin-groupe" style={{ paddingLeft: 0, marginTop: '2rem' }}>
        Derniers mouvements
      </h2>
      <div className="cadre-tableau">
        <table className="admin-tableau">
          <thead>
            <tr>
              <th>Date</th>
              <th>Produit</th>
              <th>Variation</th>
              <th>Stock après</th>
              <th>Motif</th>
              <th>Auteur</th>
            </tr>
          </thead>
          <tbody>
            {mouvements.map((m) => (
              <tr key={m.id}>
                <td className="mono">{formaterDateHeure(m.creeLe)}</td>
                <td>{m.produit.nom}</td>
                <td className={m.variation < 0 ? 'etat-annulee' : 'or'}>
                  {m.variation > 0 ? '+' : ''}
                  {m.variation}
                </td>
                <td>{m.stockApres}</td>
                <td className="doux">
                  {m.motif}
                  {m.note ? ` — ${m.note}` : ''}
                </td>
                <td className="doux">{m.auteur ?? 'automatique'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
