import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { detaillerPanier } from '@/lib/cart'
import { clientActuel } from '@/lib/auth'
import { formaterPrix } from '@/lib/format'
import FormulaireCommande from '@/components/FormulaireCommande'

export const metadata: Metadata = { title: 'Commande' }

export default async function PageCommande() {
  const panier = await detaillerPanier()
  if (panier.lignes.length === 0) redirect('/panier')

  const client = await clientActuel()
  const symbole = panier.reglages.DEVISE_SYMBOLE

  return (
    <section className="sec">
      <div className="wrap">
        <span className="eyebrow">Commande</span>
        <h1 className="sec-titre" style={{ marginBottom: '2rem' }}>
          Livraison et paiement
        </h1>

        <div className="panier-grille">
          <div className="card-l bloc-formulaire">
            <FormulaireCommande
              defauts={{
                nom: client?.nom ?? '',
                email: client?.email ?? '',
                telephone: client?.telephone ?? '',
              }}
              carteActive={panier.reglages.PAIEMENT_CARTE === 'oui'}
            />
          </div>

          <aside className="panier-resume card-l">
            <h2 className="mono">Votre commande</h2>
            {panier.lignes.map((l) => (
              <div key={l.produitId} className="ligne-resume">
                <span>
                  {l.nom} <span className="mono">×{l.quantite}</span>
                </span>
                <span>{formaterPrix(l.totalCentimes, symbole)}</span>
              </div>
            ))}

            {panier.remiseCentimes > 0 && (
              <div className="ligne-resume or">
                <span>Remise</span>
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

            <Link href="/panier" className="lien-souligne" style={{ alignSelf: 'center' }}>
              Modifier le panier
            </Link>
          </aside>
        </div>
      </div>
    </section>
  )
}
