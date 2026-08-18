import { describe, it, expect } from 'vitest'
import {
  resoudreAchat,
  coutMoyenPondere,
  calculerMarge,
  debutPeriode,
  debutPeriodePrecedente,
  evolution,
} from '../lib/bilan'

describe('saisie d’un achat', () => {
  it('achète à l’unité, prix total', () => {
    expect(resoudreAchat({ mode: 'unite', nombre: 20, quantiteParLot: 1, prix: 100000, prixPour: 'total' })).toEqual({
      quantite: 20,
      prixTotalCentimes: 100000,
      coutUnitaireCentimes: 5000,
    })
  })

  it('achète à l’unité, prix par pièce', () => {
    expect(resoudreAchat({ mode: 'unite', nombre: 20, quantiteParLot: 1, prix: 5000, prixPour: 'piece' })).toEqual({
      quantite: 20,
      prixTotalCentimes: 100000,
      coutUnitaireCentimes: 5000,
    })
  })

  it('achète par lots : 10 cartons de 12 à 6 000 le carton', () => {
    expect(resoudreAchat({ mode: 'lot', nombre: 10, quantiteParLot: 12, prix: 6000, prixPour: 'piece' })).toEqual({
      quantite: 120,
      prixTotalCentimes: 60000,
      coutUnitaireCentimes: 500,
    })
  })

  it('arrondit le coût unitaire quand la division tombe mal', () => {
    const resultat = resoudreAchat({ mode: 'unite', nombre: 3, quantiteParLot: 1, prix: 1000, prixPour: 'total' })
    expect(resultat).toEqual({ quantite: 3, prixTotalCentimes: 1000, coutUnitaireCentimes: 333 })
  })

  it('refuse les saisies vides ou négatives', () => {
    expect(resoudreAchat({ mode: 'unite', nombre: 0, quantiteParLot: 1, prix: 100, prixPour: 'total' })).toEqual({
      erreur: 'Indiquez une quantité supérieure à zéro.',
    })
    expect(resoudreAchat({ mode: 'unite', nombre: 5, quantiteParLot: 1, prix: 0, prixPour: 'total' })).toEqual({
      erreur: 'Indiquez le prix payé.',
    })
    expect(resoudreAchat({ mode: 'lot', nombre: 5, quantiteParLot: 0, prix: 100, prixPour: 'total' })).toEqual({
      erreur: 'Indiquez combien d’unités contient un lot.',
    })
  })
})

describe('coût moyen pondéré', () => {
  it('prend le nouveau coût quand il n’y avait pas de stock', () => {
    expect(coutMoyenPondere(0, 0, 10, 500)).toBe(500)
  })

  it('mélange l’ancien et le nouveau au prorata', () => {
    // 10 unités à 400 + 10 unités à 600 = 500 pièce.
    expect(coutMoyenPondere(10, 400, 10, 600)).toBe(500)
  })

  it('pèse plus lourd du côté du plus gros lot', () => {
    expect(coutMoyenPondere(30, 400, 10, 800)).toBe(500)
  })
})

describe('marge', () => {
  it('additionne chiffre d’affaires, coût et marge', () => {
    const marge = calculerMarge([
      { prixCentimes: 1000, coutCentimes: 600, quantite: 3 },
      { prixCentimes: 2000, coutCentimes: 1500, quantite: 1 },
    ])
    expect(marge.chiffreAffairesCentimes).toBe(5000)
    expect(marge.coutMarchandiseCentimes).toBe(3300)
    expect(marge.margeCentimes).toBe(1700)
    expect(marge.tauxMarge).toBe(34)
    expect(marge.unitesVendues).toBe(4)
  })

  it('ne divise pas par zéro sans vente', () => {
    expect(calculerMarge([])).toEqual({
      chiffreAffairesCentimes: 0,
      coutMarchandiseCentimes: 0,
      margeCentimes: 0,
      tauxMarge: 0,
      unitesVendues: 0,
    })
  })
})

describe('périodes', () => {
  const mercredi = new Date(2026, 7, 19, 15, 30) // mercredi 19 août 2026

  it('remonte au lundi pour la semaine', () => {
    expect(debutPeriode('semaine', mercredi)).toEqual(new Date(2026, 7, 17, 0, 0, 0, 0))
  })

  it('remonte au premier du mois et au premier janvier', () => {
    expect(debutPeriode('mois', mercredi)).toEqual(new Date(2026, 7, 1, 0, 0, 0, 0))
    expect(debutPeriode('annee', mercredi)).toEqual(new Date(2026, 0, 1, 0, 0, 0, 0))
  })

  it('borne la journée à minuit', () => {
    expect(debutPeriode('jour', mercredi)).toEqual(new Date(2026, 7, 19, 0, 0, 0, 0))
  })

  it('donne la période précédente', () => {
    expect(debutPeriodePrecedente('jour', mercredi)).toEqual(new Date(2026, 7, 18, 0, 0, 0, 0))
    expect(debutPeriodePrecedente('semaine', mercredi)).toEqual(new Date(2026, 7, 10, 0, 0, 0, 0))
    expect(debutPeriodePrecedente('mois', mercredi)).toEqual(new Date(2026, 6, 1, 0, 0, 0, 0))
    expect(debutPeriodePrecedente('annee', mercredi)).toEqual(new Date(2025, 0, 1, 0, 0, 0, 0))
  })
})

describe('évolution', () => {
  it('calcule une hausse et une baisse', () => {
    expect(evolution(1000, 1500)).toBe(50)
    expect(evolution(1000, 750)).toBe(-25)
  })

  it('ne compare rien quand il n’y avait rien', () => {
    expect(evolution(0, 500)).toBeNull()
    expect(evolution(0, 0)).toBe(0)
  })
})
