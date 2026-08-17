'use client'

import { useMemo, useState, useTransition } from 'react'
import { creerCommandeAdmin } from '@/app/admin/actions'

export type ArticleSaisie = {
  id: string
  nom: string
  reference: string | null
  categorieId: string
  categorieNom: string
  prixCentimes: number
  stock: number
}

export type ClientSaisie = {
  id: string
  nom: string
  email: string
  telephone: string | null
  adresse: string | null
  ville: string | null
}

type Ligne = { article: ArticleSaisie; quantite: number }

export default function SaisieCommande({
  articles,
  clients,
  categories,
  symbole,
}: {
  articles: ArticleSaisie[]
  clients: ClientSaisie[]
  categories: { id: string; nom: string }[]
  symbole: string
}) {
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('')
  const [lignes, setLignes] = useState<Ligne[]>([])
  const [clientId, setClientId] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, demarrer] = useTransition()

  const client = clients.find((c) => c.id === clientId)

  const resultats = useMemo(() => {
    const terme = recherche.trim().toLowerCase()
    return articles
      .filter((a) => (categorie ? a.categorieId === categorie : true))
      .filter((a) =>
        terme
          ? a.nom.toLowerCase().includes(terme) || (a.reference ?? '').toLowerCase().includes(terme)
          : true
      )
      .slice(0, 40)
  }, [articles, recherche, categorie])

  const ajouter = (article: ArticleSaisie) =>
    setLignes((liste) => {
      const existante = liste.find((l) => l.article.id === article.id)
      if (existante) {
        return liste.map((l) =>
          l.article.id === article.id ? { ...l, quantite: Math.min(l.quantite + 1, article.stock) } : l
        )
      }
      return [...liste, { article, quantite: 1 }]
    })

  const changerQuantite = (id: string, valeur: string) =>
    setLignes((liste) =>
      liste.map((l) =>
        l.article.id === id
          ? { ...l, quantite: Math.max(0, Math.min(Number.parseInt(valeur, 10) || 0, l.article.stock)) }
          : l
      )
    )

  const total = lignes.reduce((t, l) => t + l.article.prixCentimes * l.quantite, 0)
  const enUnites = (centimes: number) => `${(centimes / 100).toFixed(2)} ${symbole}`

  return (
    <form
      className="deux-colonnes saisie-commande"
      action={(formData) => {
        const retenues = lignes.filter((l) => l.quantite > 0)
        if (retenues.length === 0) {
          setErreur('Ajoutez au moins un article.')
          return
        }
        formData.set(
          'lignes',
          JSON.stringify(retenues.map((l) => ({ produitId: l.article.id, quantite: l.quantite })))
        )
        setErreur(null)
        demarrer(async () => {
          const reponse = await creerCommandeAdmin(formData)
          if (reponse?.erreur) setErreur(reponse.erreur)
        })
      }}
    >
      <div>
        <div className="filtres-admin">
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Nom ou référence"
            aria-label="Chercher un article"
          />
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)} aria-label="Rayon">
            <option value="">Tous les rayons</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <span className="mono">{resultats.length} article(s)</span>
        </div>

        <div className="cadre-tableau">
          <table className="admin-tableau">
            <thead>
              <tr>
                <th>Article</th>
                <th>Rayon</th>
                <th>Prix</th>
                <th>Stock</th>
                <th className="colonne-actions">Ajouter</th>
              </tr>
            </thead>
            <tbody>
              {resultats.length === 0 && (
                <tr>
                  <td colSpan={5} className="lede">
                    Aucun article ne correspond.
                  </td>
                </tr>
              )}
              {resultats.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.nom}</strong>
                    <br />
                    <span className="mono">{a.reference ?? ''}</span>
                  </td>
                  <td className="lede">{a.categorieNom}</td>
                  <td className="mono">{enUnites(a.prixCentimes)}</td>
                  <td>
                    <span
                      className={`temoin ${a.stock <= 0 ? 'temoin-vide' : a.stock <= 3 ? 'temoin-bas' : 'temoin-ok'}`}
                      aria-hidden
                    />{' '}
                    {a.stock}
                  </td>
                  <td className="colonne-actions">
                    <button
                      type="button"
                      className="bouton-mini"
                      onClick={() => ajouter(a)}
                      disabled={a.stock <= 0}
                    >
                      Ajouter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="admin-formulaire">
          <h2>Commande</h2>

          {lignes.length === 0 ? (
            <p className="lede large">Aucun article pour l’instant. Ajoutez-en depuis la liste.</p>
          ) : (
            <div className="large lignes-saisie">
              {lignes.map((l) => (
                <div key={l.article.id} className="ligne-saisie">
                  <div>
                    <strong>{l.article.nom}</strong>
                    <br />
                    <span className="mono">
                      {enUnites(l.article.prixCentimes)} · stock {l.article.stock}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={l.article.stock}
                    value={l.quantite}
                    onChange={(e) => changerQuantite(l.article.id, e.target.value)}
                    aria-label={`Quantité pour ${l.article.nom}`}
                  />
                  <span className="mono">{enUnites(l.article.prixCentimes * l.quantite)}</span>
                  <button
                    type="button"
                    className="bouton-mini danger"
                    onClick={() => setLignes((liste) => liste.filter((x) => x.article.id !== l.article.id))}
                  >
                    Retirer
                  </button>
                </div>
              ))}

              <div className="ligne-resume total">
                <span>Total</span>
                <span>{enUnites(total)}</span>
              </div>
            </div>
          )}

          <h2>Client</h2>

          <div className="champ large">
            <label htmlFor="clientId">Client inscrit</label>
            <select id="clientId" name="clientId" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Nouveau client (à saisir ci-dessous)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} — {c.email}
                </option>
              ))}
            </select>
          </div>

          <div className="champ">
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" defaultValue={client?.nom ?? ''} key={`nom-${clientId}`} required />
          </div>

          <div className="champ">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={client?.email ?? ''}
              key={`email-${clientId}`}
              required
            />
          </div>

          <div className="champ">
            <label htmlFor="telephone">Téléphone</label>
            <input id="telephone" name="telephone" defaultValue={client?.telephone ?? ''} key={`tel-${clientId}`} />
          </div>

          <div className="champ">
            <label htmlFor="ville">Ville</label>
            <input id="ville" name="ville" defaultValue={client?.ville ?? ''} key={`ville-${clientId}`} required />
          </div>

          <div className="champ large">
            <label htmlFor="adresse">Adresse de livraison</label>
            <textarea
              id="adresse"
              name="adresse"
              rows={2}
              defaultValue={client?.adresse ?? ''}
              key={`adr-${clientId}`}
              required
            />
          </div>

          <h2>Règlement</h2>

          <div className="champ">
            <label htmlFor="modePaiement">Mode</label>
            <select id="modePaiement" name="modePaiement" defaultValue="especes">
              <option value="especes">Espèces</option>
              <option value="virement">Virement</option>
              <option value="carte">Carte bancaire</option>
              <option value="hors_ligne">À la livraison</option>
            </select>
          </div>

          <div className="champ">
            <label htmlFor="statutPaiement">Statut</label>
            <select id="statutPaiement" name="statutPaiement" defaultValue="payee">
              <option value="payee">Payée</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>

          <div className="champ large">
            <label htmlFor="livraison">Frais de livraison ({symbole})</label>
            <input id="livraison" name="livraison" inputMode="decimal" defaultValue="0" />
          </div>

          <div className="champ large">
            <label htmlFor="noteInterne">Note interne</label>
            <input id="noteInterne" name="noteInterne" placeholder="Vente au comptoir, appel WhatsApp…" />
          </div>

          {erreur && <p className="message-erreur large">{erreur}</p>}

          <div className="pied-formulaire">
            <button className="btn btn-solid" type="submit" disabled={enCours || lignes.length === 0}>
              {enCours ? 'Enregistrement…' : 'Enregistrer la commande'}
            </button>
            <a className="btn btn-line" href="/admin/commandes">
              Annuler
            </a>
          </div>
        </div>
      </div>
    </form>
  )
}
