import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formaterDate } from '@/lib/format'
import { enregistrerBanniere, supprimerBanniere } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Bannières' }

export default async function Bannieres({ searchParams }: { searchParams: { modifier?: string } }) {
  const bannieres = await prisma.banner.findMany({ orderBy: { ordre: 'asc' } })
  const enEdition = bannieres.find((b) => b.id === searchParams.modifier) ?? null

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Bannières</h1>
          <p>Bandeau affiché en haut de la page d’accueil. La première bannière active est retenue.</p>
        </div>
      </header>

      <div className="deux-colonnes">
        <div className="cadre-tableau">
          <table className="admin-tableau">
            <thead>
              <tr>
                <th>Texte</th>
                <th>Lien</th>
                <th>Couleur</th>
                <th>Période</th>
                <th>Active</th>
                <th className="colonne-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bannieres.length === 0 && (
                <tr>
                  <td colSpan={6} className="doux">
                    Aucune bannière.
                  </td>
                </tr>
              )}
              {bannieres.map((b) => (
                <tr key={b.id}>
                  <td>{b.texte}</td>
                  <td className="mono">{b.lien ?? '—'}</td>
                  <td className="doux">{b.couleur}</td>
                  <td className="mono">
                    {b.debut || b.fin ? `${formaterDate(b.debut)} → ${formaterDate(b.fin)}` : 'sans limite'}
                  </td>
                  <td>{b.actif ? 'Oui' : 'Non'}</td>
                  <td className="colonne-actions">
                    <a className="bouton-mini" href={`/admin/bannieres?modifier=${b.id}`}>
                      Modifier
                    </a>{' '}
                    <FormulaireAdmin
                      action={supprimerBanniere.bind(null, b.id)}
                      className="ligne-action"
                      confirmation="Supprimer cette bannière ?"
                    >
                      <button className="bouton-mini danger" type="submit">
                        Supprimer
                      </button>
                    </FormulaireAdmin>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <FormulaireAdmin action={enregistrerBanniere} className="admin-formulaire">
          <h2>{enEdition ? 'Modifier la bannière' : 'Nouvelle bannière'}</h2>
          {enEdition && <input type="hidden" name="id" value={enEdition.id} />}

          <div className="champ large">
            <label htmlFor="texte">Texte</label>
            <input id="texte" name="texte" defaultValue={enEdition?.texte ?? ''} required />
          </div>

          <div className="champ large">
            <label htmlFor="lien">Lien (facultatif)</label>
            <input id="lien" name="lien" defaultValue={enEdition?.lien ?? ''} placeholder="/boutique?tri=promo" />
          </div>

          <div className="champ">
            <label htmlFor="couleur">Couleur</label>
            <select id="couleur" name="couleur" defaultValue={enEdition?.couleur ?? 'rouge'}>
              <option value="rouge">Rouge</option>
              <option value="or">Or</option>
              <option value="sombre">Sombre</option>
            </select>
          </div>

          <div className="champ">
            <label htmlFor="ordre">Ordre</label>
            <input id="ordre" name="ordre" type="number" defaultValue={enEdition?.ordre ?? 0} />
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

          <label className="case-a-cocher large">
            <input type="checkbox" name="actif" defaultChecked={enEdition?.actif ?? true} />
            Bannière active
          </label>

          <div className="pied-formulaire">
            <button className="bouton" type="submit">
              {enEdition ? 'Enregistrer' : 'Créer'}
            </button>
            {enEdition && (
              <a className="bouton bouton-fantome" href="/admin/bannieres">
                Annuler
              </a>
            )}
          </div>
        </FormulaireAdmin>
      </div>
    </>
  )
}
