import Link from 'next/link'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { lireReglages } from '@/lib/settings'
import { formaterPrix, formaterDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Clients' }

export default async function Clients({ searchParams }: { searchParams: { q?: string } }) {
  const recherche = (searchParams.q ?? '').trim()
  const where: Prisma.CustomerWhereInput = {
    supprimeLe: null,
    ...(recherche
      ? { OR: [{ nom: { contains: recherche } }, { email: { contains: recherche } }] }
      : {}),
  }

  const [clients, reglages] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { creeLe: 'desc' },
      take: 100,
      include: { commandes: { select: { totalCentimes: true, statutPaiement: true } } },
    }),
    lireReglages(),
  ])
  const symbole = reglages.DEVISE_SYMBOLE

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Clients</h1>
          <p>Les acheteurs sans compte apparaissent aussi : leur fiche est créée à la commande.</p>
        </div>
      </header>

      <form className="filtres-admin" action="/admin/clients">
        <input name="q" defaultValue={recherche} placeholder="Nom ou email" aria-label="Rechercher" />
        <button className="btn btn-line" type="submit">
          Filtrer
        </button>
      </form>

      <div className="cadre-tableau">
        <table className="admin-tableau">
          <thead>
            <tr>
              <th>Client</th>
              <th>Compte</th>
              <th>Badge</th>
              <th>Commandes</th>
              <th>Total dépensé</th>
              <th>Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="lede">
                  Aucun client.
                </td>
              </tr>
            )}
            {clients.map((c) => {
              const payees = c.commandes.filter((o) => o.statutPaiement === 'payee')
              const total = payees.reduce((t, o) => t + o.totalCentimes, 0)
              return (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/clients/${c.id}`}>
                      <strong>{c.nom}</strong>
                    </Link>
                    <br />
                    <span className="mono">{c.email}</span>
                  </td>
                  <td className="lede">{c.motDePasse ? 'Avec compte' : 'Invité'}</td>
                  <td>
                    <span className={`badge-fidelite badge-${c.badge}`}>{c.badge}</span>
                  </td>
                  <td>{c.commandes.length}</td>
                  <td>{formaterPrix(total, symbole)}</td>
                  <td className="mono">{formaterDate(c.creeLe)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
