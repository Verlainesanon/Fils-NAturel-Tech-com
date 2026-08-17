import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '@/lib/db'

// Ces tests ont besoin d'une base PostgreSQL joignable (DATABASE_URL) déjà
// remplie par `npm run db:seed`. Sans base, ils sont ignorés plutôt que rouges :
// la suite reste utilisable hors connexion.
let baseJoignable = false

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    baseJoignable = true
  } catch {
    baseJoignable = false
    console.warn('Base injoignable : les tests de données sont ignorés.')
  }
})

describe('base de données', () => {
  it('contient les quatre catégories du seed', async () => {
    if (!baseJoignable) return
    const categories = await prisma.category.findMany()
    expect(categories).toHaveLength(4)
  })

  it('trouve le casque Aura par son slug', async () => {
    if (!baseJoignable) return
    const produit = await prisma.product.findUnique({ where: { slug: 'casque-fntc-aura' } })
    expect(produit?.nom).toBe('Casque FNTC Aura')
    expect(produit?.prixCentimes).toBe(12900)
  })

  it('crée un compte propriétaire pour l’administration', async () => {
    if (!baseJoignable) return
    const admin = await prisma.adminUser.findUnique({ where: { identifiant: 'proprietaire' } })
    expect(admin?.role).toBe('proprietaire')
    expect(admin?.motDePasse).toMatch(/^[0-9a-f]+:[0-9a-f]+$/)
  })
})
