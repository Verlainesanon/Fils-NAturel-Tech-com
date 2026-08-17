'use client'

import { useId, useState } from 'react'

/**
 * Champ de mot de passe avec bascule afficher/masquer. Utile surtout au
 * téléphone, où une faute de frappe invisible fait perdre une tentative — et
 * l'administration bloque le compte au bout de cinq.
 */
export default function ChampMotDePasse({
  nom = 'motDePasse',
  label = 'Mot de passe',
  aide,
  minLength,
  autoComplete = 'current-password',
  required = true,
  placeholder,
  compact = false,
}: {
  nom?: string
  label?: string
  aide?: string
  minLength?: number
  autoComplete?: string
  required?: boolean
  placeholder?: string
  compact?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  const champ = (
    <div className="champ-mdp">
      <input
        id={id}
        name={nom}
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={compact ? label : undefined}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        title={visible ? 'Masquer' : 'Afficher'}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path
              d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.4 5.2A9.6 9.6 0 0112 5c5 0 9 4.5 9 7 0 1-.7 2.3-1.8 3.5M6.5 6.9C4.4 8.3 3 10.3 3 12c0 2.5 4 7 9 7 1.4 0 2.7-.3 3.8-.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M3 12c0-2.5 4-7 9-7s9 4.5 9 7-4 7-9 7-9-4.5-9-7Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </button>
    </div>
  )

  if (compact) return champ

  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      {champ}
      {aide && <span className="mono">{aide}</span>}
    </div>
  )
}
