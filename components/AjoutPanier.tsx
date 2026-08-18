'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ajouterAuPanier } from '@/app/actions/panier'

export default function AjoutPanier({
  produitId,
  stock,
  libelles,
}: {
  produitId: string
  stock: number
  libelles: { ajouter: string; ajout: string; ajoute: string; epuise: string; quantite: string }
}) {
  const [quantite, setQuantite] = useState('1')
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(null)
  const [enCours, demarrer] = useTransition()
  const router = useRouter()

  if (stock <= 0) {
    return (
      <div className="bloc-achat">
        <button className="btn btn-solid" disabled>
          {libelles.epuise}
        </button>
        <p className="mono">Prévenez-nous par le chat pour être averti du réapprovisionnement.</p>
      </div>
    )
  }

  const demande = Number.parseInt(quantite, 10) || 0

  const envoyer = () => {
    if (demande < 1) {
      setMessage({ texte: 'Indiquez au moins 1.', erreur: true })
      return
    }
    demarrer(async () => {
      const reponse = await ajouterAuPanier(produitId, Math.min(demande, stock))
      if (reponse?.erreur) setMessage({ texte: reponse.erreur, erreur: true })
      else {
        setMessage({ texte: libelles.ajoute, erreur: false })
        router.refresh()
      }
    })
  }

  return (
    <div className="bloc-achat">
      {/* La quantité se tape entièrement : commander mille pièces ne doit pas
          demander mille clics. */}
      <label className="champ-quantite">
        <span className="champ-quantite-nom">{libelles.quantite}</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={stock}
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={() => setQuantite(String(Math.min(Math.max(demande, 1), stock)))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              envoyer()
            }
          }}
        />
      </label>

      <button className="btn btn-sig" onClick={envoyer} disabled={enCours}>
        {enCours ? libelles.ajout : libelles.ajouter}
      </button>

      {demande > stock && (
        <p className="mono">Stock limité à {stock} : la quantité sera ramenée à ce maximum.</p>
      )}

      {message && <p className={message.erreur ? 'message-erreur' : 'message-succes'}>{message.texte}</p>}
    </div>
  )
}
