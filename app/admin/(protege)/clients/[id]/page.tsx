import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireReglages } from '@/lib/settings'
import { formaterPrix, formaterDateHeure } from '@/lib/format'
import { majClient } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Fiche client' }

export default async function FicheClient({ params }: { params: { id: string } }) {
  const client = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      commandes: { orderBy: { creeLe: 'desc' }, include: { lignes: true } },
      adresses: true,
      conversations: { include: { messages: { take: 1, orderBy: { creeLe: 'desc' } } } },
    },
  })
  if (!client) notFound()

  const reglages = await lireReglages()
  const symbole = reglages.DEVISE_SYMBOLE
  const total = client.commandes
    .filter((c) => c.statutPaiement === 'payee')
    .reduce((t, c) => t + c.totalCentimes, 0)

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>{client.nom}</h1>
          <p>
            {client.email}
            {client.telephone ? ` · ${client.telephone}` : ''} ·{' '}
            {client.motDePasse ? 'compte actif' : 'client invité'}
          </p>
        </div>
        <Link className="bouton bouton-fantome" href="/admin/clients">
          Retour à la liste
        </Link>
      </header>

      <div className="grille-indicateurs">
        <div className="indicateur">
          <span className="mono">Commandes</span>
          <span className="valeur">{client.commandes.length}</span>
        </div>
        <div className="indicateur">
          <span className="mono">Total payé</span>
          <span className="valeur">{formaterPrix(total, symbole)}</span>
        </div>
        <div className="indicateur">
          <span className="mono">Badge</span>
          <span className="valeur">{client.badge}</span>
        </div>
      </div>

      <div className="deux-colonnes">
        <div className="cadre-tableau">
          <table className="admin-tableau">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Date</th>
                <th>Articles</th>
                <th>État</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {client.commandes.length === 0 && (
                <tr>
                  <td colSpan={5} className="doux">
                    Aucune commande.
                  </td>
                </tr>
              )}
              {client.commandes.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/commandes/${c.id}`} className="or">
                      {c.numero}
                    </Link>
                  </td>
                  <td className="mono">{formaterDateHeure(c.creeLe)}</td>
                  <td>{c.lignes.reduce((t, l) => t + l.quantite, 0)}</td>
                  <td>
                    <span className={`etat etat-${c.statutTraitement}`}>{c.statutTraitement}</span>
                  </td>
                  <td>{formaterPrix(c.totalCentimes, symbole)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <FormulaireAdmin action={majClient} className="admin-formulaire">
          <h2>Badge et notes</h2>
          <input type="hidden" name="id" value={client.id} />

          <div className="champ large">
            <label htmlFor="badge">Badge de fidélité</label>
            <select id="badge" name="badge" defaultValue={client.badge}>
              <option value="aucun">Aucun</option>
              <option value="bronze">Bronze</option>
              <option value="argent">Argent</option>
              <option value="or">Or</option>
            </select>
            <span className="mono">
              Recalculé automatiquement à chaque commande payée. Une valeur choisie ici sera écrasée au prochain
              achat.
            </span>
          </div>

          <div className="champ large">
            <label htmlFor="notesInternes">Notes internes</label>
            <textarea
              id="notesInternes"
              name="notesInternes"
              rows={4}
              defaultValue={client.notesInternes ?? ''}
              placeholder="Visible uniquement par l’équipe"
            />
          </div>

          <div className="pied-formulaire">
            <button className="bouton" type="submit">
              Enregistrer
            </button>
          </div>
        </FormulaireAdmin>
      </div>
    </>
  )
}
