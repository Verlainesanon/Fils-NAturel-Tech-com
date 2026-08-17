import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formaterDate } from '@/lib/format'
import { ajouterMedia, supprimerMedia } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'
import ChampImages from '@/components/admin/ChampImages'

export const metadata: Metadata = { title: 'Médiathèque' }

export default async function Medias() {
  const medias = await prisma.media.findMany({ orderBy: { creeLe: 'desc' } })

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Médiathèque</h1>
          <p>Images réutilisables dans les contenus. Redimensionnées à l’envoi.</p>
        </div>
      </header>

      <FormulaireAdmin action={ajouterMedia} className="admin-formulaire">
        <h2>Ajouter une image</h2>
        <div className="champ">
          <label htmlFor="nom">Nom</label>
          <input id="nom" name="nom" placeholder="Bannière rentrée" />
        </div>
        <div className="champ">
          <label htmlFor="alt">Texte alternatif</label>
          <input id="alt" name="alt" placeholder="Décrit l’image pour les lecteurs d’écran" />
        </div>
        <ChampImagesUnique />
        <div className="pied-formulaire">
          <button className="btn btn-solid" type="submit">
            Ajouter
          </button>
        </div>
      </FormulaireAdmin>

      <div className="cadre-tableau" style={{ marginTop: '1.4rem' }}>
        <table className="admin-tableau">
          <thead>
            <tr>
              <th></th>
              <th>Nom</th>
              <th>Texte alternatif</th>
              <th>Taille</th>
              <th>Ajoutée le</th>
              <th className="colonne-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medias.length === 0 && (
              <tr>
                <td colSpan={6} className="lede">
                  Aucune image pour l’instant.
                </td>
              </tr>
            )}
            {medias.map((m) => (
              <tr key={m.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.donnees} alt="" className="vignette-tableau" />
                </td>
                <td>{m.nom}</td>
                <td className="lede">{m.alt || '—'}</td>
                <td className="mono">{m.tailleKo} Ko</td>
                <td className="mono">{formaterDate(m.creeLe)}</td>
                <td className="colonne-actions">
                  <FormulaireAdmin
                    action={supprimerMedia.bind(null, m.id)}
                    className="ligne-action"
                    confirmation={`Supprimer « ${m.nom} » ?`}
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
    </>
  )
}

/** Une seule image, sérialisée dans le champ attendu par l'action. */
function ChampImagesUnique() {
  return <ChampImages nom="donneesListe" multiple={false} />
}
