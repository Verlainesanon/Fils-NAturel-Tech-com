import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { adminActuel } from '@/lib/auth'
import { peut } from '@/lib/roles'
import { lireDevises, deviseDeBase, formaterMontant } from '@/lib/devises'
import { formaterDateHeure } from '@/lib/format'
import { enregistrerDevise, supprimerDevise, definirDeviseDeBase } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Devises et taux' }

export default async function Devises({ searchParams }: { searchParams: { modifier?: string } }) {
  const admin = await adminActuel()
  if (!peut(admin?.role, 'proprietaire')) redirect('/admin')

  const devises = await lireDevises()
  const base = deviseDeBase(devises)
  const enEdition = devises.find((d) => d.code === searchParams.modifier) ?? null
  const enregistrees = await prisma.devise.count().catch(() => 0)

  // Exemple parlant : ce que devient un prix de 1 000 unités de la devise de base.
  const exemple = 100000

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Devises et taux</h1>
          <p>
            Les prix sont saisis une seule fois, en {base.nom} ({base.code}). Les autres devises sont
            calculées avec leur taux : quand le taux bouge, vous ne retouchez aucun produit.
          </p>
        </div>
      </header>

      {enregistrees === 0 && (
        <div className="alerte alerte-or">
          Aucune devise enregistrée : le site utilise pour l’instant les trois devises par défaut.
          Enregistrez-les ci-dessous pour pouvoir ajuster les taux.
        </div>
      )}

      <div className="deux-colonnes">
        <div className="cadre-tableau">
          <table className="admin-tableau">
            <thead>
              <tr>
                <th>Devise</th>
                <th>Taux</th>
                <th>Exemple</th>
                <th>Visible</th>
                <th>Mise à jour</th>
                <th className="colonne-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devises.map((d) => (
                <tr key={d.code}>
                  <td>
                    <strong>
                      {d.code} {d.symbole}
                    </strong>
                    <br />
                    <span className="mono">{d.nom}</span>
                    {d.base && <span className="etat etat-publie"> base</span>}
                  </td>
                  <td className="mono">{d.base ? '1' : d.taux}</td>
                  <td className="mono">{formaterMontant(exemple, d)}</td>
                  <td>{d.actif ? 'Oui' : 'Non'}</td>
                  <td className="mono">
                    {'majLe' in d ? formaterDateHeure((d as { majLe?: Date }).majLe ?? null) : '—'}
                  </td>
                  <td className="colonne-actions">
                    <a className="bouton-mini" href={`/admin/devises?modifier=${d.code}`}>
                      Modifier
                    </a>{' '}
                    {!d.base && (
                      <>
                        <FormulaireAdmin
                          action={definirDeviseDeBase.bind(null, d.code)}
                          className="ligne-action"
                          confirmation={`Faire de ${d.code} la devise de base ? Les prix déjà saisis ne sont pas convertis : ils seront lus comme des montants en ${d.code}.`}
                        >
                          <button className="bouton-mini" type="submit">
                            Base
                          </button>
                        </FormulaireAdmin>{' '}
                        <FormulaireAdmin
                          action={supprimerDevise.bind(null, d.code)}
                          className="ligne-action"
                          confirmation={`Retirer ${d.code} de la boutique ?`}
                        >
                          <button className="bouton-mini danger" type="submit">
                            Retirer
                          </button>
                        </FormulaireAdmin>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <FormulaireAdmin action={enregistrerDevise} className="admin-formulaire">
          <h2>{enEdition ? `Modifier ${enEdition.code}` : 'Ajouter une devise'}</h2>

          <div className="champ">
            <label htmlFor="code">Code</label>
            <input
              id="code"
              name="code"
              defaultValue={enEdition?.code ?? ''}
              placeholder="USD"
              maxLength={4}
              required
              readOnly={Boolean(enEdition)}
            />
          </div>

          <div className="champ">
            <label htmlFor="symbole">Symbole</label>
            <input id="symbole" name="symbole" defaultValue={enEdition?.symbole ?? ''} placeholder="$" required />
          </div>

          <div className="champ large">
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" defaultValue={enEdition?.nom ?? ''} placeholder="Dollar américain" required />
          </div>

          <div className="champ large">
            <label htmlFor="taux">Taux</label>
            <input
              id="taux"
              name="taux"
              inputMode="decimal"
              defaultValue={enEdition?.taux ?? ''}
              placeholder="0.0076"
              required
            />
            <span className="mono">
              Combien vaut 1 {base.symbole} dans cette devise. Exemple : si 1 {base.code} vaut 0,0076 dollar,
              tapez 0.0076.
            </span>
          </div>

          <div className="champ">
            <label htmlFor="decimales">Décimales</label>
            <input id="decimales" name="decimales" type="number" min={0} max={4} defaultValue={enEdition?.decimales ?? 2} />
          </div>

          <div className="champ">
            <label htmlFor="ordre">Ordre</label>
            <input id="ordre" name="ordre" type="number" defaultValue={enEdition?.ordre ?? 0} />
          </div>

          <label className="case-a-cocher large">
            <input type="checkbox" name="actif" defaultChecked={enEdition?.actif ?? true} />
            Proposée aux visiteurs
          </label>

          <div className="pied-formulaire">
            <button className="btn btn-solid" type="submit">
              {enEdition ? 'Enregistrer' : 'Ajouter'}
            </button>
            {enEdition && (
              <a className="btn btn-line" href="/admin/devises">
                Annuler
              </a>
            )}
          </div>
        </FormulaireAdmin>
      </div>
    </>
  )
}
