import Link from 'next/link'
import { formaterPrix, prixEffectif, parserJson } from '@/lib/format'
import type { Product } from '@prisma/client'

export default function CarteProduit({ produit, symbole }: { produit: Product; symbole: string }) {
  const { centimes, enPromo } = prixEffectif(produit)
  const images = parserJson<string[]>(produit.images, [])
  const rupture = produit.stock <= 0
  const stockBas = !rupture && produit.stock <= produit.seuilAlerte

  return (
    <Link href={`/produit/${produit.slug}`} className="carte-produit">
      <div className="visuel-produit">
        {images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[0]} alt={produit.nom} loading="lazy" />
        ) : (
          <span className="mono">{produit.reference ?? 'FNTC'}</span>
        )}
      </div>

      <div className="carte-corps">
        <div className="carte-etiquettes">
          {enPromo && <span className="etiquette etiquette-promo">Promo</span>}
          {rupture && <span className="etiquette etiquette-rupture">Rupture</span>}
          {produit.miseEnAvant && !enPromo && !rupture && (
            <span className="etiquette etiquette-nouveau">Sélection</span>
          )}
        </div>

        <h3 className="carte-nom">{produit.nom}</h3>
        <p className="mono">{produit.reference ?? produit.marque ?? ''}</p>

        <div className="carte-pied">
          <span className="carte-prix">
            {formaterPrix(centimes, symbole)}
            {enPromo && <s className="carte-prix-barre">{formaterPrix(produit.prixCentimes, symbole)}</s>}
          </span>
          <span className="carte-stock">
            <span
              className={`temoin ${rupture ? 'temoin-vide' : stockBas ? 'temoin-bas' : 'temoin-ok'}`}
              aria-hidden
            />
            <span className="mono">
              {rupture ? 'Épuisé' : stockBas ? `Plus que ${produit.stock}` : 'En stock'}
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}
