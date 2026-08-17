import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync } from 'node:crypto'

const prisma = new PrismaClient()

// Copie locale du hachage : le seed tourne hors du contexte Next.
function hacher(motDePasse: string): string {
  const sel = randomBytes(16).toString('hex')
  return `${sel}:${scryptSync(motDePasse, sel, 64).toString('hex')}`
}

const CATEGORIES = [
  { slug: 'audio', nom: 'Audio', ordre: 1, description: 'Casques, enceintes et amplification.' },
  { slug: 'composants', nom: 'Composants', ordre: 2, description: 'Alimentation, cartes et pièces détachées.' },
  { slug: 'connecte', nom: 'Connecté', ordre: 3, description: 'Capteurs, modules et objets pilotables.' },
  { slug: 'accessoires', nom: 'Accessoires', ordre: 4, description: 'Câbles, hubs et protections.' },
]

type ProduitSeed = {
  slug: string
  nom: string
  descriptionCourte: string
  description: string
  prixCentimes: number
  promoCentimes?: number
  stock: number
  seuilAlerte?: number
  marque: string
  reference: string
  categorie: string
  miseEnAvant?: boolean
  caracteristiques: { cle: string; valeur: string }[]
}

const PRODUITS: ProduitSeed[] = [
  {
    slug: 'casque-fntc-aura',
    nom: 'Casque FNTC Aura',
    descriptionCourte: 'Réduction de bruit active, 40 h d’autonomie.',
    description:
      'Casque circum-auriculaire Bluetooth 5.3 avec réduction de bruit active sur deux micros. Coussinets en mousse à mémoire, arceau aluminium. Charge complète en 90 minutes, 40 heures d’écoute.',
    prixCentimes: 12900,
    promoCentimes: 9900,
    stock: 24,
    marque: 'FNTC',
    reference: 'FN-AUR-01',
    categorie: 'audio',
    miseEnAvant: true,
    caracteristiques: [
      { cle: 'Bluetooth', valeur: '5.3, portée 12 m' },
      { cle: 'Autonomie', valeur: '40 h (30 h avec réduction de bruit)' },
      { cle: 'Charge', valeur: 'USB-C, 90 min' },
      { cle: 'Poids', valeur: '268 g' },
    ],
  },
  {
    slug: 'enceinte-nomade-r12',
    nom: 'Enceinte nomade R12',
    descriptionCourte: 'Étanche IPX7, 20 W, 18 h d’autonomie.',
    description:
      'Enceinte portable 20 W avec radiateur passif. Boîtier étanche IPX7 supportant l’immersion brève. Appairage stéréo de deux unités.',
    prixCentimes: 7500,
    stock: 12,
    marque: 'FNTC',
    reference: 'FN-R12-00',
    categorie: 'audio',
    caracteristiques: [
      { cle: 'Puissance', valeur: '20 W' },
      { cle: 'Étanchéité', valeur: 'IPX7' },
      { cle: 'Autonomie', valeur: '18 h' },
    ],
  },
  {
    slug: 'ecouteurs-pulse-mini',
    nom: 'Écouteurs Pulse Mini',
    descriptionCourte: 'Intra-auriculaires, boîtier de charge 24 h.',
    description:
      'Écouteurs sans fil compacts avec détection de port. Boîtier de charge offrant trois recharges complètes, soit 24 heures d’usage.',
    prixCentimes: 4500,
    stock: 2,
    seuilAlerte: 4,
    marque: 'FNTC',
    reference: 'FN-PLS-M1',
    categorie: 'audio',
    caracteristiques: [
      { cle: 'Autonomie', valeur: '6 h + 18 h en boîtier' },
      { cle: 'Commandes', valeur: 'Tactiles' },
    ],
  },
  {
    slug: 'alimentation-65w-gan',
    nom: 'Alimentation 65 W GaN',
    descriptionCourte: 'Deux ports USB-C Power Delivery.',
    description:
      'Chargeur au nitrure de gallium, 40 % plus compact qu’un modèle silicium équivalent. Répartition automatique entre les deux ports.',
    prixCentimes: 3900,
    stock: 63,
    marque: 'FNTC',
    reference: 'FN-PSU-65',
    categorie: 'composants',
    miseEnAvant: true,
    caracteristiques: [
      { cle: 'Puissance', valeur: '65 W total' },
      { cle: 'Ports', valeur: '2 × USB-C PD 3.0' },
      { cle: 'Protection', valeur: 'Surtension et surchauffe' },
    ],
  },
  {
    slug: 'carte-microcontroleur-m4',
    nom: 'Carte microcontrôleur M4',
    descriptionCourte: 'Cortex-M4 120 MHz, 30 broches.',
    description:
      'Carte de développement compatible avec les chaînes d’outils habituelles. 30 broches exposées, USB-C, bouton de réinitialisation accessible.',
    prixCentimes: 2200,
    stock: 88,
    marque: 'FNTC',
    reference: 'FN-MCU-M4',
    categorie: 'composants',
    caracteristiques: [
      { cle: 'Processeur', valeur: 'Cortex-M4 120 MHz' },
      { cle: 'Mémoire', valeur: '512 Ko flash, 128 Ko RAM' },
      { cle: 'Broches', valeur: '30 (dont 12 analogiques)' },
    ],
  },
  {
    slug: 'batterie-lithium-5000',
    nom: 'Batterie lithium 5000 mAh',
    descriptionCourte: 'Cellule protégée, connecteur JST.',
    description:
      'Cellule lithium-polymère avec circuit de protection intégré contre la surcharge et la décharge profonde. Câble JST-PH fourni.',
    prixCentimes: 1800,
    stock: 0,
    marque: 'FNTC',
    reference: 'FN-BAT-50',
    categorie: 'composants',
    caracteristiques: [
      { cle: 'Capacité', valeur: '5000 mAh' },
      { cle: 'Tension', valeur: '3,7 V nominal' },
    ],
  },
  {
    slug: 'module-capteur-iot',
    nom: 'Module capteur IoT',
    descriptionCourte: 'Wi-Fi + BLE, trois capteurs intégrés.',
    description:
      'Module compact mesurant température, humidité et luminosité, avec Wi-Fi et Bluetooth basse consommation. Consommation en veille sous 20 µA.',
    prixCentimes: 3400,
    stock: 15,
    marque: 'FNTC',
    reference: 'FN-IOT-11',
    categorie: 'connecte',
    miseEnAvant: true,
    caracteristiques: [
      { cle: 'Radio', valeur: 'Wi-Fi 4 + BLE 5' },
      { cle: 'Capteurs', valeur: 'Température, humidité, luminosité' },
      { cle: 'Veille', valeur: '< 20 µA' },
    ],
  },
  {
    slug: 'prise-connectee-16a',
    nom: 'Prise connectée 16 A',
    descriptionCourte: 'Mesure de consommation en temps réel.',
    description:
      'Prise pilotable à distance avec relevé de consommation instantanée et cumulée. Fonctionne sans passerelle propriétaire.',
    prixCentimes: 2600,
    stock: 34,
    marque: 'FNTC',
    reference: 'FN-PRI-16',
    categorie: 'connecte',
    caracteristiques: [
      { cle: 'Intensité', valeur: '16 A / 3680 W' },
      { cle: 'Mesure', valeur: 'Puissance instantanée et cumulée' },
    ],
  },
  {
    slug: 'camera-interieure-2k',
    nom: 'Caméra intérieure 2K',
    descriptionCourte: 'Stockage local sur carte SD.',
    description:
      'Caméra de surveillance intérieure filmant en 2K, avec vision nocturne infrarouge et enregistrement local sur carte microSD jusqu’à 128 Go.',
    prixCentimes: 5900,
    promoCentimes: 4700,
    stock: 9,
    marque: 'FNTC',
    reference: 'FN-CAM-2K',
    categorie: 'connecte',
    caracteristiques: [
      { cle: 'Résolution', valeur: '2560 × 1440' },
      { cle: 'Stockage', valeur: 'microSD jusqu’à 128 Go' },
      { cle: 'Vision nocturne', valeur: 'Infrarouge, 8 m' },
    ],
  },
  {
    slug: 'hub-8-ports-usb-c',
    nom: 'Hub 8 ports USB-C',
    descriptionCourte: 'HDMI 4K, Ethernet, charge 100 W.',
    description:
      'Hub aluminium 8-en-1 : HDMI 4K à 60 Hz, trois USB-A, lecteur de cartes SD et microSD, Ethernet gigabit et recharge passante 100 W.',
    prixCentimes: 4900,
    stock: 41,
    marque: 'FNTC',
    reference: 'FN-HUB-08',
    categorie: 'accessoires',
    caracteristiques: [
      { cle: 'Vidéo', valeur: 'HDMI 4K 60 Hz' },
      { cle: 'Réseau', valeur: 'Ethernet gigabit' },
      { cle: 'Charge passante', valeur: '100 W' },
    ],
  },
  {
    slug: 'cable-usb-c-tresse-2m',
    nom: 'Câble USB-C tressé 2 m',
    descriptionCourte: '100 W, transfert 10 Gb/s.',
    description:
      'Câble USB-C vers USB-C en nylon tressé, testé à 25 000 pliages. Supporte la charge 100 W et le transfert de données à 10 Gb/s.',
    prixCentimes: 1200,
    stock: 120,
    marque: 'FNTC',
    reference: 'FN-CBL-2M',
    categorie: 'accessoires',
    caracteristiques: [
      { cle: 'Longueur', valeur: '2 m' },
      { cle: 'Charge', valeur: '100 W' },
      { cle: 'Débit', valeur: '10 Gb/s' },
    ],
  },
  {
    slug: 'station-accueil-double-ecran',
    nom: 'Station d’accueil double écran',
    descriptionCourte: 'Deux sorties 4K, 12 connecteurs.',
    description:
      'Station d’accueil pour poste fixe : deux sorties vidéo 4K indépendantes, six ports USB, Ethernet, jack audio et alimentation portable 85 W.',
    prixCentimes: 15900,
    stock: 6,
    seuilAlerte: 3,
    marque: 'FNTC',
    reference: 'FN-STA-D2',
    categorie: 'accessoires',
    caracteristiques: [
      { cle: 'Écrans', valeur: '2 × 4K 60 Hz' },
      { cle: 'Ports', valeur: '12 au total' },
      { cle: 'Alimentation', valeur: '85 W vers le portable' },
    ],
  },
]

async function main() {
  // Le seed tourne à chaque déploiement : sans ce garde-fou, il ressusciterait
  // les produits d'exemple supprimés. FORCE_SEED=1 permet de le forcer.
  const dejaInitialisee = (await prisma.adminUser.count()) > 0
  if (dejaInitialisee && process.env.FORCE_SEED !== '1') {
    console.log('Base déjà initialisée : rien à faire.')
    return
  }

  for (const categorie of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: categorie.slug },
      update: { nom: categorie.nom, ordre: categorie.ordre, description: categorie.description },
      create: categorie,
    })
  }

  const parSlug = new Map(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id] as const)
  )

  for (const produit of PRODUITS) {
    const { categorie, caracteristiques, ...reste } = produit
    const donnees = {
      ...reste,
      caracteristiques: JSON.stringify(caracteristiques),
      categorieId: parSlug.get(categorie)!,
    }
    await prisma.product.upsert({
      where: { slug: produit.slug },
      update: donnees,
      create: donnees,
    })
  }

  for (const devise of [
    { code: 'HTG', nom: 'Gourde haïtienne', symbole: 'G', taux: 1, base: true, ordre: 1 },
    { code: 'USD', nom: 'Dollar américain', symbole: '$', taux: 0.0076, base: false, ordre: 2 },
    { code: 'EUR', nom: 'Euro', symbole: '€', taux: 0.007, base: false, ordre: 3 },
  ]) {
    await prisma.devise.upsert({ where: { code: devise.code }, update: {}, create: devise })
  }

  await prisma.promo.upsert({
    where: { code: 'FNTC10' },
    update: {},
    create: {
      code: 'FNTC10',
      type: 'pourcentage',
      valeur: 10,
      portee: 'tout',
      minimumCentimes: 5000,
      actif: true,
    },
  })

  const motDePasse = process.env.ADMIN_MOTDEPASSE || 'FNTC-admin-2026'
  await prisma.adminUser.upsert({
    where: { identifiant: 'proprietaire' },
    update: {},
    create: {
      identifiant: 'proprietaire',
      nom: 'Propriétaire',
      motDePasse: hacher(motDePasse),
      role: 'proprietaire',
    },
  })

  console.log('Seed terminé.')
  console.log(`  ${CATEGORIES.length} catégories, ${PRODUITS.length} produits, 3 devises, 1 code promo (FNTC10).`)
  console.log(`  Admin : identifiant « proprietaire », mot de passe « ${motDePasse} » — à changer.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
