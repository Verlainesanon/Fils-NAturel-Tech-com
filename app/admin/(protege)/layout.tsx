import Link from 'next/link'
import { redirect } from 'next/navigation'
import '../admin.css'
import { prisma } from '@/lib/db'
import { adminActuel } from '@/lib/auth'
import { peut } from '@/lib/roles'
import { lireReglages } from '@/lib/settings'
import { deconnexionAdmin } from '../actions'
import MenuAdmin, { type GroupeMenu } from '@/components/admin/MenuAdmin'

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const admin = await adminActuel()
  if (!admin) redirect('/admin/connexion')

  const [reglages, messagesNonLus, commandesNouvelles] = await Promise.all([
    lireReglages(),
    prisma.message.count({ where: { auteur: 'client', luParAdmin: false } }),
    prisma.order.count({ where: { statutTraitement: 'nouvelle' } }),
  ])

  const groupes: GroupeMenu[] = [
    {
      groupe: 'Pilotage',
      entrees: [
        { href: '/admin', libelle: 'Tableau de bord' },
        { href: '/admin/bilan', libelle: 'Bilan et bénéfices' },
      ],
    },
    {
      groupe: 'Catalogue',
      entrees: [
        { href: '/admin/produits', libelle: 'Produits' },
        { href: '/admin/categories', libelle: 'Catégories' },
        { href: '/admin/stock', libelle: 'Stock et ruptures' },
        { href: '/admin/achats', libelle: 'Achats' },
        { href: '/admin/promos', libelle: 'Promotions' },
      ],
    },
    {
      groupe: 'Ventes',
      entrees: [
        { href: '/admin/commandes', libelle: 'Commandes', pastille: commandesNouvelles },
        { href: '/admin/clients', libelle: 'Clients' },
        { href: '/admin/messages', libelle: 'Messages', pastille: messagesNonLus },
      ],
    },
    {
      groupe: 'Contenus',
      entrees: [
        { href: '/admin/contenus', libelle: 'Textes du site' },
        { href: '/admin/medias', libelle: 'Médiathèque' },
        { href: '/admin/bannieres', libelle: 'Bannières' },
      ],
    },
    {
      groupe: 'Administration',
      entrees: [
        ...(peut(admin.role, 'proprietaire')
          ? [
              { href: '/admin/parametres', libelle: 'Paramètres' },
              { href: '/admin/devises', libelle: 'Devises et taux' },
              { href: '/admin/comptes', libelle: 'Comptes admin' },
              { href: '/admin/audit', libelle: 'Journal d’audit' },
            ]
          : []),
      ],
    },
  ].filter((g) => g.entrees.length > 0)

  return (
    <div className="admin">
      <nav className="admin-barre" aria-label="Navigation de l’administration">
        <Link href="/" className="admin-marque">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reglages.SITE_LOGO || '/logo.jpeg'} alt="" />
          <strong>
            {reglages.SITE_NOM}
            <br />
            <span className="mono">Administration</span>
          </strong>
        </Link>

        <MenuAdmin groupes={groupes} />

        <div className="admin-utilisateur">
          <span>
            {admin.nom}
            <br />
            <span className="mono">{admin.role}</span>
          </span>
          <form action={deconnexionAdmin} style={{ marginLeft: 'auto' }}>
            <button className="bouton-mini" type="submit">
              Quitter
            </button>
          </form>
        </div>
      </nav>

      <div className="admin-corps">{children}</div>
    </div>
  )
}
