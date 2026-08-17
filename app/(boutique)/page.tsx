import Link from 'next/link'
import { prisma } from '@/lib/db'
import { lireReglages } from '@/lib/settings'
import { lireBlocs, bloc, blocAlt } from '@/lib/content'
import CarteProduit from '@/components/CarteProduit'

export default async function Accueil() {
  const [reglages, blocs, misEnAvant, nouveautes, categories, banniere] = await Promise.all([
    lireReglages(),
    lireBlocs(),
    prisma.product.findMany({
      where: { statut: 'publie', supprimeLe: null, miseEnAvant: true },
      orderBy: { majLe: 'desc' },
      take: 4,
    }),
    prisma.product.findMany({
      where: { statut: 'publie', supprimeLe: null },
      orderBy: { creeLe: 'desc' },
      take: 8,
    }),
    prisma.category.findMany({ where: { visible: true, parentId: null }, orderBy: { ordre: 'asc' } }),
    prisma.banner.findFirst({ where: { actif: true }, orderBy: { ordre: 'asc' } }),
  ])

  const vedettes = misEnAvant.length > 0 ? misEnAvant : nouveautes.slice(0, 4)
  const symbole = reglages.DEVISE_SYMBOLE

  return (
    <>
      {banniere && (
        <div className={`banniere banniere-${banniere.couleur}`}>
          <div className="contenu">
            {banniere.lien ? <Link href={banniere.lien}>{banniere.texte}</Link> : banniere.texte}
          </div>
        </div>
      )}

      <section className="hero">
        <div className="contenu hero-grille">
          <div className="hero-texte">
            <span className="surtitre monte">{bloc(blocs, 'accueil.hero.surtitre')}</span>
            <h1 className="affiche monte retard-1">{bloc(blocs, 'accueil.hero.titre')}</h1>
            <p className="doux monte retard-2">{bloc(blocs, 'accueil.hero.texte')}</p>
            <div className="hero-actions monte retard-3">
              <Link className="bouton" href={blocAlt(blocs, 'accueil.hero.bouton') || '/boutique'}>
                {bloc(blocs, 'accueil.hero.bouton')}
              </Link>
              <Link className="lien-souligne" href="/boutique?tri=promo">
                Voir les promotions
              </Link>
            </div>
          </div>

          <div className="carte-circuit monte retard-2" aria-hidden>
            <div className="puce">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reglages.SITE_LOGO || '/logo.jpeg'} alt="" />
            </div>
          </div>
        </div>
      </section>

      <div className="bande-promesses">
        {[1, 2, 3].map((n) => (
          <div key={n} className="promesse">
            <h3>{bloc(blocs, `accueil.promesse${n}.titre`)}</h3>
            <p className="doux" style={{ margin: 0, fontSize: '0.92rem' }}>
              {bloc(blocs, `accueil.promesse${n}.texte`)}
            </p>
          </div>
        ))}
      </div>

      <section className="section piste">
        <div className="contenu">
          <div className="entete-section">
            <div>
              <span className="surtitre">Sélection</span>
              <h2 className="titre-section">Ce que nous recommandons</h2>
            </div>
            <Link className="lien-souligne" href="/boutique">
              Tout le catalogue
            </Link>
          </div>

          <div className="grille-produits">
            {vedettes.map((p) => (
              <CarteProduit key={p.id} produit={p} symbole={symbole} />
            ))}
          </div>
        </div>
      </section>

      <section className="section piste">
        <div className="contenu">
          <div className="entete-section">
            <div>
              <span className="surtitre">Rayons</span>
              <h2 className="titre-section">Par famille de matériel</h2>
            </div>
          </div>

          <div className="grille-rayons">
            {categories.map((c) => (
              <Link key={c.id} href={`/boutique?categorie=${c.slug}`} className="rayon">
                <span className="rayon-nom">{c.nom}</span>
                <span className="mono">Explorer →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section piste">
        <div className="contenu">
          <div className="entete-section">
            <div>
              <span className="surtitre">À propos</span>
              <h2 className="titre-section">{bloc(blocs, 'apropos.titre')}</h2>
            </div>
          </div>
          <p className="doux" style={{ maxWidth: '62ch', fontSize: '1.02rem' }}>
            {bloc(blocs, 'apropos.corps')}
          </p>
        </div>
      </section>
    </>
  )
}
