import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import '../admin.css'
import { adminActuel } from '@/lib/auth'
import { lireReglages } from '@/lib/settings'
import { connexionAdmin } from '../actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Administration' }

export default async function ConnexionAdmin() {
  if (await adminActuel()) redirect('/admin')
  const reglages = await lireReglages()

  return (
    <main className="connexion-admin">
      <div className="panneau carte-connexion">
        <div className="admin-marque" style={{ marginBottom: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reglages.SITE_LOGO || '/logo.jpeg'} alt="" />
          <strong>
            {reglages.SITE_NOM}
            <br />
            <span className="mono">Administration</span>
          </strong>
        </div>

        <FormulaireAdmin action={connexionAdmin} className="formulaire">
          <div className="champ">
            <label htmlFor="identifiant">Identifiant</label>
            <input id="identifiant" name="identifiant" required autoComplete="username" autoFocus />
          </div>
          <div className="champ">
            <label htmlFor="motDePasse">Mot de passe</label>
            <input
              id="motDePasse"
              name="motDePasse"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <button className="bouton" type="submit">
            Entrer
          </button>
        </FormulaireAdmin>

        <p className="mono">Accès réservé. Toute action est enregistrée dans le journal.</p>
      </div>
    </main>
  )
}
