import Link from 'next/link'
import type { Category, Product } from '@prisma/client'
import { enregistrerProduit } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'
import ChampImages from '@/components/admin/ChampImages'
import ChampCaracteristiques from '@/components/admin/ChampCaracteristiques'

const enEuros = (centimes: number | null | undefined) =>
  centimes == null ? '' : (centimes / 100).toFixed(2)

const enDateInput = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : '')

export default function FormulaireProduit({
  produit,
  categories,
  symbole,
}: {
  produit: Product | null
  categories: Category[]
  symbole: string
}) {
  return (
    <FormulaireAdmin action={enregistrerProduit} className="admin-formulaire">
      {produit && <input type="hidden" name="id" value={produit.id} />}

      <h2>Identification</h2>

      <div className="champ large">
        <label htmlFor="nom">Nom du produit</label>
        <input id="nom" name="nom" defaultValue={produit?.nom ?? ''} required />
      </div>

      <div className="champ">
        <label htmlFor="reference">Référence</label>
        <input id="reference" name="reference" defaultValue={produit?.reference ?? ''} placeholder="FN-XXX-00" />
      </div>

      <div className="champ">
        <label htmlFor="marque">Marque</label>
        <input id="marque" name="marque" defaultValue={produit?.marque ?? ''} />
      </div>

      <div className="champ">
        <label htmlFor="categorieId">Catégorie</label>
        <select id="categorieId" name="categorieId" defaultValue={produit?.categorieId ?? ''} required>
          <option value="">Choisir…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="champ">
        <label htmlFor="slug">Adresse de la page</label>
        <input id="slug" name="slug" defaultValue={produit?.slug ?? ''} placeholder="généré depuis le nom" />
      </div>

      <h2>Descriptions</h2>

      <div className="champ large">
        <label htmlFor="descriptionCourte">Accroche</label>
        <input
          id="descriptionCourte"
          name="descriptionCourte"
          defaultValue={produit?.descriptionCourte ?? ''}
          placeholder="Une phrase qui résume le produit"
        />
      </div>

      <div className="champ large">
        <label htmlFor="description">Description complète</label>
        <textarea id="description" name="description" rows={5} defaultValue={produit?.description ?? ''} />
      </div>

      <ChampCaracteristiques valeurInitiale={produit?.caracteristiques ?? '[]'} />

      <h2>Prix et stock</h2>

      <div className="champ">
        <label htmlFor="cout">Prix d’achat, l’unité ({symbole})</label>
        <input id="cout" name="cout" inputMode="decimal" defaultValue={enEuros(produit?.coutCentimes)} />
        <p className="aide-champ">
          Ce que l’article vous coûte. Recalculé tout seul à chaque achat enregistré.
        </p>
      </div>

      <div className="champ">
        <label htmlFor="prix">Prix de vente ({symbole})</label>
        <input id="prix" name="prix" inputMode="decimal" defaultValue={enEuros(produit?.prixCentimes)} required />
      </div>

      <div className="champ">
        <label htmlFor="promo">Prix promo ({symbole})</label>
        <input id="promo" name="promo" inputMode="decimal" defaultValue={enEuros(produit?.promoCentimes)} />
      </div>

      <div className="champ">
        <label htmlFor="promoDebut">Promo à partir du</label>
        <input id="promoDebut" name="promoDebut" type="date" defaultValue={enDateInput(produit?.promoDebut ?? null)} />
      </div>

      <div className="champ">
        <label htmlFor="promoFin">Promo jusqu’au</label>
        <input id="promoFin" name="promoFin" type="date" defaultValue={enDateInput(produit?.promoFin ?? null)} />
      </div>

      <div className="champ">
        <label htmlFor="stock">Stock</label>
        <input id="stock" name="stock" type="number" min={0} defaultValue={produit?.stock ?? 0} />
      </div>

      <div className="champ">
        <label htmlFor="seuilAlerte">Seuil d’alerte</label>
        <input id="seuilAlerte" name="seuilAlerte" type="number" min={0} defaultValue={produit?.seuilAlerte ?? 3} />
      </div>

      <div className="champ">
        <label htmlFor="poids">Poids (g)</label>
        <input id="poids" name="poids" type="number" min={0} defaultValue={produit?.poidsGrammes ?? ''} />
      </div>

      <h2>Visuels</h2>
      <ChampImages valeurInitiale={produit?.images ?? '[]'} />

      <h2>Publication</h2>

      <div className="champ">
        <label htmlFor="statut">Statut</label>
        <select id="statut" name="statut" defaultValue={produit?.statut ?? 'publie'}>
          <option value="publie">Publié</option>
          <option value="brouillon">Brouillon</option>
          <option value="archive">Archivé</option>
        </select>
      </div>

      <label className="case-a-cocher" style={{ alignSelf: 'end', paddingBottom: '0.7rem' }}>
        <input type="checkbox" name="miseEnAvant" defaultChecked={produit?.miseEnAvant ?? false} />
        Mettre en avant sur l’accueil
      </label>

      <div className="champ">
        <label htmlFor="seoTitre">Titre pour les moteurs de recherche</label>
        <input id="seoTitre" name="seoTitre" defaultValue={produit?.seoTitre ?? ''} />
      </div>

      <div className="champ">
        <label htmlFor="seoDescription">Description pour les moteurs</label>
        <input id="seoDescription" name="seoDescription" defaultValue={produit?.seoDescription ?? ''} />
      </div>

      <div className="pied-formulaire">
        <button className="btn btn-solid" type="submit">
          {produit ? 'Enregistrer les modifications' : 'Créer le produit'}
        </button>
        <Link className="btn btn-line" href="/admin/produits">
          Annuler
        </Link>
        {produit && (
          <Link className="lien-souligne" href={`/produit/${produit.slug}`} target="_blank">
            Voir sur le site
          </Link>
        )}
      </div>
    </FormulaireAdmin>
  )
}
