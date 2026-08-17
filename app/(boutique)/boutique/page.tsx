import Link from 'next/link'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { contexteAffichage } from '@/lib/affichage'
import CarteProduit from '@/components/CarteProduit'

export const metadata: Metadata = { title: 'Catalogue' }

type Params = {
  categorie?: string
  q?: string
  tri?: string
  dispo?: string
  page?: string
}

const PAR_PAGE = 12

const TRIS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  recent: { creeLe: 'desc' },
  prix_asc: { prixCentimes: 'asc' },
  prix_desc: { prixCentimes: 'desc' },
  nom: { nom: 'asc' },
  promo: { promoCentimes: 'asc' },
}

export default async function Catalogue({ searchParams }: { searchParams: Params }) {
  const affichage = await contexteAffichage()
  const categories = await prisma.category.findMany({
    where: { visible: true },
    orderBy: { ordre: 'asc' },
  })

  const page = Math.max(1, Number.parseInt(searchParams.page ?? '1', 10) || 1)
  const categorie = categories.find((c) => c.slug === searchParams.categorie)
  const recherche = (searchParams.q ?? '').trim()
  const tri = TRIS[searchParams.tri ?? 'recent'] ? searchParams.tri! : 'recent'

  const where: Prisma.ProductWhereInput = {
    statut: 'publie',
    supprimeLe: null,
    ...(categorie ? { categorieId: categorie.id } : {}),
    ...(searchParams.dispo === 'stock' ? { stock: { gt: 0 } } : {}),
    ...(searchParams.tri === 'promo' ? { promoCentimes: { not: null } } : {}),
    ...(recherche
      ? {
          OR: [
            { nom: { contains: recherche } },
            { description: { contains: recherche } },
            { reference: { contains: recherche } },
            { marque: { contains: recherche } },
          ],
        }
      : {}),
  }

  const [produits, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: TRIS[tri],
      skip: (page - 1) * PAR_PAGE,
      take: PAR_PAGE,
    }),
    prisma.product.count({ where }),
  ])

  const pages = Math.max(1, Math.ceil(total / PAR_PAGE))
  const lien = (modifs: Params) => {
    const params = new URLSearchParams()
    const base: Params = {
      categorie: searchParams.categorie,
      q: searchParams.q,
      tri: searchParams.tri,
      dispo: searchParams.dispo,
      ...modifs,
    }
    for (const [cle, valeur] of Object.entries(base)) {
      if (valeur) params.set(cle, String(valeur))
    }
    const chaine = params.toString()
    return chaine ? `/boutique?${chaine}` : '/boutique'
  }

  return (
    <section className="sec">
      <div className="wrap">
        <div className="entete-section">
          <div>
            <span className="eyebrow">{categorie ? categorie.nom : 'Catalogue'}</span>
            <h1 className="sec-titre">
              {categorie ? categorie.nom : recherche ? `Recherche : ${recherche}` : 'Tout le matériel'}
            </h1>
            <p className="mono" style={{ marginTop: '0.6rem' }}>
              {total} référence{total > 1 ? 's' : ''}
            </p>
          </div>

          <form className="barre-recherche" action="/boutique">
            {searchParams.categorie && (
              <input type="hidden" name="categorie" value={searchParams.categorie} />
            )}
            <input
              type="search"
              name="q"
              placeholder="Chercher une référence, une marque…"
              defaultValue={recherche}
              aria-label="Rechercher"
            />
            <button className="btn btn-solid" type="submit">
              Chercher
            </button>
          </form>
        </div>

        <div className="filters">
          <div className="groupe-filtre">
            <span className="mono">Rayon</span>
            <Link className={`puce-filtre ${!categorie ? 'actif' : ''}`} href={lien({ categorie: undefined, page: undefined })}>
              Tous
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                className={`puce-filtre ${categorie?.id === c.id ? 'actif' : ''}`}
                href={lien({ categorie: c.slug, page: undefined })}
              >
                {c.nom}
              </Link>
            ))}
          </div>

          <div className="groupe-filtre">
            <span className="mono">Tri</span>
            {[
              ['recent', 'Nouveautés'],
              ['prix_asc', 'Prix croissant'],
              ['prix_desc', 'Prix décroissant'],
              ['promo', 'En promotion'],
            ].map(([valeur, libelle]) => (
              <Link
                key={valeur}
                className={`puce-filtre ${tri === valeur ? 'actif' : ''}`}
                href={lien({ tri: valeur, page: undefined })}
              >
                {libelle}
              </Link>
            ))}
            <Link
              className={`puce-filtre ${searchParams.dispo === 'stock' ? 'actif' : ''}`}
              href={lien({ dispo: searchParams.dispo === 'stock' ? undefined : 'stock', page: undefined })}
            >
              En stock seulement
            </Link>
          </div>
        </div>

        {produits.length === 0 ? (
          <p className="empty">
            Aucun produit ne correspond. Retirez un filtre ou essayez un autre mot.
          </p>
        ) : (
          <div className="grid">
            {produits.map((p) => (
              <CarteProduit key={p.id} produit={p} affichage={affichage} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="pagination" aria-label="Pages">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={lien({ page: String(n) })} className={`puce-filtre ${n === page ? 'actif' : ''}`}>
                {n}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </section>
  )
}
