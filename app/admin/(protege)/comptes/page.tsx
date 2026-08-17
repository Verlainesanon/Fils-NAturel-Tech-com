import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { adminActuel } from '@/lib/auth'
import { peut, ROLES, LIBELLES_ROLES } from '@/lib/roles'
import { formaterDateHeure } from '@/lib/format'
import { creerAdmin, changerRoleAdmin, changerMotDePasseAdmin, supprimerAdmin } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'
import ChampMotDePasse from '@/components/ChampMotDePasse'

export const metadata: Metadata = { title: 'Comptes admin' }

export default async function Comptes() {
  const admin = await adminActuel()
  if (!peut(admin?.role, 'proprietaire')) redirect('/admin')

  const comptes = await prisma.adminUser.findMany({ orderBy: { creeLe: 'asc' } })

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Comptes admin</h1>
          <p>Chaque rôle donne accès à tout ce que permettent les rôles inférieurs.</p>
        </div>
      </header>

      <div className="cadre-tableau">
        <table className="admin-tableau">
          <thead>
            <tr>
              <th>Compte</th>
              <th>Rôle</th>
              <th>Dernière connexion</th>
              <th>Changer le rôle</th>
              <th>Nouveau mot de passe</th>
              <th className="colonne-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comptes.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.nom}</strong>
                  <br />
                  <span className="mono">{c.identifiant}</span>
                </td>
                <td>
                  <span className="etat">{c.role}</span>
                </td>
                <td className="mono">{formaterDateHeure(c.derniereConnexion)}</td>
                <td>
                  <FormulaireAdmin action={changerRoleAdmin} className="ligne-ajustement">
                    <input type="hidden" name="id" value={c.id} />
                    <select name="role" defaultValue={c.role} aria-label={`Rôle de ${c.identifiant}`}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button className="bouton-mini" type="submit">
                      Appliquer
                    </button>
                  </FormulaireAdmin>
                </td>
                <td>
                  <FormulaireAdmin action={changerMotDePasseAdmin} className="ligne-ajustement">
                    <input type="hidden" name="id" value={c.id} />
                    <ChampMotDePasse
                      compact
                      required={false}
                      autoComplete="new-password"
                      placeholder="12 caractères min."
                      label={`Nouveau mot de passe de ${c.identifiant}`}
                    />
                    <button className="bouton-mini" type="submit">
                      Réinitialiser
                    </button>
                  </FormulaireAdmin>
                </td>
                <td className="colonne-actions">
                  <FormulaireAdmin
                    action={supprimerAdmin.bind(null, c.id)}
                    className="ligne-action"
                    confirmation={`Supprimer le compte « ${c.identifiant} » ?`}
                  >
                    <button className="bouton-mini danger" type="submit" disabled={c.id === admin?.id}>
                      Supprimer
                    </button>
                  </FormulaireAdmin>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormulaireAdmin action={creerAdmin} className="admin-formulaire" >
        <h2>Nouveau compte</h2>

        <div className="champ">
          <label htmlFor="identifiant">Identifiant</label>
          <input id="identifiant" name="identifiant" required autoComplete="off" />
        </div>

        <div className="champ">
          <label htmlFor="nom">Nom affiché</label>
          <input id="nom" name="nom" />
        </div>

        <div className="champ">
          <label htmlFor="role">Rôle</label>
          <select id="role" name="role" defaultValue="vendeur">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {LIBELLES_ROLES[r]}
              </option>
            ))}
          </select>
        </div>

        <ChampMotDePasse minLength={12} autoComplete="new-password" aide="12 caractères minimum." />

        <div className="pied-formulaire">
          <button className="btn btn-solid" type="submit">
            Créer le compte
          </button>
        </div>
      </FormulaireAdmin>
    </>
  )
}
