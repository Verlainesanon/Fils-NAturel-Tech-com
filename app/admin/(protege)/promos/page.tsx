import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireReglages } from '@/lib/settings'
import { formaterPrix, formaterDate } from '@/lib/format'
import { enregistrerPromo, basculerPromo } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Promotions' }

export default async function Promotions({ searchParams }: { searchParams: { modifier?: string } }) {
  const [promos, categories, reglages] = await Promise.all([
    prisma.promo.findMany({ orderBy: { creeLe: 'desc' } }),
    prisma.category.findMany({ orderBy: { ordre: 'asc' } }),
    lireReglages(),
  ])
  const symbole = reglages.DEVISE_SYMBOLE
  const enEdition = promos.find((p) => p.id === searchParams.modifier) ?? null

  const decrire = (promo: (typeof promos)[number]) =>
    promo.type === 'pourcentage'
      ? `−${promo.valeur} %`
      : promo.type === 'montant'
        ? `−${formaterPrix(promo.valeur, symbole)}`
        : 'Livraison offerte'

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Promotions</h1>
          <p>Codes saisis par le client au moment du panier.</p>
        </div>
      </header>

      <div className="deux-colonnes">
        <div className="cadre-tableau">
          <table className="admin-tableau">
            <thead>
              <tr>
                <th>Code</th>
                <th>Remise</th>
                <th>Minimum</th>
                <th>Période</th>
                <th>Usages</th>
                <th className="colonne-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 && (
                <tr>
                  <td colSpan={6} className="doux">
                    Aucun code promo.
                  </td>
                </tr>
              )}
              {promos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.code}</strong>
                    <br />
                    <span className={`etat ${p.actif ? 'etat-payee' : 'etat-annulee'}`}>
                      {p.actif ? 'actif' : 'inactif'}
                    </span>
                  </td>
                  <td>{decrire(p)}</td>
                  <td className="doux">
                    {p.minimumCentimes > 0 ? formaterPrix(p.minimumCentimes, symbole) : '—'}
                  </td>
                  <td className="mono">
                    {p.debut || p.fin ? `${formaterDate(p.debut)} → ${formaterDate(p.fin)}` : 'sans limite'}
                  </td>
                  <td className="mono">
                    {p.usages}
                    {p.usagesMax ? ` / ${p.usagesMax}` : ''}
                  </td>
                  <td className="colonne-actions">
                    <a className="bouton-mini" href={`/admin/promos?modifier=${p.id}`}>
                      Modifier
                    </a>{' '}
                    <FormulaireAdmin action={basculerPromo.bind(null, p.id, !p.actif)} className="ligne-action">
                      <button className="bouton-mini" type="submit">
                        {p.actif ? 'Désactiver' : 'Activer'}
                      </button>
                    </FormulaireAdmin>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <FormulaireAdmin action={enregistrerPromo} className="admin-formulaire">
          <h2>{enEdition ? 'Modifier le code' : 'Nouveau code'}</h2>
          {enEdition && <input type="hidden" name="id" value={enEdition.id} />}

          <div className="champ">
            <label htmlFor="code">Code</label>
            <input id="code" name="code" defaultValue={enEdition?.code ?? ''} placeholder="FNTC10" required />
          </div>

          <div className="champ">
            <label htmlFor="type">Type de remise</label>
            <select id="type" name="type" defaultValue={enEdition?.type ?? 'pourcentage'}>
              <option value="pourcentage">Pourcentage</option>
              <option value="montant">Montant fixe</option>
              <option value="livraison">Livraison offerte</option>
            </select>
          </div>

          <div className="champ">
            <label htmlFor="valeur">Valeur (% ou {symbole})</label>
            <input
              id="valeur"
              name="valeur"
              defaultValue={
                enEdition
                  ? enEdition.type === 'montant'
                    ? (enEdition.valeur / 100).toFixed(2)
                    : String(enEdition.valeur)
                  : ''
              }
            />
          </div>

          <div className="champ">
            <label htmlFor="minimum">Commande minimum ({symbole})</label>
            <input
              id="minimum"
              name="minimum"
              defaultValue={enEdition ? (enEdition.minimumCentimes / 100).toFixed(2) : ''}
            />
          </div>

          <div className="champ">
            <label htmlFor="portee">S’applique à</label>
            <select id="portee" name="portee" defaultValue={enEdition?.portee ?? 'tout'}>
              <option value="tout">Toute la boutique</option>
              <option value="categorie">Certaines catégories</option>
            </select>
          </div>

          <div className="champ">
            <label htmlFor="cibles">Catégories concernées</label>
            <select id="cibles" name="cibles" multiple defaultValue={JSON.parse(enEdition?.cibleIds ?? '[]')}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="champ">
            <label htmlFor="debut">Début</label>
            <input
              id="debut"
              name="debut"
              type="date"
              defaultValue={enEdition?.debut ? enEdition.debut.toISOString().slice(0, 10) : ''}
            />
          </div>

          <div className="champ">
            <label htmlFor="fin">Fin</label>
            <input
              id="fin"
              name="fin"
              type="date"
              defaultValue={enEdition?.fin ? enEdition.fin.toISOString().slice(0, 10) : ''}
            />
          </div>

          <div className="champ">
            <label htmlFor="usagesMax">Utilisations maximum</label>
            <input id="usagesMax" name="usagesMax" type="number" min={0} defaultValue={enEdition?.usagesMax ?? ''} />
          </div>

          <div className="champ">
            <label htmlFor="usagesMaxParClient">Maximum par client</label>
            <input
              id="usagesMaxParClient"
              name="usagesMaxParClient"
              type="number"
              min={0}
              defaultValue={enEdition?.usagesMaxParClient ?? ''}
            />
          </div>

          <label className="case-a-cocher large">
            <input type="checkbox" name="actif" defaultChecked={enEdition?.actif ?? true} />
            Code actif
          </label>

          <div className="pied-formulaire">
            <button className="bouton" type="submit">
              {enEdition ? 'Enregistrer' : 'Créer le code'}
            </button>
            {enEdition && (
              <a className="bouton bouton-fantome" href="/admin/promos">
                Annuler
              </a>
            )}
          </div>
        </FormulaireAdmin>
      </div>
    </>
  )
}
