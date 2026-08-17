import Link from 'next/link'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { lireReglages } from '@/lib/settings'
import { formaterPrix, prixEffectif, parserJson } from '@/lib/format'
import { archiverProduit, publierProduit } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Produits' }

export default async function ListeProduits({
  searchParams,
}: {
  searchParams: { q?: string; categorie?: string; statut?: string }
}) {
  const recherche = (searchParams.q ?? '').trim()
  const where: Prisma.ProductWhereInput = {
    supprimeLe: null,
    ...(searchParams.categorie ? { categorieId: searchParams.categorie } : {}),
    ...(searchParams.statut ? { statut: searchParams.statut } : {}),
    ...(recherche
      ? { OR: [{ nom: { contains: recherche } }, { reference: { contains: recherche } }] }
      : {}),
  }

  const [produits, categories, reglages] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { majLe: 'desc' }, include: { categorie: true } }),
    prisma.category.findMany({ orderBy: { ordre: 'asc' } }),
    lireReglages(),
  ])
  const symbole = reglages.DEVISE_SYMBOLE

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Produits</h1>
          <p>{produits.length} référence(s) affichée(s).</p>
        </div>
        <Link className="btn btn-solid" href="/admin/produits/nouveau">
          Ajouter un produit
        </Link>
      </header>

      <form className="filtres-admin" action="/admin/produits">
        <input name="q" defaultValue={recherche} placeholder="Nom ou référence" aria-label="Rechercher" />
        <select name="categorie" defaultValue={searchParams.categorie ?? ''} aria-label="Catégorie">
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <select name="statut" defaultValue={searchParams.statut ?? ''} aria-label="Statut">
          <option value="">Tous les statuts</option>
          <option value="publie">Publié</option>
          <option value="brouillon">Brouillon</option>
          <option value="archive">Archivé</option>
        </select>
        <button className="btn btn-line" type="submit">
          Filtrer
        </button>
      </form>

      <div className="cadre-tableau">
        <table className="admin-tableau">
          <thead>
            <tr>
              <th></th>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Statut</th>
              <th className="colonne-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {produits.length === 0 && (
              <tr>
                <td colSpan={7} className="lede">
                  Aucun produit ne correspond à ces filtres.
                </td>
              </tr>
            )}
            {produits.map((p) => {
              const images = parserJson<string[]>(p.images, [])
              const { centimes, enPromo } = prixEffectif(p)
              return (
                <tr key={p.id}>
                  <td>
                    {images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={images[0]} alt="" className="vignette-tableau" />
                    ) : (
                      <span className="mono">—</span>
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/produits/${p.id}`}>
                      <strong>{p.nom}</strong>
                    </Link>
                    <br />
                    <span className="mono">{p.reference ?? ''}</span>
                  </td>
                  <td className="lede">{p.categorie.nom}</td>
                  <td>
                    {formaterPrix(centimes, symbole)}
                    {enPromo && <span className="mono"> promo</span>}
                  </td>
                  <td>
                    <span
                      className={`temoin ${
                        p.stock <= 0 ? 'temoin-vide' : p.stock <= p.seuilAlerte ? 'temoin-bas' : 'temoin-ok'
                      }`}
                      aria-hidden
                    />{' '}
                    {p.stock}
                  </td>
                  <td>
                    <span className={`etat etat-${p.statut}`}>{p.statut}</span>
                  </td>
                  <td className="colonne-actions">
                    <Link className="bouton-mini" href={`/admin/produits/${p.id}`}>
                      Modifier
                    </Link>{' '}
                    {p.statut === 'archive' ? (
                      <FormulaireAdmin action={publierProduit.bind(null, p.id)} className="ligne-action">
                        <button className="bouton-mini" type="submit">
                          Republier
                        </button>
                      </FormulaireAdmin>
                    ) : (
                      <FormulaireAdmin
                        action={archiverProduit.bind(null, p.id)}
                        className="ligne-action"
                        confirmation={`Archiver « ${p.nom} » ? Il disparaîtra de la boutique.`}
                      >
                        <button className="bouton-mini danger" type="submit">
                          Archiver
                        </button>
                      </FormulaireAdmin>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
