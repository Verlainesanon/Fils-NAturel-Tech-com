import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireReglages } from '@/lib/settings'
import { formaterPrix, prixEffectif, parserJson } from '@/lib/format'
import AjoutPanier from '@/components/AjoutPanier'
import Galerie from '@/components/Galerie'
import CarteProduit from '@/components/CarteProduit'

async function chargerProduit(slug: string) {
  return prisma.product.findFirst({
    where: { slug, statut: 'publie', supprimeLe: null },
    include: { categorie: true },
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const produit = await chargerProduit(params.slug)
  if (!produit) return { title: 'Produit introuvable' }
  return {
    title: produit.seoTitre || produit.nom,
    description: produit.seoDescription || produit.descriptionCourte || produit.description.slice(0, 155),
  }
}

export default async function FicheProduit({ params }: { params: { slug: string } }) {
  const produit = await chargerProduit(params.slug)
  if (!produit) notFound()

  const reglages = await lireReglages()
  const symbole = reglages.DEVISE_SYMBOLE
  const { centimes, enPromo } = prixEffectif(produit)
  const images = parserJson<string[]>(produit.images, [])
  const caracteristiques = parserJson<{ cle: string; valeur: string }[]>(produit.caracteristiques, [])
  const rupture = produit.stock <= 0
  const stockBas = !rupture && produit.stock <= produit.seuilAlerte

  const similaires = await prisma.product.findMany({
    where: { categorieId: produit.categorieId, id: { not: produit.id }, statut: 'publie', supprimeLe: null },
    take: 4,
  })

  return (
    <>
      <section className="sec">
        <div className="wrap">
          <nav className="fil-ariane">
            <Link href="/boutique">Catalogue</Link>
            <span>/</span>
            <Link href={`/boutique?categorie=${produit.categorie.slug}`}>{produit.categorie.nom}</Link>
            <span>/</span>
            <span>{produit.nom}</span>
          </nav>

          <div className="detail">
            <figure className="fig">
              <Galerie images={images} nom={produit.nom} />
              <figcaption>
                <span>{produit.reference ?? 'FNTC'}</span>
                <span>{produit.marque ?? produit.categorie.nom}</span>
              </figcaption>
            </figure>

            <div>
              <span className="eyebrow">{produit.categorie.nom}</span>
              <h1>{produit.nom}</h1>
              {produit.descriptionCourte && (
                <p className="lede" style={{ marginTop: '1rem' }}>
                  {produit.descriptionCourte}
                </p>
              )}

              <div className="pblock">
                <b>{formaterPrix(centimes, symbole)}</b>
                {enPromo && <s>{formaterPrix(produit.prixCentimes, symbole)}</s>}
                {enPromo && <span className="tag promo">Promo</span>}
              </div>

              <p className="mono" style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  className={`temoin ${rupture ? 'temoin-vide' : stockBas ? 'temoin-bas' : 'temoin-ok'}`}
                  aria-hidden
                />
                {rupture ? 'Épuisé' : stockBas ? `Plus que ${produit.stock} en stock` : `${produit.stock} en stock`}
                {' · '}
                Livraison {reglages.LIVRAISON_DELAI}
              </p>

              <AjoutPanier produitId={produit.id} stock={produit.stock} />

              {caracteristiques.length > 0 && (
                <table className="spec">
                  <tbody>
                    {caracteristiques.map((c, i) => (
                      <tr key={i}>
                        <th scope="row">{c.cle}</th>
                        <td>{c.valeur}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: '1.9rem' }}>
                <span className="eyebrow">Description</span>
                <p className="lede" style={{ marginTop: '0.8rem', maxWidth: 'none' }}>
                  {produit.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {similaires.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="sec-h">
              <span className="eyebrow">Même rayon</span>
              <h2>À regarder aussi</h2>
            </div>
            <div className="grid">
              {similaires.map((p) => (
                <CarteProduit key={p.id} produit={p} symbole={symbole} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
