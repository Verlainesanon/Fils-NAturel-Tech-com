import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { enregistrerCategorie, supprimerCategorie } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Catégories' }

export default async function Categories({ searchParams }: { searchParams: { modifier?: string } }) {
  const categories = await prisma.category.findMany({
    orderBy: { ordre: 'asc' },
    include: { _count: { select: { produits: true } }, parent: true },
  })
  const enEdition = categories.find((c) => c.id === searchParams.modifier) ?? null

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Catégories</h1>
          <p>L’ordre détermine la position dans le menu de la boutique.</p>
        </div>
      </header>

      <div className="deux-colonnes">
        <div className="cadre-tableau">
          <table className="admin-tableau">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rattachée à</th>
                <th>Produits</th>
                <th>Ordre</th>
                <th>Visible</th>
                <th className="colonne-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.nom}</strong>
                    <br />
                    <span className="mono">{c.slug}</span>
                  </td>
                  <td className="doux">{c.parent?.nom ?? '—'}</td>
                  <td>{c._count.produits}</td>
                  <td className="mono">{c.ordre}</td>
                  <td>{c.visible ? 'Oui' : 'Non'}</td>
                  <td className="colonne-actions">
                    <a className="bouton-mini" href={`/admin/categories?modifier=${c.id}`}>
                      Modifier
                    </a>{' '}
                    <FormulaireAdmin
                      action={supprimerCategorie.bind(null, c.id)}
                      className="ligne-action"
                      confirmation={`Supprimer la catégorie « ${c.nom} » ?`}
                    >
                      <button className="bouton-mini danger" type="submit">
                        Supprimer
                      </button>
                    </FormulaireAdmin>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <FormulaireAdmin action={enregistrerCategorie} className="admin-formulaire">
          <h2>{enEdition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
          {enEdition && <input type="hidden" name="id" value={enEdition.id} />}

          <div className="champ large">
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" defaultValue={enEdition?.nom ?? ''} required />
          </div>

          <div className="champ large">
            <label htmlFor="slug">Adresse</label>
            <input id="slug" name="slug" defaultValue={enEdition?.slug ?? ''} placeholder="généré depuis le nom" />
          </div>

          <div className="champ large">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={2} defaultValue={enEdition?.description ?? ''} />
          </div>

          <div className="champ">
            <label htmlFor="ordre">Ordre</label>
            <input id="ordre" name="ordre" type="number" defaultValue={enEdition?.ordre ?? 0} />
          </div>

          <div className="champ">
            <label htmlFor="parentId">Rattachée à</label>
            <select id="parentId" name="parentId" defaultValue={enEdition?.parentId ?? ''}>
              <option value="">Aucune (rayon principal)</option>
              {categories
                .filter((c) => c.id !== enEdition?.id && !c.parentId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
            </select>
          </div>

          <label className="case-a-cocher large">
            <input type="checkbox" name="visible" defaultChecked={enEdition?.visible ?? true} />
            Visible dans la boutique
          </label>

          <div className="pied-formulaire">
            <button className="bouton" type="submit">
              {enEdition ? 'Enregistrer' : 'Créer'}
            </button>
            {enEdition && (
              <a className="bouton bouton-fantome" href="/admin/categories">
                Annuler
              </a>
            )}
          </div>
        </FormulaireAdmin>
      </div>
    </>
  )
}
