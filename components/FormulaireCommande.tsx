'use client'

import { useState, useTransition } from 'react'
import { passerCommande } from '@/app/actions/commande'

type Props = {
  defauts: { nom: string; email: string; telephone: string }
  carteActive: boolean
}

export default function FormulaireCommande({ defauts, carteActive }: Props) {
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, demarrer] = useTransition()

  return (
    <form
      className="formulaire"
      action={(formData) => {
        setErreur(null)
        demarrer(async () => {
          const reponse = await passerCommande(formData)
          if (reponse?.erreur) setErreur(reponse.erreur)
        })
      }}
    >
      <div className="paire-champs">
        <div className="champ">
          <label htmlFor="nom">Nom complet</label>
          <input id="nom" name="nom" defaultValue={defauts.nom} required autoComplete="name" />
        </div>
        <div className="champ">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={defauts.email} required autoComplete="email" />
        </div>
      </div>

      <div className="champ">
        <label htmlFor="telephone">Téléphone (facultatif)</label>
        <input id="telephone" name="telephone" defaultValue={defauts.telephone} autoComplete="tel" />
      </div>

      <div className="champ">
        <label htmlFor="adresse">Adresse de livraison</label>
        <textarea id="adresse" name="adresse" rows={3} required autoComplete="street-address" />
      </div>

      <div className="champ">
        <label htmlFor="ville">Ville</label>
        <input id="ville" name="ville" required autoComplete="address-level2" />
      </div>

      <fieldset className="choix-paiement">
        <legend className="mono">Paiement</legend>
        <label>
          <input type="radio" name="mode" value="hors_ligne" defaultChecked />
          <span>
            <strong>Payer à la livraison</strong>
            <span className="lede">Vous réglez en espèces à la réception.</span>
          </span>
        </label>
        <label>
          <input type="radio" name="mode" value="virement" />
          <span>
            <strong>Virement bancaire</strong>
            <span className="lede">Nous vous envoyons les coordonnées par email.</span>
          </span>
        </label>
        {carteActive && (
          <label>
            <input type="radio" name="mode" value="carte" />
            <span>
              <strong>Carte bancaire</strong>
              <span className="lede">Paiement sécurisé en ligne.</span>
            </span>
          </label>
        )}
      </fieldset>

      {erreur && <p className="message-erreur">{erreur}</p>}

      <button className="btn btn-sig" type="submit" disabled={enCours}>
        {enCours ? 'Envoi…' : 'Confirmer la commande'}
      </button>
      <p className="mono">Aucun compte n’est nécessaire. Vous recevrez un email de confirmation.</p>
    </form>
  )
}
