import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireReglages } from '@/lib/settings'
import { formaterPrix, formaterDateHeure } from '@/lib/format'

export const metadata: Metadata = { title: 'Suivre ma commande' }

const ETAPES = [
  { cle: 'nouvelle', libelle: 'Reçue' },
  { cle: 'preparee', libelle: 'Préparée' },
  { cle: 'expediee', libelle: 'Expédiée' },
  { cle: 'livree', libelle: 'Livrée' },
]

export default async function Suivi({
  searchParams,
}: {
  searchParams: { numero?: string; email?: string }
}) {
  const numero = (searchParams.numero ?? '').trim()
  const email = (searchParams.email ?? '').trim().toLowerCase()
  const reglages = await lireReglages()

  const commande =
    numero && email
      ? await prisma.order.findFirst({
          where: { numero, emailContact: email },
          include: { lignes: true, evenements: { orderBy: { creeLe: 'asc' } } },
        })
      : null

  const indexEtape = commande ? ETAPES.findIndex((e) => e.cle === commande.statutTraitement) : -1

  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: '52rem' }}>
        <span className="eyebrow">Suivi</span>
        <h1 className="sec-titre">Où en est ma commande ?</h1>

        <form className="formulaire card-l bloc-formulaire" action="/commande/suivi" style={{ marginTop: '1.6rem' }}>
          <div className="paire-champs">
            <div className="champ">
              <label htmlFor="numero">Numéro de commande</label>
              <input id="numero" name="numero" defaultValue={numero} placeholder="FN-260816-A1B2" required />
            </div>
            <div className="champ">
              <label htmlFor="email">Email de la commande</label>
              <input id="email" name="email" type="email" defaultValue={email} required />
            </div>
          </div>
          <button className="btn btn-solid" type="submit">
            Rechercher
          </button>
        </form>

        {numero && email && !commande && (
          <p className="message-erreur" style={{ marginTop: '1.5rem' }}>
            Aucune commande ne correspond à ce numéro et cet email.
          </p>
        )}

        {commande && (
          <div className="card-l recap-commande" style={{ marginTop: '1.8rem' }}>
            <div className="ligne-resume">
              <strong>{commande.numero}</strong>
              <span className="mono">{formaterDateHeure(commande.creeLe)}</span>
            </div>

            {commande.statutTraitement === 'annulee' ? (
              <p className="message-erreur">Cette commande a été annulée.</p>
            ) : (
              <ol className="progression">
                {ETAPES.map((etape, i) => (
                  <li key={etape.cle} className={i <= indexEtape ? 'faite' : ''}>
                    <span className="temoin" aria-hidden />
                    {etape.libelle}
                  </li>
                ))}
              </ol>
            )}

            {commande.suivi && (
              <div className="ligne-resume">
                <span>Numéro de suivi</span>
                <span className="mono">{commande.suivi}</span>
              </div>
            )}

            {commande.lignes.map((l) => (
              <div key={l.id} className="ligne-resume">
                <span>
                  {l.nomProduit} <span className="mono">×{l.quantite}</span>
                </span>
                <span>{formaterPrix(l.prixCentimes * l.quantite, reglages.DEVISE_SYMBOLE)}</span>
              </div>
            ))}

            <div className="ligne-resume total">
              <span>Total</span>
              <span>{formaterPrix(commande.totalCentimes, reglages.DEVISE_SYMBOLE)}</span>
            </div>

            <div className="journal-evenements">
              {commande.evenements.map((e) => (
                <p key={e.id} className="mono">
                  {formaterDateHeure(e.creeLe)} — {e.libelle}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
