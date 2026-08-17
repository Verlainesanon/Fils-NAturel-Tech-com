import Link from 'next/link'
import { prisma } from '@/lib/db'
import { lirePanier } from '@/lib/cart'
import { lireReglages } from '@/lib/settings'
import { clientActuel } from '@/lib/auth'

export default async function EnTete() {
  const [categories, reglages, client] = await Promise.all([
    prisma.category.findMany({
      where: { visible: true, parentId: null },
      orderBy: { ordre: 'asc' },
      take: 6,
    }),
    lireReglages(),
    clientActuel(),
  ])
  const articles = lirePanier().reduce((t, l) => t + l.quantite, 0)

  return (
    <header className="entete">
      <div className="contenu entete-grille">
        <Link href="/" className="marque">
          {reglages.SITE_LOGO ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reglages.SITE_LOGO} alt="" className="marque-logo" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo.jpeg" alt="" className="marque-logo" />
          )}
          <span className="marque-texte">
            <strong>{reglages.SITE_NOM}</strong>
            <span className="mono">{reglages.SITE_SLOGAN}</span>
          </span>
        </Link>

        <nav className="nav-vitrine" aria-label="Catégories">
          <Link href="/boutique">Tout le catalogue</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/boutique?categorie=${c.slug}`}>
              {c.nom}
            </Link>
          ))}
        </nav>

        <div className="entete-actions">
          <Link href={client ? '/compte' : '/compte/connexion'} className="lien-entete">
            {client ? client.nom.split(' ')[0] : 'Se connecter'}
          </Link>
          <Link href="/panier" className="lien-panier" aria-label={`Panier, ${articles} article(s)`}>
            Panier
            <span className="compteur">{articles}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
