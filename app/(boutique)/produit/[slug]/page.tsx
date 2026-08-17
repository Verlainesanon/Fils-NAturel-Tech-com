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
    where: {
      categorieId: produit.categorieId,
      id: { not: produit.id },
      statut: 'publie',
      supprimeLe: null,
    },
    take: 4,
  })

  return (
    <>
      <section className="section fiche">
        <div className="contenu">
          <nav className="fil-ariane mono">
            <Link href="/boutique">Catalogue</Link>
            <span>/</span>
            <Link href={`/boutique?categorie=${produit.categorie.slug}`}>{produit.categorie.nom}</Link>
            <span>/</span>
            <span>{produit.nom}</span>
          </nav>

          <div className="fiche-grille">
            <Galerie images={images} nom={produit.nom} />

            <div className="fiche-infos">
              <div className="carte-etiquettes">
                {enPromo && <span className="etiquette etiquette-promo">Promotion</span>}
                {rupture && <span className="etiquette etiquette-rupture">Rupture</span>}
                {produit.marque && <span className="etiquette">{produit.marque}</span>}
              </div>

              <h1 className="titre-section">{produit.nom}</h1>
              {produit.reference && <p className="mono">Référence {produit.reference}</p>}

              {produit.descriptionCourte && <p className="doux">{produit.descriptionCourte}</p>}

              <div className="fiche-prix">
                <strong>{formaterPrix(centimes, symbole)}</strong>
                {enPromo && <s>{formaterPrix(produit.prixCentimes, symbole)}</s>}
              </div>

              <p className="fiche-stock">
                <span
                  className={`temoin ${rupture ? 'temoin-vide' : stockBas ? 'temoin-bas' : 'temoin-ok'}`}
                  aria-hidden
                />
                {rupture
                  ? 'Épuisé pour le moment'
                  : stockBas
                    ? `Plus que ${produit.stock} en stock`
                    : `${produit.stock} en stock`}
                <span className="doux"> · Livraison {reglages.LIVRAISON_DELAI}</span>
              </p>

              <AjoutPanier produitId={produit.id} stock={produit.stock} />

              <div className="fiche-description">
                <h2 className="mono">Description</h2>
                <p>{produit.description}</p>
              </div>

              {caracteristiques.length > 0 && (
                <div className="fiche-caracteristiques">
                  <h2 className="mono">Caractéristiques</h2>
                  <dl>
                    {caracteristiques.map((c, i) => (
                      <div key={i}>
                        <dt>{c.cle}</dt>
                        <dd>{c.valeur}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {similaires.length > 0 && (
        <section className="section piste">
          <div className="contenu">
            <div className="entete-section">
              <div>
                <span className="surtitre">Même rayon</span>
                <h2 className="titre-section">À regarder aussi</h2>
              </div>
            </div>
            <div className="grille-produits">
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
