import { prisma } from '@/lib/db'

/**
 * Blocs de contenu éditables depuis l'admin. Chaque clé correspond à un
 * emplacement précis de la vitrine. Les valeurs ci-dessous sont le texte de
 * départ : l'admin les écrase sans qu'on touche au code.
 */
export const BLOCS_DEFAUT: Record<string, { zone: string; type: string; valeur: string; valeurAlt?: string }> = {
  'accueil.hero.surtitre': { zone: 'accueil', type: 'texte', valeur: 'Électronique & composants' },
  'accueil.hero.titre': { zone: 'accueil', type: 'titre', valeur: 'Du matériel choisi pièce par pièce.' },
  'accueil.hero.texte': {
    zone: 'accueil',
    type: 'texte',
    valeur:
      'Audio, composants, objets connectés et accessoires. Chaque référence est testée avant d’entrer au catalogue.',
  },
  'accueil.hero.bouton': { zone: 'accueil', type: 'bouton', valeur: 'Voir le catalogue', valeurAlt: '/boutique' },
  'accueil.promesse1.titre': { zone: 'accueil', type: 'titre', valeur: 'Testé avant vente' },
  'accueil.promesse1.texte': {
    zone: 'accueil',
    type: 'texte',
    valeur: 'Chaque lot est vérifié à réception. Ce qui ne passe pas ne part pas.',
  },
  'accueil.promesse2.titre': { zone: 'accueil', type: 'titre', valeur: 'Commande sans compte' },
  'accueil.promesse2.texte': {
    zone: 'accueil',
    type: 'texte',
    valeur: 'Un email et une adresse suffisent. Le compte reste optionnel.',
  },
  'accueil.promesse3.titre': { zone: 'accueil', type: 'titre', valeur: 'Une vraie personne au bout' },
  'accueil.promesse3.texte': {
    zone: 'accueil',
    type: 'texte',
    valeur: 'Le chat est relevé par l’équipe, pas par un robot. Réponse le jour même.',
  },
  'apropos.titre': { zone: 'apropos', type: 'titre', valeur: 'Qui sommes-nous' },
  'apropos.corps': {
    zone: 'apropos',
    type: 'texte',
    valeur:
      'Fils Naturel Tech-Com approvisionne particuliers et ateliers en matériel électronique fiable. Nous sélectionnons peu de références, mais nous les connaissons toutes.',
  },
  'pied.mention': {
    zone: 'pied',
    type: 'texte',
    valeur: 'Prix en toutes taxes comprises. Livraison sur tout le territoire.',
  },
}

export type Blocs = Record<string, { valeur: string; valeurAlt: string | null }>

/** Charge les blocs publiés, complétés par les valeurs de départ. */
export async function lireBlocs(zone?: string): Promise<Blocs> {
  const lignes = await prisma.contentBlock.findMany({
    where: { statut: 'publie', ...(zone ? { zone } : {}) },
  })
  const blocs: Blocs = {}
  for (const [cle, defaut] of Object.entries(BLOCS_DEFAUT)) {
    if (zone && defaut.zone !== zone) continue
    blocs[cle] = { valeur: defaut.valeur, valeurAlt: defaut.valeurAlt ?? null }
  }
  for (const ligne of lignes) {
    blocs[ligne.cle] = { valeur: ligne.valeur, valeurAlt: ligne.valeurAlt }
  }
  return blocs
}

export function bloc(blocs: Blocs, cle: string): string {
  return blocs[cle]?.valeur ?? BLOCS_DEFAUT[cle]?.valeur ?? ''
}

export function blocAlt(blocs: Blocs, cle: string): string {
  return blocs[cle]?.valeurAlt ?? BLOCS_DEFAUT[cle]?.valeurAlt ?? ''
}
