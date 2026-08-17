import Link from 'next/link'
import { prisma } from '@/lib/db'
import { lirePanier } from '@/lib/cart'
import { lireReglages } from '@/lib/settings'
import { clientActuel } from '@/lib/auth'

export default async function EnTete() {
  const [reglages, client] = await Promise.all([lireReglages(), clientActuel()])
  const articles = lirePanier().reduce((t, l) => t + l.quantite, 0)
  // Chargé pour garder la connexion chaude, et signaler un catalogue vide.
  await prisma.category.count().catch(() => 0)

  const [premier, ...reste] = reglages.SITE_NOM.split(' ')

  return (
    <header>
      <div className="wrap hd">
        <Link href="/" className="brand" aria-label={`Accueil ${reglages.SITE_NOM}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reglages.SITE_LOGO || '/logo.jpeg'} alt="" />
          <svg className="wordmark" viewBox="0 0 150 26" role="img" aria-label={reglages.SITE_NOM}>
            <text x="0" y="12">{premier}</text>
            <path className="wire" d="M25,8 C31,8 31,14 37,14 C43,14 43,8 49,8" />
            <circle className="sol" cx="25" cy="8" r="1.7" />
            <circle className="sol" cx="49" cy="8" r="1.7" />
            <text x="53" y="12">{reste[0] ?? ''}</text>
            <text className="tc" x="0" y="22">
              {reste.slice(1).join(' ').toUpperCase() || 'TECH-COM'}
            </text>
          </svg>
        </Link>

        <nav aria-label="Navigation principale">
          <Link href="/">Accueil</Link>
          <Link href="/boutique">Catalogue</Link>
          <Link href="/boutique?tri=promo">Spéciaux</Link>
          <Link href="/commande/suivi">Suivi</Link>
        </nav>

        <div className="hd-r">
          <Link className="btn btn-line" href={client ? '/compte' : '/compte/connexion'}>
            {client ? client.nom.split(' ')[0] : 'Se connecter'}
          </Link>
          <Link className="btn btn-solid" href="/panier">
            Panier · {articles}
          </Link>
        </div>
      </div>
    </header>
  )
}
