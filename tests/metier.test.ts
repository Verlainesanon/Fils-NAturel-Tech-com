import { describe, it, expect } from 'vitest'
import { prixEffectif, formaterPrix, slugifier } from '@/lib/format'
import { peut } from '@/lib/roles'
import { verifierMotDePasse, hacherMotDePasse } from '@/lib/auth'

const base = { prixCentimes: 10000, promoCentimes: null, promoDebut: null, promoFin: null }

describe('prix effectif', () => {
  it('retient le prix normal sans promotion', () => {
    expect(prixEffectif(base)).toEqual({ centimes: 10000, enPromo: false })
  })

  it('applique une promotion sans dates', () => {
    expect(prixEffectif({ ...base, promoCentimes: 7500 })).toEqual({ centimes: 7500, enPromo: true })
  })

  it('ignore une promotion pas encore commencée', () => {
    const demain = new Date(Date.now() + 86_400_000)
    expect(prixEffectif({ ...base, promoCentimes: 7500, promoDebut: demain })).toEqual({
      centimes: 10000,
      enPromo: false,
    })
  })

  it('ignore une promotion expirée', () => {
    const hier = new Date(Date.now() - 86_400_000)
    expect(prixEffectif({ ...base, promoCentimes: 7500, promoFin: hier })).toEqual({
      centimes: 10000,
      enPromo: false,
    })
  })

  it('ignore une promotion plus chère que le prix normal', () => {
    expect(prixEffectif({ ...base, promoCentimes: 12000 })).toEqual({ centimes: 10000, enPromo: false })
  })
})

describe('formatage', () => {
  it('affiche les centimes en unités avec deux décimales', () => {
    expect(formaterPrix(12900, '€')).toBe('129,00 €')
    expect(formaterPrix(50, '$')).toBe('0,50 $')
  })

  it('transforme un nom en adresse de page', () => {
    expect(slugifier('Casque FNTC Aura — édition spéciale')).toBe('casque-fntc-aura-edition-speciale')
  })
})

describe('rôles', () => {
  it('accorde à un rôle supérieur les droits des rôles inférieurs', () => {
    expect(peut('proprietaire', 'vendeur')).toBe(true)
    expect(peut('gestionnaire', 'viewer')).toBe(true)
  })

  it('refuse un rôle insuffisant', () => {
    expect(peut('vendeur', 'gestionnaire')).toBe(false)
    expect(peut('viewer', 'vendeur')).toBe(false)
  })

  it('refuse une valeur inconnue ou vide', () => {
    expect(peut('inventé', 'viewer')).toBe(false)
    expect(peut(null, 'viewer')).toBe(false)
  })
})

describe('mots de passe', () => {
  it('valide le bon mot de passe et rejette les autres', () => {
    const empreinte = hacherMotDePasse('mot-de-passe-solide')
    expect(verifierMotDePasse('mot-de-passe-solide', empreinte)).toBe(true)
    expect(verifierMotDePasse('mot-de-passe-solidE', empreinte)).toBe(false)
  })

  it('produit une empreinte différente à chaque fois', () => {
    expect(hacherMotDePasse('identique')).not.toBe(hacherMotDePasse('identique'))
  })
})
