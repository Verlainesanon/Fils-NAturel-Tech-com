import Link from 'next/link'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { lireDevises, deviseDeBase } from '@/lib/devises'
import { formaterPrix, formaterDateHeure } from '@/lib/format'

export const metadata: Metadata = { title: 'Commandes' }

const STATUTS = ['nouvelle', 'preparee', 'expediee', 'livree', 'annulee']

export default async function Commandes({
  searchParams,
}: {
  searchParams: { statut?: string; paiement?: string; q?: string }
}) {
  const recherche = (searchParams.q ?? '').trim()
  const where: Prisma.OrderWhereInput = {
    ...(searchParams.statut ? { statutTraitement: searchParams.statut } : {}),
    ...(searchParams.paiement ? { statutPaiement: searchParams.paiement } : {}),
    ...(recherche
      ? {
          OR: [
            { numero: { contains: recherche } },
            { nomContact: { contains: recherche } },
            { emailContact: { contains: recherche } },
          ],
        }
      : {}),
  }

  const [commandes] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { creeLe: 'desc' }, take: 100, include: { lignes: true } }),
  ])
  const symbole = deviseDeBase(await lireDevises()).symbole

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Commandes</h1>
          <p>{commandes.length} commande(s) affichée(s).</p>
        </div>
        <Link className="btn btn-sig" href="/admin/commandes/nouvelle">
          Saisir une commande
        </Link>
      </header>

      <form className="filtres-admin" action="/admin/commandes">
        <input name="q" defaultValue={recherche} placeholder="Numéro, nom ou email" aria-label="Rechercher" />
        <select name="statut" defaultValue={searchParams.statut ?? ''} aria-label="Traitement">
          <option value="">Tous les états</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="paiement" defaultValue={searchParams.paiement ?? ''} aria-label="Paiement">
          <option value="">Tous les paiements</option>
          <option value="en_attente">En attente</option>
          <option value="payee">Payée</option>
          <option value="echouee">Échouée</option>
          <option value="remboursee">Remboursée</option>
        </select>
        <button className="btn btn-line" type="submit">
          Filtrer
        </button>
      </form>

      <div className="cadre-tableau">
        <table className="admin-tableau">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Client</th>
              <th>Date</th>
              <th>Articles</th>
              <th>Paiement</th>
              <th>Traitement</th>
              <th>Total</th>
              <th className="colonne-actions">Fiche</th>
            </tr>
          </thead>
          <tbody>
            {commandes.length === 0 && (
              <tr>
                <td colSpan={8} className="lede">
                  Aucune commande ne correspond à ces filtres.
                </td>
              </tr>
            )}
            {commandes.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/commandes/${c.id}`} className="or">
                    <strong>{c.numero}</strong>
                  </Link>
                </td>
                <td>
                  {c.nomContact}
                  <br />
                  <span className="mono">{c.emailContact}</span>
                </td>
                <td className="mono">{formaterDateHeure(c.creeLe)}</td>
                {/* Ce qui a été commandé se lit ici, sans ouvrir la fiche. */}
                <td className="articles-commande">
                  {c.lignes.map((l) => (
                    <span key={l.id}>
                      <b>{l.quantite} ×</b> {l.nomProduit}
                    </span>
                  ))}
                </td>
                <td>
                  <span className={`etat etat-${c.statutPaiement}`}>{c.statutPaiement}</span>
                </td>
                <td>
                  <span className={`etat etat-${c.statutTraitement}`}>{c.statutTraitement}</span>
                </td>
                <td>
                  <strong>{formaterPrix(c.totalCentimes, symbole)}</strong>
                </td>
                <td className="colonne-actions">
                  <Link className="bouton-mini" href={`/admin/commandes/${c.id}`}>
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
