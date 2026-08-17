import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireReglages } from '@/lib/settings'
import { formaterPrix } from '@/lib/format'

export const metadata: Metadata = { title: 'Commande confirmée' }

export default async function Merci({
  params,
  searchParams,
}: {
  params: { numero: string }
  searchParams: { jeton?: string }
}) {
  const commande = await prisma.order.findUnique({
    where: { numero: params.numero },
    include: { lignes: true },
  })
  if (!commande || commande.jetonInvite !== searchParams.jeton) notFound()

  const reglages = await lireReglages()
  const symbole = reglages.DEVISE_SYMBOLE

  return (
    <section className="section piste">
      <div className="contenu" style={{ maxWidth: '52rem' }}>
        <span className="surtitre">Commande {commande.numero}</span>
        <h1 className="titre-section">Merci, c’est enregistré.</h1>
        <p className="doux" style={{ maxWidth: '52ch' }}>
          Nous préparons votre commande. Vous recevrez un message à {commande.emailContact} dès qu’elle part.
          Conservez ce lien : il vous permet de suivre l’avancement.
        </p>

        <div className="panneau recap-commande">
          {commande.lignes.map((l) => (
            <div key={l.id} className="ligne-resume">
              <span>
                {l.nomProduit} <span className="mono">×{l.quantite}</span>
              </span>
              <span>{formaterPrix(l.prixCentimes * l.quantite, symbole)}</span>
            </div>
          ))}
          <div className="ligne-resume total">
            <span>Total</span>
            <span>{formaterPrix(commande.totalCentimes, symbole)}</span>
          </div>
          <div className="ligne-resume">
            <span>Livraison</span>
            <span className="doux">
              {commande.adresseTexte}, {commande.villeLivraison}
            </span>
          </div>
          <div className="ligne-resume">
            <span>Paiement</span>
            <span className="doux">
              {commande.modePaiement === 'hors_ligne'
                ? 'À la livraison'
                : commande.modePaiement === 'virement'
                  ? 'Virement bancaire'
                  : 'Carte bancaire'}
            </span>
          </div>
        </div>

        <div className="hero-actions" style={{ marginTop: '1.8rem' }}>
          <Link className="bouton" href="/boutique">
            Continuer mes achats
          </Link>
          <Link className="lien-souligne" href={`/commande/suivi?numero=${commande.numero}&email=${commande.emailContact}`}>
            Suivre cette commande
          </Link>
        </div>
      </div>
    </section>
  )
}
