import Link from 'next/link'
import type { Metadata } from 'next'
import { detaillerPanier } from '@/lib/cart'
import { contexteAffichage } from '@/lib/affichage'
import { changerQuantite, retirerDuPanier, appliquerCodePromo } from '@/app/actions/panier'

export const metadata: Metadata = { title: 'Panier' }

export default async function Panier({ searchParams }: { searchParams: { promo?: string } }) {
  const panier = await detaillerPanier()
  const { prix, t } = await contexteAffichage()

  if (panier.lignes.length === 0) {
    return (
      <section className="sec">
        <div className="wrap">
          <span className="eyebrow">Panier</span>
          <h1 className="sec-titre">Votre panier est vide</h1>
          <p className="lede" style={{ maxWidth: '46ch' }}>
            Ajoutez du matériel depuis le catalogue : le panier se garde 30 jours, même sans compte.
          </p>
          <Link className="btn btn-solid" href="/boutique" style={{ marginTop: '1.5rem' }}>
            Voir le catalogue
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="sec">
      <div className="wrap">
        <span className="eyebrow">Panier</span>
        <h1 className="sec-titre" style={{ marginBottom: '2rem' }}>
          {panier.nombreArticles} article{panier.nombreArticles > 1 ? 's' : ''}
        </h1>

        <div className="panier-grille">
          <div className="panier-lignes">
            {panier.lignes.map((ligne) => (
              <article key={ligne.produitId} className="panier-ligne">
                <Link href={`/produit/${ligne.slug}`} className="panier-visuel">
                  {ligne.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ligne.image} alt="" />
                  ) : (
                    <span className="mono">{ligne.reference ?? 'FNTC'}</span>
                  )}
                </Link>

                <div className="panier-details">
                  <Link href={`/produit/${ligne.slug}`}>
                    <strong>{ligne.nom}</strong>
                  </Link>
                  <span className="mono">{ligne.reference ?? ''}</span>
                  <span className="panier-prix-unite lede">
                    {prix(ligne.prixCentimes)} l’unité
                    {ligne.prixBarreCentimes && (
                      <s> {prix(ligne.prixBarreCentimes)}</s>
                    )}
                  </span>
                </div>

                <div className="panier-actions">
                  <form action={changerQuantite.bind(null, ligne.produitId, ligne.quantite - 1)}>
                    <button type="submit" aria-label="Retirer un exemplaire">−</button>
                  </form>
                  <span className="mono">{ligne.quantite}</span>
                  <form action={changerQuantite.bind(null, ligne.produitId, ligne.quantite + 1)}>
                    <button type="submit" disabled={ligne.quantite >= ligne.stock} aria-label="Ajouter un exemplaire">
                      +
                    </button>
                  </form>
                </div>

                <div className="panier-total-ligne">
                  <strong>{prix(ligne.totalCentimes)}</strong>
                  <form action={retirerDuPanier.bind(null, ligne.produitId)}>
                    <button type="submit" className="lien-retirer">
                      {t('panier.retirer')}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>

          <aside className="panier-resume card-l">
            <h2 className="mono">{t('panier.recapitulatif')}</h2>

            <div className="ligne-resume">
              <span>{t('panier.sousTotal')}</span>
              <span>{prix(panier.sousTotalCentimes)}</span>
            </div>

            {panier.remiseCentimes > 0 && (
              <div className="ligne-resume or">
                <span>Remise {panier.promo ? `(${panier.promo.code})` : ''}</span>
                <span>−{prix(panier.remiseCentimes)}</span>
              </div>
            )}

            <div className="ligne-resume">
              <span>{t('panier.livraison')}</span>
              <span>
                {panier.livraisonCentimes === 0 ? t('panier.offerte') : prix(panier.livraisonCentimes)}
              </span>
            </div>

            <div className="ligne-resume total">
              <span>{t('panier.total')}</span>
              <span>{prix(panier.totalCentimes)}</span>
            </div>

            <form action={appliquerCodePromo} className="forme-promo">
              <label htmlFor="code" className="mono">
                Code promo
              </label>
              <div className="forme-promo-champs">
                <input id="code" name="code" defaultValue={panier.promo?.code ?? ''} placeholder="FNTC10" />
                <button className="btn btn-line" type="submit">
                  Appliquer
                </button>
              </div>
              {searchParams.promo === 'inconnu' && (
                <p className="message-erreur">Ce code est inconnu ou expiré.</p>
              )}
            </form>

            <Link href="/commande" className="btn btn-sig" style={{ width: '100%' }}>
              {t('panier.commander')}
            </Link>
            <Link href="/boutique" className="lien-souligne" style={{ alignSelf: 'center' }}>
              {t('panier.continuer')}
            </Link>
          </aside>
        </div>
      </div>
    </section>
  )
}
