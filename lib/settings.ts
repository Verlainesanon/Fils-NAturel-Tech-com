import { prisma } from '@/lib/db'

// Réglages éditables depuis l'admin. Les valeurs par défaut servent tant que
// la ligne n'existe pas en base : le site fonctionne sur une base vierge.
export const REGLAGES_DEFAUT = {
  SITE_NOM: 'Fils Naturel Tech-Com',
  SITE_SLOGAN: 'La technologie, sans compromis.',
  SITE_EMAIL: 'contact@fntc.ht',
  SITE_TELEPHONE: '+509 0000 0000',
  SITE_ADRESSE: 'Port-au-Prince, Haïti',
  SITE_LOGO: '',
  DEVISE_SYMBOLE: '€',
  LIVRAISON_CENTIMES: '500',
  LIVRAISON_GRATUITE_DES: '10000',
  LIVRAISON_DELAI: '2 à 5 jours ouvrés',
  PAIEMENT_CARTE: 'non',
  PAIEMENT_HORS_LIGNE: 'oui',
  RESEAU_FACEBOOK: '',
  RESEAU_INSTAGRAM: '',
  RESEAU_WHATSAPP: '',
  BADGE_BRONZE: '1',
  BADGE_ARGENT: '5',
  BADGE_OR: '15',
} as const

export type CleReglage = keyof typeof REGLAGES_DEFAUT
export type Reglages = Record<CleReglage, string>

export async function lireReglages(): Promise<Reglages> {
  const lignes = await prisma.setting.findMany()
  const valeurs = { ...REGLAGES_DEFAUT } as Reglages
  for (const ligne of lignes) {
    if (ligne.cle in valeurs) valeurs[ligne.cle as CleReglage] = ligne.valeur
  }
  return valeurs
}

export async function ecrireReglages(entrees: Partial<Reglages>): Promise<void> {
  for (const [cle, valeur] of Object.entries(entrees)) {
    if (!(cle in REGLAGES_DEFAUT)) continue
    await prisma.setting.upsert({
      where: { cle },
      update: { valeur: valeur ?? '' },
      create: { cle, valeur: valeur ?? '' },
    })
  }
}

export function entier(valeur: string, defaut = 0): number {
  const n = Number.parseInt(valeur, 10)
  return Number.isFinite(n) ? n : defaut
}
