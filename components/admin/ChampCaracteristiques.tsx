'use client'

import { useState } from 'react'

type Paire = { cle: string; valeur: string }

export default function ChampCaracteristiques({ valeurInitiale = '[]' }: { valeurInitiale?: string }) {
  const [paires, setPaires] = useState<Paire[]>(() => {
    try {
      const analyse = JSON.parse(valeurInitiale)
      return Array.isArray(analyse) ? analyse : []
    } catch {
      return []
    }
  })

  const modifier = (index: number, champ: keyof Paire, valeur: string) =>
    setPaires((liste) => liste.map((p, i) => (i === index ? { ...p, [champ]: valeur } : p)))

  return (
    <div className="champ large">
      <label>Caractéristiques</label>
      <input
        type="hidden"
        name="caracteristiques"
        value={JSON.stringify(paires.filter((p) => p.cle.trim() && p.valeur.trim()))}
      />

      {paires.map((paire, i) => (
        <div key={i} className="paire-caracteristique">
          <input
            value={paire.cle}
            onChange={(e) => modifier(i, 'cle', e.target.value)}
            placeholder="Autonomie"
            aria-label="Nom de la caractéristique"
          />
          <input
            value={paire.valeur}
            onChange={(e) => modifier(i, 'valeur', e.target.value)}
            placeholder="40 h"
            aria-label="Valeur de la caractéristique"
          />
          <button
            type="button"
            className="bouton-mini danger"
            onClick={() => setPaires((liste) => liste.filter((_, index) => index !== i))}
          >
            Retirer
          </button>
        </div>
      ))}

      <button
        type="button"
        className="bouton-mini"
        onClick={() => setPaires((liste) => [...liste, { cle: '', valeur: '' }])}
        style={{ width: 'fit-content', marginTop: '0.4rem' }}
      >
        Ajouter une ligne
      </button>
    </div>
  )
}
