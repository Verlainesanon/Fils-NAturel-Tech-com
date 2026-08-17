import Link from 'next/link'
import type { Metadata } from 'next'
import { detaillerPanier } from '@/lib/cart'
import { formaterPrix } from '@/lib/format'
import { changerQuantite, retirerDuPanier, appliquerCodePromo } from '@/app/actions/panier'

export const metadata: Metadata = { title: 'Panier' }

export default async function Panier({ searchParams }: { searchParams: { promo?: string } }) {
  const panier = await detaillerPanier()
  const symbole = panier.reglages.DEVISE_SYMBOLE

  if (panier.lignes.length === 0) {
    return (
      <section className="section piste">
        <div className="contenu">
          <span className="surtitre">Panier</span>
          <h1 className="titre-section">Votre panier est vide</h1>
          <p className="doux" style={{ maxWidth: '46ch' }}>
            Ajoutez du matériel depuis le catalogue : le panier se garde 30 jours, même sans compte.
          </p>
          <Link className="bouton" href="/boutique" style={{ marginTop: '1.5rem' }}>
            Voir le catalogue
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section piste">
      <div className="contenu">
        <span className="surtitre">Panier</span>
        <h1 className="titre-section" style={{ marginBottom: '2rem' }}>
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
                  <span className="panier-prix-unite doux">
                    {formaterPrix(ligne.prixCentimes, symbole)} l’unité
                    {ligne.prixBarreCentimes && (
                      <s> {formaterPrix(ligne.prixBarreCentimes, symbole)}</s>
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
                  <strong>{formaterPrix(ligne.totalCentimes, symbole)}</strong>
                  <form action={retirerDuPanier.bind(null, ligne.produitId)}>
                    <button type="submit" className="lien-retirer">
                      Retirer
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>

          <aside className="panier-resume panneau">
            <h2 className="mono">Récapitulatif</h2>

            <div className="ligne-resume">
              <span>Sous-total</span>
              <span>{formaterPrix(panier.sousTotalCentimes, symbole)}</span>
            </div>

            {panier.remiseCentimes > 0 && (
              <div className="ligne-resume or">
                <span>Remise {panier.promo ? `(${panier.promo.code})` : ''}</span>
                <span>−{formaterPrix(panier.remiseCentimes, symbole)}</span>
              </div>
            )}

            <div className="ligne-resume">
              <span>Livraison</span>
              <span>
                {panier.livraisonCentimes === 0 ? 'Offerte' : formaterPrix(panier.livraisonCentimes, symbole)}
              </span>
            </div>

            <div className="ligne-resume total">
              <span>Total</span>
              <span>{formaterPrix(panier.totalCentimes, symbole)}</span>
            </div>

            <form action={appliquerCodePromo} className="forme-promo">
              <label htmlFor="code" className="mono">
                Code promo
              </label>
              <div className="forme-promo-champs">
                <input id="code" name="code" defaultValue={panier.promo?.code ?? ''} placeholder="FNTC10" />
                <button className="bouton bouton-fantome" type="submit">
                  Appliquer
                </button>
              </div>
              {searchParams.promo === 'inconnu' && (
                <p className="message-erreur">Ce code est inconnu ou expiré.</p>
              )}
            </form>

            <Link href="/commande" className="bouton bouton-or" style={{ width: '100%' }}>
              Passer la commande
            </Link>
            <Link href="/boutique" className="lien-souligne" style={{ alignSelf: 'center' }}>
              Continuer mes achats
            </Link>
          </aside>
        </div>
      </div>
    </section>
  )
}
