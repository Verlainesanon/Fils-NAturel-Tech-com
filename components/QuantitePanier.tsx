'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { changerQuantite } from '@/app/actions/panier'

/**
 * Quantité d'une ligne du panier : elle se tape et se valide à la sortie du
 * champ ou par Entrée. Mettre 0 retire la ligne.
 */
export default function QuantitePanier({
  produitId,
  quantite,
  stock,
  libelle,
}: {
  produitId: string
  quantite: number
  stock: number
  libelle: string
}) {
  const [valeur, setValeur] = useState(String(quantite))
  const [enCours, demarrer] = useTransition()
  const router = useRouter()

  const appliquer = (demandee: number) => {
    const retenue = Math.max(0, Math.min(demandee, stock))
    setValeur(String(retenue))
    if (retenue === quantite) return
    demarrer(async () => {
      await changerQuantite(produitId, retenue)
      router.refresh()
    })
  }

  const saisie = Number.parseInt(valeur, 10) || 0

  return (
    <div className="champ-quantite" data-en-cours={enCours ? 'oui' : undefined}>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={stock}
        value={valeur}
        onChange={(e) => setValeur(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => appliquer(saisie)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
        aria-label={libelle}
      />
    </div>
  )
}
