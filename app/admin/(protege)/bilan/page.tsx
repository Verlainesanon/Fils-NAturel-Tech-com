import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireDevises, deviseDeBase } from '@/lib/devises'
import { formaterPrix } from '@/lib/format'
import {
  PERIODES,
  debutPeriode,
  debutPeriodePrecedente,
  calculerMarge,
  evolution,
  type Periode,
} from '@/lib/bilan'

export const metadata: Metadata = { title: 'Bilan' }

const EST_PERIODE = (valeur: string): valeur is Periode =>
  valeur === 'jour' || valeur === 'semaine' || valeur === 'mois' || valeur === 'annee'

/** Une vente ne compte qu'une fois payée et livrée : c'est de l'argent reçu. */
const VENTE_COMPTABILISEE = { statutPaiement: 'payee', statutTraitement: 'livree' } as const

export default async function Bilan({ searchParams }: { searchParams: { periode?: string } }) {
  const periode: Periode = EST_PERIODE(searchParams.periode ?? '') ? (searchParams.periode as Periode) : 'jour'
  const maintenant = new Date()
  const debut = debutPeriode(periode, maintenant)
  const debutAvant = debutPeriodePrecedente(periode, maintenant)

  const [commandes, commandesAvant, achats, achatsAvant, produits, devises] = await Promise.all([
    prisma.order.findMany({
      where: { ...VENTE_COMPTABILISEE, creeLe: { gte: debut } },
      include: { lignes: true },
    }),
    prisma.order.findMany({
      where: { ...VENTE_COMPTABILISEE, creeLe: { gte: debutAvant, lt: debut } },
      include: { lignes: true },
    }),
    prisma.purchase.findMany({ where: { achteLe: { gte: debut } } }),
    prisma.purchase.findMany({ where: { achteLe: { gte: debutAvant, lt: debut } } }),
    prisma.product.findMany({
      where: { supprimeLe: null, statut: { not: 'archive' } },
      select: { id: true, nom: true, reference: true, stock: true, coutCentimes: true, prixCentimes: true, seuilAlerte: true },
    }),
    lireDevises(),
  ])

  const symbole = deviseDeBase(devises).symbole
  const lignes = commandes.flatMap((c) => c.lignes)
  const marge = calculerMarge(lignes)
  const margeAvant = calculerMarge(commandesAvant.flatMap((c) => c.lignes))

  const depense = achats.reduce((t, a) => t + a.prixTotalCentimes, 0)
  const depenseAvant = achatsAvant.reduce((t, a) => t + a.prixTotalCentimes, 0)
  const unitesAchetees = achats.reduce((t, a) => t + a.quantite, 0)

  const stockRestant = produits.reduce((t, p) => t + p.stock, 0)
  const valeurStockAchat = produits.reduce((t, p) => t + p.stock * p.coutCentimes, 0)
  const valeurStockVente = produits.reduce((t, p) => t + p.stock * p.prixCentimes, 0)
  const enRupture = produits.filter((p) => p.stock <= 0).length
  const sousSeuil = produits.filter((p) => p.stock > 0 && p.stock <= p.seuilAlerte).length

  // Classement des articles de la période : ce qui rapporte, et ce qui part.
  const parProduit = new Map<string, { nom: string; quantite: number; ca: number; marge: number }>()
  for (const l of lignes) {
    const cle = l.produitId ?? l.nomProduit
    const entree = parProduit.get(cle) ?? { nom: l.nomProduit, quantite: 0, ca: 0, marge: 0 }
    entree.quantite += l.quantite
    entree.ca += l.prixCentimes * l.quantite
    entree.marge += (l.prixCentimes - l.coutCentimes) * l.quantite
    parProduit.set(cle, entree)
  }
  const classement: { nom: string; quantite: number; ca: number; marge: number }[] = []
  parProduit.forEach((entree) => classement.push(entree))
  classement.sort((a, b) => b.ca - a.ca).splice(10)

  const sansCout = produits.filter((p) => p.coutCentimes <= 0 && p.stock > 0)

  const evolutionCA = evolution(margeAvant.chiffreAffairesCentimes, marge.chiffreAffairesCentimes)
  const evolutionMarge = evolution(margeAvant.margeCentimes, marge.margeCentimes)
  const evolutionDepense = evolution(depenseAvant, depense)

  const libellePeriode = PERIODES.find((p) => p.valeur === periode)?.libelle ?? ''

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Bilan</h1>
          <p>
            {libellePeriode.toLowerCase()} — depuis le{' '}
            {debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}. Seules
            les commandes payées et livrées comptent comme vente.
          </p>
        </div>
        <Link className="btn btn-line" href="/admin/achats">
          Enregistrer un achat
        </Link>
      </header>

      <div className="onglets-periode">
        {PERIODES.map((p) => (
          <Link
            key={p.valeur}
            href={`/admin/bilan?periode=${p.valeur}`}
            className={`puce-periode ${p.valeur === periode ? 'actif' : ''}`}
          >
            {p.libelle}
          </Link>
        ))}
      </div>

      <div className="grille-indicateurs">
        <div className="indicateur">
          <span className="mono">Ventes</span>
          <span className="valeur">{formaterPrix(marge.chiffreAffairesCentimes, symbole)}</span>
          <Evolution valeur={evolutionCA} />
        </div>
        <div className="indicateur">
          <span className="mono">Bénéfice</span>
          <span className="valeur">{formaterPrix(marge.margeCentimes, symbole)}</span>
          <Evolution valeur={evolutionMarge} />
        </div>
        <div className="indicateur">
          <span className="mono">Taux de marge</span>
          <span className="valeur">{marge.tauxMarge} %</span>
          <span className="mono">sur {marge.unitesVendues} unité(s) vendue(s)</span>
        </div>
        <div className="indicateur">
          <span className="mono">Achats de la période</span>
          <span className="valeur">{formaterPrix(depense, symbole)}</span>
          <Evolution valeur={evolutionDepense} inverse />
        </div>
      </div>

      <div className="grille-indicateurs">
        <div className="indicateur">
          <span className="mono">Unités achetées</span>
          <span className="valeur">{unitesAchetees}</span>
          <span className="mono">entrées en stock</span>
        </div>
        <div className="indicateur">
          <span className="mono">Reste en stock</span>
          <span className="valeur">{stockRestant}</span>
          <span className="mono">
            {enRupture} en rupture · {sousSeuil} sous le seuil
          </span>
        </div>
        <div className="indicateur">
          <span className="mono">Stock au prix d’achat</span>
          <span className="valeur">{formaterPrix(valeurStockAchat, symbole)}</span>
          <span className="mono">argent immobilisé</span>
        </div>
        <div className="indicateur">
          <span className="mono">Stock au prix de vente</span>
          <span className="valeur">{formaterPrix(valeurStockVente, symbole)}</span>
          <span className="mono">
            bénéfice à venir {formaterPrix(valeurStockVente - valeurStockAchat, symbole)}
          </span>
        </div>
      </div>

      {sansCout.length > 0 && (
        <p className="alerte">
          {sansCout.length} article(s) en stock n’ont pas de prix d’achat : leur bénéfice est compté comme
          entier. Renseignez-le sur la fiche produit ou enregistrez un achat.
        </p>
      )}

      <div className="cadre-tableau">
        <table className="admin-tableau">
          <thead>
            <tr>
              <th>Article le plus vendu</th>
              <th>Unités</th>
              <th>Ventes</th>
              <th>Bénéfice</th>
            </tr>
          </thead>
          <tbody>
            {classement.length === 0 && (
              <tr>
                <td colSpan={4} className="lede">
                  Aucune vente payée et livrée sur cette période.
                </td>
              </tr>
            )}
            {classement.map((c) => (
              <tr key={c.nom}>
                <td>{c.nom}</td>
                <td>
                  <strong>{c.quantite}</strong>
                </td>
                <td className="mono">{formaterPrix(c.ca, symbole)}</td>
                <td className="mono">{formaterPrix(c.marge, symbole)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/** Comparaison avec la même période précédente : hier, la semaine d'avant… */
function Evolution({ valeur, inverse = false }: { valeur: number | null; inverse?: boolean }) {
  if (valeur === null) return <span className="mono">rien à comparer</span>
  const bon = inverse ? valeur <= 0 : valeur >= 0
  return (
    <span className={`mono ${bon ? 'evolution-haut' : 'evolution-bas'}`}>
      {valeur > 0 ? '+' : ''}
      {valeur} % vs période précédente
    </span>
  )
}
