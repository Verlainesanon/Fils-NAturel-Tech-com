import Link from 'next/link'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { formaterDateHeure } from '@/lib/format'
import { ajusterStock } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Stock et ruptures' }

export default async function Stock({
  searchParams,
}: {
  searchParams: { q?: string; categorie?: string; filtre?: string }
}) {
  const recherche = (searchParams.q ?? '').trim()
  const where: Prisma.ProductWhereInput = {
    supprimeLe: null,
    statut: { not: 'archive' },
    ...(searchParams.categorie ? { categorieId: searchParams.categorie } : {}),
    ...(searchParams.filtre === 'rupture' ? { stock: { lte: 0 } } : {}),
    ...(recherche
      ? { OR: [{ nom: { contains: recherche } }, { reference: { contains: recherche } }] }
      : {}),
  }

  const [produits, categories, mouvements] = await Promise.all([
    prisma.product.findMany({ where, orderBy: [{ stock: 'asc' }, { nom: 'asc' }] }),
    prisma.category.findMany({ orderBy: { ordre: 'asc' }, select: { id: true, nom: true } }),
    prisma.stockMovement.findMany({
      orderBy: { creeLe: 'desc' },
      take: 20,
      include: { produit: { select: { nom: true } } },
    }),
  ])

  const critiques = produits.filter((p) => p.stock <= p.seuilAlerte)

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Stock et ruptures</h1>
          <p>
            {critiques.length} produit(s) au seuil d’alerte ou en dessous. Choisissez « Nouvelle quantité »
            pour taper le stock réel après comptage, ou « Ajouter / retirer » pour saisir un écart.
          </p>
        </div>
      </header>

      <form className="filtres-admin" action="/admin/stock">
        <input
          type="search"
          name="q"
          defaultValue={recherche}
          placeholder="Nom ou référence"
          aria-label="Chercher un article"
        />
        <select name="categorie" defaultValue={searchParams.categorie ?? ''} aria-label="Rayon">
          <option value="">Tous les rayons</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <select name="filtre" defaultValue={searchParams.filtre ?? ''} aria-label="Disponibilité">
          <option value="">Tous les articles</option>
          <option value="rupture">En rupture seulement</option>
        </select>
        <button className="btn btn-line" type="submit">
          Filtrer
        </button>
        <span className="mono">{produits.length} article(s)</span>
      </form>

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
            {produits.length === 0 && (
              <tr>
                <td colSpan={4} className="lede">
                  Aucun article ne correspond à ces filtres.
                </td>
              </tr>
            )}
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
                    <select name="mode" defaultValue="definir" aria-label={`Mode de saisie pour ${p.nom}`}>
                      <option value="definir">Nouvelle quantité</option>
                      <option value="variation">Ajouter / retirer</option>
                    </select>
                    <input
                      name="quantite"
                      type="number"
                      defaultValue={p.stock}
                      aria-label={`Quantité pour ${p.nom}`}
                      style={{ width: '6rem' }}
                    />
                    <select name="motif" aria-label="Motif">
                      <option value="inventaire">Inventaire</option>
                      <option value="reception">Réception</option>
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
