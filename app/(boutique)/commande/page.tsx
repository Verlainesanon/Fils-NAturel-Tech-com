import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { detaillerPanier } from '@/lib/cart'
import { contexteAffichage } from '@/lib/affichage'
import { clientActuel } from '@/lib/auth'
import FormulaireCommande from '@/components/FormulaireCommande'

export const metadata: Metadata = { title: 'Commande' }

export default async function PageCommande() {
  const panier = await detaillerPanier()
  if (panier.lignes.length === 0) redirect('/panier')

  const client = await clientActuel()
  const { prix } = await contexteAffichage()

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
                <span>{prix(l.totalCentimes)}</span>
              </div>
            ))}

            {panier.remiseCentimes > 0 && (
              <div className="ligne-resume or">
                <span>Remise</span>
                <span>−{prix(panier.remiseCentimes)}</span>
              </div>
            )}

            <div className="ligne-resume">
              <span>Livraison</span>
              <span>
                {panier.livraisonCentimes === 0 ? 'Offerte' : prix(panier.livraisonCentimes)}
              </span>
            </div>

            <div className="ligne-resume total">
              <span>Total</span>
              <span>{prix(panier.totalCentimes)}</span>
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
