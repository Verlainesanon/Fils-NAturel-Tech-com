import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { adminActuel } from '@/lib/auth'
import { peut } from '@/lib/roles'
import { formaterDateHeure } from '@/lib/format'

export const metadata: Metadata = { title: 'Journal d’audit' }

export default async function Audit({ searchParams }: { searchParams: { auteur?: string; action?: string } }) {
  const admin = await adminActuel()
  if (!peut(admin?.role, 'proprietaire')) redirect('/admin')

  const entrees = await prisma.auditLog.findMany({
    where: {
      ...(searchParams.auteur ? { auteur: searchParams.auteur } : {}),
      ...(searchParams.action ? { action: searchParams.action } : {}),
    },
    orderBy: { creeLe: 'desc' },
    take: 200,
  })

  const auteurs = Array.from(new Set(entrees.map((e) => e.auteur)))
  const actions = Array.from(new Set(entrees.map((e) => e.action)))

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Journal d’audit</h1>
          <p>Toute action modifiante est enregistrée ici. Ce journal ne peut pas être effacé.</p>
        </div>
      </header>

      <form className="filtres-admin" action="/admin/audit">
        <select name="auteur" defaultValue={searchParams.auteur ?? ''} aria-label="Auteur">
          <option value="">Tous les auteurs</option>
          {auteurs.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select name="action" defaultValue={searchParams.action ?? ''} aria-label="Type d’action">
          <option value="">Toutes les actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button className="bouton bouton-fantome" type="submit">
          Filtrer
        </button>
      </form>

      <div className="cadre-tableau">
        <table className="admin-tableau">
          <thead>
            <tr>
              <th>Date</th>
              <th>Auteur</th>
              <th>Action</th>
              <th>Cible</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            {entrees.length === 0 && (
              <tr>
                <td colSpan={5} className="doux">
                  Aucune entrée pour ces filtres.
                </td>
              </tr>
            )}
            {entrees.map((e) => (
              <tr key={e.id}>
                <td className="mono">{formaterDateHeure(e.creeLe)}</td>
                <td>{e.auteur}</td>
                <td>
                  <span className="etat">{e.action}</span>
                </td>
                <td className="mono">{e.cible}</td>
                <td className="doux">{e.details || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
