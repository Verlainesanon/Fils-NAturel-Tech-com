'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type EntreeMenu = { href: string; libelle: string; pastille?: number }
export type GroupeMenu = { groupe: string; entrees: EntreeMenu[] }

export default function MenuAdmin({ groupes }: { groupes: GroupeMenu[] }) {
  const chemin = usePathname()

  return (
    <>
      {groupes.map((g) => (
        <div key={g.groupe}>
          <p className="admin-groupe">{g.groupe}</p>
          {g.entrees.map((e) => {
            const actif = e.href === '/admin' ? chemin === '/admin' : chemin.startsWith(e.href)
            return (
              <Link key={e.href} href={e.href} className={`admin-lien ${actif ? 'actif' : ''}`}>
                <span>{e.libelle}</span>
                {e.pastille ? <span className="admin-pastille">{e.pastille}</span> : null}
              </Link>
            )
          })}
        </div>
      ))}
    </>
  )
}
