'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ajouterAuPanier } from '@/app/actions/panier'

export default function AjoutPanier({ produitId, stock }: { produitId: string; stock: number }) {
  const [quantite, setQuantite] = useState(1)
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(null)
  const [enCours, demarrer] = useTransition()
  const router = useRouter()

  if (stock <= 0) {
    return (
      <div className="bloc-achat">
        <button className="bouton" disabled>
          Épuisé
        </button>
        <p className="mono">Prévenez-nous par le chat si vous souhaitez être averti du réapprovisionnement.</p>
      </div>
    )
  }

  const envoyer = () => {
    demarrer(async () => {
      const reponse = await ajouterAuPanier(produitId, quantite)
      if (reponse?.erreur) setMessage({ texte: reponse.erreur, erreur: true })
      else {
        setMessage({ texte: 'Ajouté au panier.', erreur: false })
        router.refresh()
      }
    })
  }

  return (
    <div className="bloc-achat">
      <div className="compteur-quantite">
        <button
          type="button"
          onClick={() => setQuantite((q) => Math.max(1, q - 1))}
          aria-label="Retirer un exemplaire"
        >
          −
        </button>
        <span aria-live="polite">{quantite}</span>
        <button
          type="button"
          onClick={() => setQuantite((q) => Math.min(stock, q + 1))}
          aria-label="Ajouter un exemplaire"
        >
          +
        </button>
      </div>

      <button className="bouton" onClick={envoyer} disabled={enCours}>
        {enCours ? 'Ajout…' : 'Ajouter au panier'}
      </button>

      {message && (
        <p className={message.erreur ? 'message-erreur' : 'message-succes'}>{message.texte}</p>
      )}
    </div>
  )
}
