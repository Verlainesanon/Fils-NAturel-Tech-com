import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { BLOCS_DEFAUT } from '@/lib/content'
import { enregistrerBloc, reinitialiserBloc } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Textes du site' }

const LIBELLES_ZONE: Record<string, string> = {
  accueil: 'Page d’accueil',
  apropos: 'À propos',
  pied: 'Pied de page',
}

export default async function Contenus() {
  const enregistres = await prisma.contentBlock.findMany()
  const parCle = new Map(enregistres.map((b) => [b.cle, b] as const))

  const zones = new Map<string, string[]>()
  for (const [cle, defaut] of Object.entries(BLOCS_DEFAUT)) {
    const liste = zones.get(defaut.zone) ?? []
    liste.push(cle)
    zones.set(defaut.zone, liste)
  }

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Textes du site</h1>
          <p>
            Chaque bloc correspond à un emplacement précis de la vitrine. Modifier ici change le site
            immédiatement, sans toucher au code.
          </p>
        </div>
      </header>

      {Array.from(zones.entries()).map(([zone, cles]) => (
        <section key={zone} style={{ marginBottom: '2rem' }}>
          <h2 className="admin-groupe" style={{ paddingLeft: 0 }}>
            {LIBELLES_ZONE[zone] ?? zone}
          </h2>

          {cles.map((cle) => {
            const defaut = BLOCS_DEFAUT[cle]
            const enregistre = parCle.get(cle)
            const valeur = enregistre?.valeur ?? defaut.valeur
            const valeurAlt = enregistre?.valeurAlt ?? defaut.valeurAlt ?? ''
            const modifie = Boolean(enregistre)

            return (
              <FormulaireAdmin key={cle} action={enregistrerBloc} className="admin-formulaire" >
                <input type="hidden" name="cle" value={cle} />
                <input type="hidden" name="zone" value={defaut.zone} />
                <input type="hidden" name="type" value={defaut.type} />

                <div className="champ large">
                  <label htmlFor={`valeur-${cle}`}>
                    {cle} {modifie && <span className="or">· personnalisé</span>}
                  </label>
                  {defaut.type === 'texte' && valeur.length > 90 ? (
                    <textarea id={`valeur-${cle}`} name="valeur" rows={3} defaultValue={valeur} />
                  ) : (
                    <input id={`valeur-${cle}`} name="valeur" defaultValue={valeur} />
                  )}
                </div>

                {defaut.type === 'bouton' && (
                  <div className="champ large">
                    <label htmlFor={`alt-${cle}`}>Lien du bouton</label>
                    <input id={`alt-${cle}`} name="valeurAlt" defaultValue={valeurAlt} placeholder="/boutique" />
                  </div>
                )}

                <div className="champ">
                  <label htmlFor={`statut-${cle}`}>Statut</label>
                  <select id={`statut-${cle}`} name="statut" defaultValue={enregistre?.statut ?? 'publie'}>
                    <option value="publie">Publié</option>
                    <option value="brouillon">Brouillon (revient au texte de départ)</option>
                  </select>
                </div>

                <div className="pied-formulaire">
                  <button className="bouton" type="submit">
                    Enregistrer
                  </button>
                </div>
              </FormulaireAdmin>
            )
          })}
        </section>
      ))}

      {enregistres.length > 0 && (
        <section>
          <h2 className="admin-groupe" style={{ paddingLeft: 0 }}>
            Revenir au texte d’origine
          </h2>
          <div className="admin-actions">
            {enregistres.map((b) => (
              <FormulaireAdmin
                key={b.id}
                action={reinitialiserBloc.bind(null, b.cle)}
                className="ligne-action"
                confirmation={`Rétablir le texte de départ pour « ${b.cle} » ?`}
              >
                <button className="bouton-mini danger" type="submit">
                  {b.cle}
                </button>
              </FormulaireAdmin>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
