import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { clientActuel } from '@/lib/auth'
import { deconnecter } from '@/app/actions/compte'
import { lireReglages } from '@/lib/settings'
import { formaterPrix, formaterDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Mon compte' }

const BADGES: Record<string, string> = {
  aucun: 'Nouveau client',
  bronze: 'Bronze',
  argent: 'Argent',
  or: 'Or',
}

export default async function EspaceCompte() {
  const client = await clientActuel()
  if (!client) redirect('/compte/connexion')

  const [commandes, reglages] = await Promise.all([
    prisma.order.findMany({
      where: { clientId: client.id },
      orderBy: { creeLe: 'desc' },
      include: { lignes: true },
    }),
    lireReglages(),
  ])
  const symbole = reglages.DEVISE_SYMBOLE

  return (
    <section className="section piste">
      <div className="contenu">
        <div className="entete-section">
          <div>
            <span className="surtitre">Mon compte</span>
            <h1 className="titre-section">Bonjour {client.nom.split(' ')[0]}</h1>
          </div>
          <form action={deconnecter}>
            <button className="bouton bouton-fantome" type="submit">
              Se déconnecter
            </button>
          </form>
        </div>

        <div className="grille-compte">
          <div className="panneau bloc-formulaire carte-badge">
            <span className={`badge-fidelite badge-${client.badge}`}>{BADGES[client.badge] ?? client.badge}</span>
            <p className="mono">{commandes.length} commande(s)</p>
            <p className="doux" style={{ margin: 0, fontSize: '0.9rem' }}>
              {client.badge === 'or'
                ? 'Vous avez le badge le plus élevé. Merci pour votre fidélité.'
                : `Passez ${
                    client.badge === 'argent'
                      ? reglages.BADGE_OR
                      : client.badge === 'bronze'
                        ? reglages.BADGE_ARGENT
                        : reglages.BADGE_BRONZE
                  } commande(s) au total pour atteindre le palier suivant.`}
            </p>
          </div>

          <div className="panneau bloc-formulaire">
            <h2 className="mono">Coordonnées</h2>
            <p style={{ margin: 0 }}>{client.nom}</p>
            <p className="doux" style={{ margin: 0 }}>{client.email}</p>
            {client.telephone && <p className="doux" style={{ margin: 0 }}>{client.telephone}</p>}
          </div>
        </div>

        <h2 className="titre-section" style={{ fontSize: '1.35rem', marginTop: '2.5rem' }}>
          Mes commandes
        </h2>

        {commandes.length === 0 ? (
          <p className="vide" style={{ marginTop: '1rem' }}>
            Aucune commande pour le moment. <Link href="/boutique" className="or">Voir le catalogue</Link>
          </p>
        ) : (
          <div className="liste-commandes">
            {commandes.map((c) => (
              <article key={c.id} className="panneau ligne-commande">
                <div>
                  <strong>{c.numero}</strong>
                  <span className="mono">{formaterDate(c.creeLe)}</span>
                </div>
                <span className="doux">
                  {c.lignes.length} article{c.lignes.length > 1 ? 's' : ''}
                </span>
                <span className={`etiquette etat-${c.statutTraitement}`}>{c.statutTraitement}</span>
                <strong>{formaterPrix(c.totalCentimes, symbole)}</strong>
                <Link className="lien-souligne" href={`/commande/suivi?numero=${c.numero}&email=${c.emailContact}`}>
                  Suivre
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
