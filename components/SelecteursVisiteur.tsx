'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { choisirDevise, choisirLangue } from '@/app/actions/preferences'

type Option = { code: string; libelle: string }

/**
 * Langue et devise, côte à côte dans l'en-tête. La langue est déjà devinée
 * d'après le navigateur : ces menus servent à passer outre.
 */
export default function SelecteursVisiteur({
  langues,
  langueActive,
  devises,
  deviseActive,
  libelleLangue,
  libelleDevise,
}: {
  langues: Option[]
  langueActive: string
  devises: Option[]
  deviseActive: string
  libelleLangue: string
  libelleDevise: string
}) {
  const [enCours, demarrer] = useTransition()
  const router = useRouter()

  const appliquer = (action: (code: string) => Promise<void>, code: string) =>
    demarrer(async () => {
      await action(code)
      router.refresh()
    })

  return (
    <div className="preferences" data-en-cours={enCours ? 'oui' : undefined}>
      <select
        aria-label={libelleLangue}
        value={langueActive}
        onChange={(e) => appliquer(choisirLangue, e.target.value)}
      >
        {langues.map((l) => (
          <option key={l.code} value={l.code}>
            {l.libelle}
          </option>
        ))}
      </select>

      {devises.length > 1 && (
        <select
          aria-label={libelleDevise}
          value={deviseActive}
          onChange={(e) => appliquer(choisirDevise, e.target.value)}
        >
          {devises.map((d) => (
            <option key={d.code} value={d.code}>
              {d.libelle}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
