import Link from 'next/link'
import { prixEffectif, parserJson } from '@/lib/format'
import type { Product } from '@prisma/client'
import type { Affichage } from '@/lib/affichage'

/** Dessin technique par défaut, quand le produit n'a pas encore de photo. */
function Croquis() {
  return (
    <svg viewBox="0 0 120 90" aria-hidden>
      <rect className="body" x="18" y="22" width="84" height="46" rx="6" />
      <rect className="accent" x="26" y="30" width="30" height="30" rx="4" />
      <rect className="accent-2" x="64" y="36" width="30" height="18" rx="3" />
      <circle className="term" cx="24" cy="76" r="2.5" />
      <circle className="term" cx="60" cy="76" r="2.5" />
      <circle className="term" cx="96" cy="76" r="2.5" />
      <path className="body" d="M24,68 L24,74 M60,68 L60,74 M96,68 L96,74" />
    </svg>
  )
}

export default function CarteProduit({ produit, affichage }: { produit: Product; affichage: Affichage }) {
  const { prix, t } = affichage
  const { centimes, enPromo } = prixEffectif(produit)
  const images = parserJson<string[]>(produit.images, [])
  const rupture = produit.stock <= 0
  const stockBas = !rupture && produit.stock <= produit.seuilAlerte
  const remplissage = Math.min(1, produit.stock / Math.max(produit.seuilAlerte * 4, 1))

  return (
    <Link href={`/produit/${produit.slug}`} className={`prod ${rupture ? 'out' : ''}`}>
      <div className="p-top">
        <span className="ref">{produit.reference ?? produit.marque ?? 'FNTC'}</span>
        {enPromo && <span className="tag promo">{t('produit.promo')}</span>}
        {rupture && <span className="tag rupt">{t('produit.rupture')}</span>}
      </div>

      <div className="draw">
        {images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[0]} alt={produit.nom} loading="lazy" />
        ) : (
          <Croquis />
        )}
      </div>

      <div className="p-body">
        <span className="p-name">{produit.nom}</span>
        <p className="p-desc">{produit.descriptionCourte || produit.description}</p>

        <div className={`meter stock ${stockBas ? 'low' : ''}`}>
          <span className="mk">
            <span>{t('produit.stock')}</span>
            <b>{rupture ? t('produit.epuise') : `${produit.stock} ${t('produit.pieces')}`}</b>
          </span>
          <span className="bar">
            <i style={{ '--v': remplissage } as React.CSSProperties} />
          </span>
        </div>

        <div className="p-foot">
          <span className="price">
            <b>{prix(centimes)}</b>
            {enPromo && <s>{prix(produit.prixCentimes)}</s>}
          </span>
          <span className="go">{t('produit.voir')} →</span>
        </div>
      </div>
    </Link>
  )
}
