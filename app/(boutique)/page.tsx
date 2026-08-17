import Link from 'next/link'
import { prisma } from '@/lib/db'
import { contexteAffichage } from '@/lib/affichage'
import { lireReglages } from '@/lib/settings'
import { lireBlocs, bloc, blocAlt } from '@/lib/content'
import CarteProduit from '@/components/CarteProduit'
import FeuilleMenu, { type Rayon } from '@/components/FeuilleMenu'

export default async function Accueil() {
  const [reglages, blocs, categories, misEnAvant, nouveautes, banniere, totalProduits, commandesLivrees] =
    await Promise.all([
      lireReglages(),
      lireBlocs(),
      prisma.category.findMany({
        where: { visible: true, parentId: null },
        orderBy: { ordre: 'asc' },
        include: { _count: { select: { produits: true } } },
      }),
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
      prisma.banner.findFirst({ where: { actif: true }, orderBy: { ordre: 'asc' } }),
      prisma.product.count({ where: { statut: 'publie', supprimeLe: null } }),
      prisma.order.count({ where: { statutTraitement: 'livree' } }),
    ])

  const affichage = await contexteAffichage()
  const { prix, t } = affichage
  const vedettes = misEnAvant.length > 0 ? misEnAvant : nouveautes.slice(0, 4)
  const rayons: Rayon[] = categories.map((c) => ({ slug: c.slug, nom: c.nom, nombre: c._count.produits }))
  // Le dernier mot du titre passe en rouge, comme dans la maquette.
  const motsTitre = bloc(blocs, 'accueil.hero.titre').split(' ')
  const dernierMot = motsTitre.length > 1 ? motsTitre[motsTitre.length - 1] : ''
  const debutTitre = motsTitre.slice(0, motsTitre.length - (dernierMot ? 1 : 0)).join(' ')

  return (
    <>
      {banniere && (
        <div className={`banniere banniere-${banniere.couleur}`}>
          {banniere.lien ? <Link href={banniere.lien}>{banniere.texte}</Link> : banniere.texte}
        </div>
      )}

      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">{bloc(blocs, 'accueil.hero.surtitre')}</span>
          <h1>
            {debutTitre} <em>{dernierMot}</em>
          </h1>
          <p className="lede">{bloc(blocs, 'accueil.hero.texte')}</p>

          <div className="hero-cta">
            <Link className="btn btn-sig" href={blocAlt(blocs, 'accueil.hero.bouton') || '/boutique'}>
              {bloc(blocs, 'accueil.hero.bouton')}
            </Link>
            <Link className="btn btn-line" href="/boutique?tri=promo">
              {t('hero.speciaux')}
            </Link>
          </div>

          <FeuilleMenu rayons={rayons} total={totalProduits} affichage={affichage} />
        </div>
      </section>

      <div className="wrap">
        <div className="strip">
          <span>{t('strip.teste')}</span>
          <span>{t('strip.sansCompte')}</span>
          <span>{t('strip.livraison')} {reglages.LIVRAISON_DELAI}</span>
          <span>{t('strip.chat')}</span>
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <div className="feat">
            <article className="card-l">
              <span className="eyebrow">Méthode</span>
              <h3>{bloc(blocs, 'accueil.promesse1.titre')}</h3>
              <p>{bloc(blocs, 'accueil.promesse1.texte')}</p>
            </article>
            <article className="card-d">
              <span className="eyebrow od">Achat</span>
              <h3>{bloc(blocs, 'accueil.promesse2.titre')}</h3>
              <p>{bloc(blocs, 'accueil.promesse2.texte')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-h">
            <span className="eyebrow">{t('accueil.selection')}</span>
            <h2>{t('accueil.recommandons')}</h2>
            <p className="lede">
              Peu de références, toutes connues. Le stock affiché est celui de l’atelier, à la pièce près.
            </p>
          </div>

          {vedettes.length === 0 ? (
            <p className="empty">{t('accueil.catalogueVide')}</p>
          ) : (
            <div className="grid">
              {vedettes.map((p) => (
                <CarteProduit key={p.id} produit={p} affichage={affichage} />
              ))}
            </div>
          )}

          <div className="hero-cta">
            <Link className="btn btn-line" href="/boutique">
              {t('accueil.toutCatalogue')}
            </Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="panel panel-q">
            <span className="eyebrow od">{bloc(blocs, 'accueil.promesse3.titre')}</span>
            <h2>
              {bloc(blocs, 'accueil.promesse3.texte').split('.')[0]}.{' '}
              <em>{bloc(blocs, 'accueil.promesse3.texte').split('.').slice(1).join('.').trim()}</em>
            </h2>

            <div className="tiers" style={{ marginTop: 'clamp(2rem,4vw,3rem)' }}>
              <div className="tier t1">
                <span className="dot" />
                <h3>Bronze</h3>
                <p>Dès {reglages.BADGE_BRONZE} commande livrée.</p>
              </div>
              <div className="tier t2">
                <span className="dot" />
                <h3>Argent</h3>
                <p>Dès {reglages.BADGE_ARGENT} commandes livrées.</p>
              </div>
              <div className="tier t3">
                <span className="dot" />
                <h3>Or</h3>
                <p>Dès {reglages.BADGE_OR} commandes livrées.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="proof">
            <div>
              <b>{totalProduits}</b>
              <span>{t('accueil.references')}</span>
            </div>
            <div>
              <b>{categories.length}</b>
              <span>{t('accueil.rayons')}</span>
            </div>
            <div>
              <b>{commandesLivrees}</b>
              <span>{t('accueil.commandesLivrees')}</span>
            </div>
            <div>
              <b>{prix(Number(reglages.LIVRAISON_GRATUITE_DES))}</b>
              <span>{t('accueil.livraisonOfferte')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-h">
            <span className="eyebrow">{t('accueil.apropos')}</span>
            <h2>{bloc(blocs, 'apropos.titre')}</h2>
            <p className="lede">{bloc(blocs, 'apropos.corps')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
