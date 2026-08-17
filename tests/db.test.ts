import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/db'

describe('base de données', () => {
  it('contient les quatre catégories du seed', async () => {
    const categories = await prisma.category.findMany()
    expect(categories).toHaveLength(4)
  })

  it('trouve le casque Aura par son slug', async () => {
    const produit = await prisma.product.findUnique({ where: { slug: 'casque-fntc-aura' } })
    expect(produit?.nom).toBe('Casque FNTC Aura')
    expect(produit?.prixCentimes).toBe(12900)
  })

  it('crée un compte propriétaire pour l’administration', async () => {
    const admin = await prisma.adminUser.findUnique({ where: { identifiant: 'proprietaire' } })
    expect(admin?.role).toBe('proprietaire')
    expect(admin?.motDePasse).toMatch(/^[0-9a-f]+:[0-9a-f]+$/)
  })
})
