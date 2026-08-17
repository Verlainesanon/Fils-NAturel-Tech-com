'use client'

import { useState, useTransition } from 'react'
import ChampMotDePasse from '@/components/ChampMotDePasse'

type Props = {
  mode: 'connexion' | 'inscription'
  action: (formData: FormData) => Promise<{ erreur: string } | undefined>
}

export default function FormulaireCompte({ mode, action }: Props) {
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, demarrer] = useTransition()
  const inscription = mode === 'inscription'

  return (
    <form
      className="formulaire"
      action={(formData) => {
        setErreur(null)
        demarrer(async () => {
          const reponse = await action(formData)
          if (reponse?.erreur) setErreur(reponse.erreur)
        })
      }}
    >
      {inscription && (
        <div className="champ">
          <label htmlFor="nom">Nom complet</label>
          <input id="nom" name="nom" required autoComplete="name" />
        </div>
      )}

      <div className="champ">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      {inscription && (
        <div className="champ">
          <label htmlFor="telephone">Téléphone (facultatif)</label>
          <input id="telephone" name="telephone" autoComplete="tel" />
        </div>
      )}

      <ChampMotDePasse
        minLength={inscription ? 8 : undefined}
        autoComplete={inscription ? 'new-password' : 'current-password'}
        aide={inscription ? '8 caractères minimum.' : undefined}
      />

      {erreur && <p className="message-erreur">{erreur}</p>}

      <button className="btn btn-solid" type="submit" disabled={enCours}>
        {enCours ? 'Un instant…' : inscription ? 'Créer mon compte' : 'Se connecter'}
      </button>
    </form>
  )
}
