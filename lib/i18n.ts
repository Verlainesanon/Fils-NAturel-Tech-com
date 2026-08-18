import { cookies, headers } from 'next/headers'

/**
 * Traduction de l'interface. La langue est devinée à partir du navigateur du
 * visiteur, et peut être forcée depuis le sélecteur. Les textes que vous
 * saisissez vous-même (produits, blocs de contenu) restent dans la langue de
 * saisie : les traduire demanderait un service de traduction externe.
 */

export const LANGUES = [
  { code: 'fr', nom: 'Français' },
  { code: 'ht', nom: 'Kreyòl' },
  { code: 'en', nom: 'English' },
] as const

export type Langue = (typeof LANGUES)[number]['code']

const COOKIE_LANGUE = 'fntc_langue'

type Dictionnaire = Record<string, string>

const FR: Dictionnaire = {
  'nav.accueil': 'Accueil',
  'nav.catalogue': 'Catalogue',
  'nav.speciaux': 'Spéciaux',
  'nav.suivi': 'Suivi',
  'nav.connexion': 'Se connecter',
  'nav.panier': 'Panier',
  'hero.catalogue': 'Voir le catalogue',
  'hero.speciaux': 'Voir les spéciaux',
  'rayons.aide': 'Chaque pastille est un rayon — touchez pour l’ouvrir',
  'rayons.aussi': 'Aussi',
  'rayons.references': 'réf.',
  'strip.teste': 'Testé avant vente',
  'strip.sansCompte': 'Commande sans compte',
  'strip.livraison': 'Livraison',
  'strip.chat': 'Chat relevé par l’équipe',
  'accueil.selection': 'Sélection',
  'accueil.recommandons': 'Ce que nous recommandons',
  'accueil.toutCatalogue': 'Tout le catalogue',
  'accueil.catalogueVide': 'Le catalogue arrive. Revenez très vite.',
  'accueil.references': 'références au catalogue',
  'accueil.rayons': 'rayons',
  'accueil.commandesLivrees': 'commandes livrées',
  'accueil.livraisonOfferte': 'livraison offerte à partir de',
  'accueil.apropos': 'À propos',
  'produit.ajouter': 'Ajouter au panier',
  'produit.ajout': 'Ajout…',
  'produit.ajoute': 'Ajouté au panier.',
  'produit.epuise': 'Épuisé',
  'produit.enStock': 'en stock',
  'produit.plusQue': 'Plus que',
  'produit.stock': 'Stock',
  'produit.pieces': 'pièces',
  'produit.voir': 'Voir',
  'produit.promo': 'Promo',
  'produit.rupture': 'Rupture',
  'produit.description': 'Description',
  'produit.memeRayon': 'Même rayon',
  'produit.aussi': 'À regarder aussi',
  'produit.livraison': 'Livraison',
  'panier.titre': 'Panier',
  'panier.vide': 'Votre panier est vide',
  'panier.videTexte': 'Ajoutez du matériel depuis le catalogue : le panier se garde 30 jours, même sans compte.',
  'panier.article': 'article',
  'panier.articles': 'articles',
  'panier.recapitulatif': 'Récapitulatif',
  'panier.sousTotal': 'Sous-total',
  'panier.remise': 'Remise',
  'panier.livraison': 'Livraison',
  'panier.offerte': 'Offerte',
  'panier.total': 'Total',
  'panier.codePromo': 'Code promo',
  'panier.appliquer': 'Appliquer',
  'panier.commander': 'Passer la commande',
  'panier.continuer': 'Continuer mes achats',
  'panier.retirer': 'Retirer',
  'panier.lunite': 'l’unité',
  'panier.quantite': 'Quantité',
  'devise.choisir': 'Devise',
  'langue.choisir': 'Langue',
}

const HT: Dictionnaire = {
  'nav.accueil': 'Akèy',
  'nav.catalogue': 'Katalòg',
  'nav.speciaux': 'Espesyal',
  'nav.suivi': 'Swiv kòmann',
  'nav.connexion': 'Konekte',
  'nav.panier': 'Panye',
  'hero.catalogue': 'Gade katalòg la',
  'hero.speciaux': 'Gade espesyal yo',
  'rayons.aide': 'Chak ti wonn se yon reyon — manyen pou ouvri l',
  'rayons.aussi': 'Genyen tou',
  'rayons.references': 'atik',
  'strip.teste': 'Teste anvan vann',
  'strip.sansCompte': 'Kòmande san kont',
  'strip.livraison': 'Livrezon',
  'strip.chat': 'Ekip la reponn chat la',
  'accueil.selection': 'Seleksyon',
  'accueil.recommandons': 'Sa nou rekòmande',
  'accueil.toutCatalogue': 'Tout katalòg la',
  'accueil.catalogueVide': 'Katalòg la ap vini. Tounen byento.',
  'accueil.references': 'atik nan katalòg la',
  'accueil.rayons': 'reyon',
  'accueil.commandesLivrees': 'kòmann livre',
  'accueil.livraisonOfferte': 'livrezon gratis apati de',
  'accueil.apropos': 'Sou nou',
  'produit.ajouter': 'Mete nan panye',
  'produit.ajout': 'N ap mete…',
  'produit.ajoute': 'Mete nan panye.',
  'produit.epuise': 'Fini',
  'produit.enStock': 'nan stòk',
  'produit.plusQue': 'Rete sèlman',
  'produit.stock': 'Stòk',
  'produit.pieces': 'pyès',
  'produit.voir': 'Gade',
  'produit.promo': 'Pwomosyon',
  'produit.rupture': 'Fini',
  'produit.description': 'Deskripsyon',
  'produit.memeRayon': 'Menm reyon',
  'produit.aussi': 'Gade tou',
  'produit.livraison': 'Livrezon',
  'panier.titre': 'Panye',
  'panier.vide': 'Panye w vid',
  'panier.videTexte': 'Ajoute materyèl depi nan katalòg la : panye a rete 30 jou, menm san kont.',
  'panier.article': 'atik',
  'panier.articles': 'atik',
  'panier.recapitulatif': 'Rezime',
  'panier.sousTotal': 'Sou-total',
  'panier.remise': 'Rabè',
  'panier.livraison': 'Livrezon',
  'panier.offerte': 'Gratis',
  'panier.total': 'Total',
  'panier.codePromo': 'Kòd pwomosyon',
  'panier.appliquer': 'Aplike',
  'panier.commander': 'Fè kòmann nan',
  'panier.continuer': 'Kontinye achte',
  'panier.retirer': 'Retire',
  'panier.lunite': 'chak',
  'panier.quantite': 'Kantite',
  'devise.choisir': 'Lajan',
  'langue.choisir': 'Lang',
}

const EN: Dictionnaire = {
  'nav.accueil': 'Home',
  'nav.catalogue': 'Catalogue',
  'nav.speciaux': 'Deals',
  'nav.suivi': 'Track order',
  'nav.connexion': 'Sign in',
  'nav.panier': 'Cart',
  'hero.catalogue': 'Browse the catalogue',
  'hero.speciaux': 'See the deals',
  'rayons.aide': 'Each pad is a section — tap to open it',
  'rayons.aussi': 'Also',
  'rayons.references': 'items',
  'strip.teste': 'Tested before sale',
  'strip.sansCompte': 'Order without an account',
  'strip.livraison': 'Delivery',
  'strip.chat': 'Chat answered by the team',
  'accueil.selection': 'Selection',
  'accueil.recommandons': 'What we recommend',
  'accueil.toutCatalogue': 'Full catalogue',
  'accueil.catalogueVide': 'The catalogue is on its way. Come back soon.',
  'accueil.references': 'items in the catalogue',
  'accueil.rayons': 'sections',
  'accueil.commandesLivrees': 'orders delivered',
  'accueil.livraisonOfferte': 'free delivery from',
  'accueil.apropos': 'About',
  'produit.ajouter': 'Add to cart',
  'produit.ajout': 'Adding…',
  'produit.ajoute': 'Added to cart.',
  'produit.epuise': 'Sold out',
  'produit.enStock': 'in stock',
  'produit.plusQue': 'Only',
  'produit.stock': 'Stock',
  'produit.pieces': 'units',
  'produit.voir': 'View',
  'produit.promo': 'Sale',
  'produit.rupture': 'Sold out',
  'produit.description': 'Description',
  'produit.memeRayon': 'Same section',
  'produit.aussi': 'Also worth a look',
  'produit.livraison': 'Delivery',
  'panier.titre': 'Cart',
  'panier.vide': 'Your cart is empty',
  'panier.videTexte': 'Add gear from the catalogue: the cart is kept for 30 days, even without an account.',
  'panier.article': 'item',
  'panier.articles': 'items',
  'panier.recapitulatif': 'Summary',
  'panier.sousTotal': 'Subtotal',
  'panier.remise': 'Discount',
  'panier.livraison': 'Delivery',
  'panier.offerte': 'Free',
  'panier.total': 'Total',
  'panier.codePromo': 'Promo code',
  'panier.appliquer': 'Apply',
  'panier.commander': 'Place the order',
  'panier.continuer': 'Keep shopping',
  'panier.retirer': 'Remove',
  'panier.lunite': 'each',
  'panier.quantite': 'Quantity',
  'devise.choisir': 'Currency',
  'langue.choisir': 'Language',
}

const DICTIONNAIRES: Record<Langue, Dictionnaire> = { fr: FR, ht: HT, en: EN }

function estLangue(valeur: string): valeur is Langue {
  return LANGUES.some((l) => l.code === valeur)
}

/** Langue forcée par le visiteur, sinon celle de son navigateur, sinon français. */
export function langueActuelle(): Langue {
  const choisie = cookies().get(COOKIE_LANGUE)?.value
  if (choisie && estLangue(choisie)) return choisie

  const entete = headers().get('accept-language') ?? ''
  for (const morceau of entete.split(',')) {
    const code = morceau.trim().slice(0, 2).toLowerCase()
    if (code === 'ht' || code === 'fr' || code === 'en') return code
    // Le créole haïtien est parfois annoncé comme « hat » ou via la région HT.
    if (morceau.toLowerCase().includes('-ht')) return 'ht'
  }
  return 'fr'
}

export function traduire(langue: Langue, cle: string): string {
  return DICTIONNAIRES[langue]?.[cle] ?? FR[cle] ?? cle
}

/** Raccourci prêt à l'emploi dans une page. */
export function traducteur(langue: Langue) {
  return (cle: string) => traduire(langue, cle)
}
