import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { clientIdActuel } from '@/lib/auth'
import { inscrire } from '@/app/actions/compte'
import FormulaireCompte from '@/components/FormulaireCompte'

export const metadata: Metadata = { title: 'Créer un compte' }

export default function Inscription() {
  if (clientIdActuel()) redirect('/compte')

  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: '30rem' }}>
        <span className="eyebrow">Compte</span>
        <h1 className="sec-titre">Créer un compte</h1>
        <p className="lede">
          Vos commandes passées en tant qu’invité avec le même email seront rattachées automatiquement.
        </p>

        <div className="card-l bloc-formulaire" style={{ marginTop: '1.5rem' }}>
          <FormulaireCompte mode="inscription" action={inscrire} />
        </div>

        <p className="mono" style={{ marginTop: '1.2rem' }}>
          Déjà inscrit ? <Link href="/compte/connexion" className="or">Se connecter</Link>
        </p>
      </div>
    </section>
  )
}
