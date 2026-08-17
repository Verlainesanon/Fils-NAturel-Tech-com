import Link from 'next/link'
import { lireReglages } from '@/lib/settings'
import { lireBlocs, bloc } from '@/lib/content'

export default async function PiedDePage() {
  const [reglages, blocs] = await Promise.all([lireReglages(), lireBlocs('pied')])
  const reseaux = [
    { nom: 'Facebook', url: reglages.RESEAU_FACEBOOK },
    { nom: 'Instagram', url: reglages.RESEAU_INSTAGRAM },
    { nom: 'WhatsApp', url: reglages.RESEAU_WHATSAPP },
  ].filter((r) => r.url)

  return (
    <footer className="pied">
      <div className="wrap pied-grille">
        <div>
          <p className="eyebrow">{reglages.SITE_NOM}</p>
          <p className="lede" style={{ maxWidth: '30ch' }}>
            {bloc(blocs, 'pied.mention')}
          </p>
        </div>

        <div>
          <p className="mono">Boutique</p>
          <Link href="/boutique">Catalogue</Link>
          <Link href="/panier">Panier</Link>
          <Link href="/commande/suivi">Suivre ma commande</Link>
        </div>

        <div>
          <p className="mono">Compte</p>
          <Link href="/compte/connexion">Se connecter</Link>
          <Link href="/compte/inscription">Créer un compte</Link>
        </div>

        <div>
          <p className="mono">Nous joindre</p>
          <a href={`mailto:${reglages.SITE_EMAIL}`}>{reglages.SITE_EMAIL}</a>
          <a href={`tel:${reglages.SITE_TELEPHONE.replace(/\s/g, '')}`}>{reglages.SITE_TELEPHONE}</a>
          <span className="lede">{reglages.SITE_ADRESSE}</span>
          {reseaux.length > 0 && (
            <span className="pied-reseaux">
              {reseaux.map((r) => (
                <a key={r.nom} href={r.url} target="_blank" rel="noreferrer">
                  {r.nom}
                </a>
              ))}
            </span>
          )}
        </div>
      </div>

      <div className="wrap pied-bas">
        <span>© {new Date().getFullYear()} {reglages.SITE_NOM}</span>
        <Link href="/admin">Espace administration</Link>
      </div>
    </footer>
  )
}
