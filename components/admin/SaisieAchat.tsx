'use client'

import { useState } from 'react'
import { resoudreAchat, type ModeAchat } from '@/lib/bilan'
import { enregistrerAchat } from '@/app/admin/actions'
import FormulaireAdmin from './FormulaireAdmin'

type Produit = { id: string; nom: string; reference: string | null; stock: number; coutCentimes: number }

const formater = (centimes: number, symbole: string) =>
  `${(centimes / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbole}`

/**
 * Enregistrement d'un achat. Le calcul se fait sous les yeux : on voit combien
 * d'unités entrent et ce que chacune revient avant de valider.
 */
export default function SaisieAchat({
  produits,
  symbole,
  aujourdhui,
}: {
  produits: Produit[]
  symbole: string
  aujourdhui: string
}) {
  const [produitId, setProduitId] = useState('')
  const [mode, setMode] = useState<ModeAchat>('unite')
  const [prixPour, setPrixPour] = useState<'total' | 'piece'>('total')
  const [nombre, setNombre] = useState('1')
  const [quantiteParLot, setQuantiteParLot] = useState('12')
  const [prix, setPrix] = useState('')

  const produit = produits.find((p) => p.id === produitId)
  const apercu = resoudreAchat({
    mode,
    nombre: Number.parseInt(nombre, 10) || 0,
    quantiteParLot: Number.parseInt(quantiteParLot, 10) || 0,
    prix: Math.round((Number.parseFloat(prix.replace(',', '.')) || 0) * 100),
    prixPour,
  })

  return (
    <FormulaireAdmin action={enregistrerAchat} className="admin-formulaire">
      <h2>Enregistrer un achat</h2>

      <div className="champ large">
        <label htmlFor="produitId">Article</label>
        <select id="produitId" name="produitId" value={produitId} onChange={(e) => setProduitId(e.target.value)} required>
          <option value="">Choisir un article…</option>
          {produits.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
              {p.reference ? ` — ${p.reference}` : ''} (stock {p.stock})
            </option>
          ))}
        </select>
      </div>

      <div className="champ">
        <label htmlFor="mode">Acheté</label>
        <select id="mode" name="mode" value={mode} onChange={(e) => setMode(e.target.value as ModeAchat)}>
          <option value="unite">À l’unité</option>
          <option value="lot">Par lot / carton</option>
        </select>
      </div>

      <div className="champ">
        <label htmlFor="nombre">{mode === 'lot' ? 'Nombre de lots' : 'Nombre d’unités'}</label>
        <input
          id="nombre"
          name="nombre"
          type="number"
          min={1}
          inputMode="numeric"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      {mode === 'lot' && (
        <div className="champ">
          <label htmlFor="quantiteParLot">Unités par lot</label>
          <input
            id="quantiteParLot"
            name="quantiteParLot"
            type="number"
            min={1}
            inputMode="numeric"
            value={quantiteParLot}
            onChange={(e) => setQuantiteParLot(e.target.value)}
          />
        </div>
      )}

      <div className="champ">
        <label htmlFor="prixPour">Le prix saisi est</label>
        <select
          id="prixPour"
          name="prixPour"
          value={prixPour}
          onChange={(e) => setPrixPour(e.target.value as 'total' | 'piece')}
        >
          <option value="total">Le total payé</option>
          <option value="piece">{mode === 'lot' ? 'Le prix d’un lot' : 'Le prix d’une unité'}</option>
        </select>
      </div>

      <div className="champ">
        <label htmlFor="prix">Prix payé ({symbole})</label>
        <input
          id="prix"
          name="prix"
          inputMode="decimal"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          required
        />
      </div>

      <div className="champ">
        <label htmlFor="achteLe">Date de l’achat</label>
        <input id="achteLe" name="achteLe" type="date" defaultValue={aujourdhui} />
      </div>

      <div className="champ">
        <label htmlFor="fournisseur">Fournisseur</label>
        <input id="fournisseur" name="fournisseur" placeholder="Facultatif" />
      </div>

      <div className="champ large">
        <label htmlFor="note">Note</label>
        <input id="note" name="note" placeholder="Facultatif : numéro de facture, transport…" />
      </div>

      <div className="large recap-achat">
        {'erreur' in apercu ? (
          <p className="lede" style={{ margin: 0 }}>
            {apercu.erreur}
          </p>
        ) : (
          <>
            <div>
              <span className="mono">Entre en stock</span>
              <b>{apercu.quantite} unité(s)</b>
            </div>
            <div>
              <span className="mono">Revient à</span>
              <b>{formater(apercu.coutUnitaireCentimes, symbole)} l’unité</b>
            </div>
            <div>
              <span className="mono">Total payé</span>
              <b>{formater(apercu.prixTotalCentimes, symbole)}</b>
            </div>
            {produit && (
              <div>
                <span className="mono">Stock après</span>
                <b>{produit.stock + apercu.quantite}</b>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pied-formulaire">
        <button className="btn btn-solid" type="submit" disabled={'erreur' in apercu || !produitId}>
          Enregistrer l’achat
        </button>
      </div>
    </FormulaireAdmin>
  )
}
