'use client'

import { useState, useTransition } from 'react'

type Action = (formData: FormData) => Promise<{ erreur?: string } | void>

/**
 * Enveloppe commune des formulaires de l'admin : exécute l'action serveur,
 * affiche l'erreur qu'elle renvoie et désactive l'envoi pendant le traitement.
 */
export default function FormulaireAdmin({
  action,
  children,
  className,
  confirmation,
}: {
  action: Action
  children: React.ReactNode
  className?: string
  confirmation?: string
}) {
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, demarrer] = useTransition()

  return (
    <form
      className={className}
      action={(formData) => {
        if (confirmation && !window.confirm(confirmation)) return
        setErreur(null)
        demarrer(async () => {
          const reponse = await action(formData)
          if (reponse && 'erreur' in reponse && reponse.erreur) setErreur(reponse.erreur)
        })
      }}
      data-en-cours={enCours ? 'oui' : undefined}
    >
      {children}
      {erreur && (
        <p className="message-erreur large" style={{ marginTop: '0.6rem' }}>
          {erreur}
        </p>
      )}
    </form>
  )
}
