import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { clientIdActuel } from '@/lib/auth'
import { connecter } from '@/app/actions/compte'
import FormulaireCompte from '@/components/FormulaireCompte'

export const metadata: Metadata = { title: 'Se connecter' }

export default function Connexion() {
  if (clientIdActuel()) redirect('/compte')

  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: '30rem' }}>
        <span className="eyebrow">Compte</span>
        <h1 className="sec-titre">Se connecter</h1>
        <p className="lede">
          Le compte est facultatif : il sert à retrouver vos commandes et à garder vos coordonnées.
        </p>

        <div className="card-l bloc-formulaire" style={{ marginTop: '1.5rem' }}>
          <FormulaireCompte mode="connexion" action={connecter} />
        </div>

        <p className="mono" style={{ marginTop: '1.2rem' }}>
          Pas encore de compte ? <Link href="/compte/inscription" className="or">En créer un</Link>
        </p>
      </div>
    </section>
  )
}
