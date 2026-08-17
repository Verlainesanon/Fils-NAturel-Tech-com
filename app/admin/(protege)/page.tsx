import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireDevises, deviseDeBase } from '@/lib/devises'
import { formaterPrix, formaterDateHeure } from '@/lib/format'

export const metadata: Metadata = { title: 'Tableau de bord' }

function debutDe(joursEnArriere: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - joursEnArriere)
  return d
}

export default async function TableauDeBord() {
  const symbole = deviseDeBase(await lireDevises()).symbole

  const [ventesJour, ventes7, ventes30, aTraiter, ruptures, stockBas, messages, dernieres, clients] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { totalCentimes: true },
        _count: true,
        where: { statutPaiement: 'payee', creeLe: { gte: debutDe(0) } },
      }),
      prisma.order.aggregate({
        _sum: { totalCentimes: true },
        _count: true,
        where: { statutPaiement: 'payee', creeLe: { gte: debutDe(7) } },
      }),
      prisma.order.aggregate({
        _sum: { totalCentimes: true },
        _count: true,
        where: { statutPaiement: 'payee', creeLe: { gte: debutDe(30) } },
      }),
      prisma.order.count({ where: { statutTraitement: 'nouvelle' } }),
      prisma.product.count({ where: { stock: 0, statut: 'publie', supprimeLe: null } }),
      prisma.product.findMany({
        where: { statut: 'publie', supprimeLe: null, stock: { gt: 0, lte: 5 } },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
      prisma.message.count({ where: { auteur: 'client', luParAdmin: false } }),
      prisma.order.findMany({ orderBy: { creeLe: 'desc' }, take: 8 }),
      prisma.customer.count({ where: { supprimeLe: null } }),
    ])

  const panierMoyen =
    ventes30._count > 0 ? Math.round((ventes30._sum.totalCentimes ?? 0) / ventes30._count) : 0

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Tableau de bord</h1>
          <p>Ce qui demande votre attention aujourd’hui.</p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-line" href="/" target="_blank">
            Voir le site
          </Link>
          <Link className="btn btn-solid" href="/admin/produits/nouveau">
            Ajouter un produit
          </Link>
        </div>
      </header>

      {aTraiter > 0 && (
        <div className="alerte">
          <span className="temoin temoin-vide" aria-hidden />
          {aTraiter} commande(s) en attente de préparation.
          <Link className="lien-souligne" href="/admin/commandes?statut=nouvelle" style={{ marginLeft: 'auto' }}>
            Traiter
          </Link>
        </div>
      )}

      {messages > 0 && (
        <div className="alerte alerte-or">
          <span className="temoin temoin-bas" aria-hidden />
          {messages} message(s) client sans réponse.
          <Link className="lien-souligne" href="/admin/messages" style={{ marginLeft: 'auto' }}>
            Répondre
          </Link>
        </div>
      )}

      {ruptures > 0 && (
        <div className="alerte alerte-or">
          <span className="temoin temoin-bas" aria-hidden />
          {ruptures} produit(s) épuisé(s) encore publiés.
          <Link className="lien-souligne" href="/admin/stock" style={{ marginLeft: 'auto' }}>
            Réapprovisionner
          </Link>
        </div>
      )}

      <div className="grille-indicateurs" style={{ marginTop: '1.4rem' }}>
        <div className="indicateur">
          <span className="mono">Encaissé aujourd’hui</span>
          <span className="valeur">{formaterPrix(ventesJour._sum.totalCentimes ?? 0, symbole)}</span>
          <span className="mono">{ventesJour._count} commande(s)</span>
        </div>
        <div className="indicateur">
          <span className="mono">7 derniers jours</span>
          <span className="valeur">{formaterPrix(ventes7._sum.totalCentimes ?? 0, symbole)}</span>
          <span className="mono">{ventes7._count} commande(s)</span>
        </div>
        <div className="indicateur">
          <span className="mono">30 derniers jours</span>
          <span className="valeur">{formaterPrix(ventes30._sum.totalCentimes ?? 0, symbole)}</span>
          <span className="mono">panier moyen {formaterPrix(panierMoyen, symbole)}</span>
        </div>
        <div className="indicateur">
          <span className="mono">Clients</span>
          <span className="valeur">{clients}</span>
          <span className="mono">fiches enregistrées</span>
        </div>
      </div>

      <div className="deux-colonnes">
        <section>
          <h2 className="admin-groupe" style={{ paddingLeft: 0 }}>
            Dernières commandes
          </h2>
          <div className="cadre-tableau">
            <table className="admin-tableau">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>État</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {dernieres.length === 0 && (
                  <tr>
                    <td colSpan={5} className="lede">
                      Aucune commande pour le moment.
                    </td>
                  </tr>
                )}
                {dernieres.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/commandes/${c.id}`} className="or">
                        {c.numero}
                      </Link>
                    </td>
                    <td>{c.nomContact}</td>
                    <td className="mono">{formaterDateHeure(c.creeLe)}</td>
                    <td>
                      <span className={`etat etat-${c.statutTraitement}`}>{c.statutTraitement}</span>
                    </td>
                    <td>{formaterPrix(c.totalCentimes, symbole)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="admin-groupe" style={{ paddingLeft: 0 }}>
            Stock au plus bas
          </h2>
          <div className="cadre-tableau">
            <table className="admin-tableau" style={{ minWidth: 0 }}>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Restant</th>
                </tr>
              </thead>
              <tbody>
                {stockBas.length === 0 && (
                  <tr>
                    <td colSpan={2} className="lede">
                      Aucun produit sous le seuil.
                    </td>
                  </tr>
                )}
                {stockBas.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/produits/${p.id}`}>{p.nom}</Link>
                    </td>
                    <td>
                      <span className="temoin temoin-bas" aria-hidden /> {p.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
