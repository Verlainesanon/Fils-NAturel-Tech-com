# Fils Naturel Tech-Com — site e-commerce

Boutique en ligne complète : vitrine, panier, commande sans compte, chat support et
administration à quatre rôles.

## Démarrer le site sur votre ordinateur

Vous avez besoin de Node.js 20 ou plus récent et d'une base PostgreSQL. Le plus
simple est d'utiliser la base créée sur Render : copiez son « External Database URL »
dans un fichier `.env` (modèle dans `.env.example`), puis :

```bash
npm install          # une seule fois
npm run db:init      # crée les tables et les données de départ
npm run dev          # démarre le site
```

Le site est alors sur http://localhost:3000 et l’administration sur
http://localhost:3000/admin.

**Premier accès à l’administration**

- identifiant : `proprietaire`
- mot de passe : `FNTC-admin-2026`

Changez ce mot de passe dès la première connexion, dans *Comptes admin*.

## Mettre le site en ligne

Le projet est prêt pour **Render** : le fichier `render.yaml` décrit le site et sa base
de données, Render fait le reste. Marche à suivre complète dans
`docs/DEPLOIEMENT.md`.

## Ce que contient le site

**Vitrine**

- Accueil, catalogue avec recherche, filtres et tri, fiche produit avec galerie
- Panier, codes promo, commande sans inscription, page de suivi
- Compte client optionnel avec badge de fidélité (bronze, argent, or)
- Chat support, ouvrable sans compte, relevé depuis l’administration

**Administration** (`/admin`)

| Section | Ce qu’on y fait |
|---|---|
| Tableau de bord | Chiffre d’affaires, alertes, dernières commandes |
| Produits | Créer, modifier, archiver ; images, caractéristiques, référencement |
| Catégories | Rayons et sous-rayons, ordre d’affichage |
| Stock et ruptures | Ajuster le stock avec motif, historique des mouvements |
| Promotions | Codes en pourcentage, montant fixe ou livraison offerte |
| Commandes | Changer l’état, saisir un suivi, annuler (le stock revient) |
| Clients | Historique d’achat, badge, notes internes |
| Messages | Répondre au chat, classer les conversations |
| Textes du site | Modifier tous les textes de la vitrine sans toucher au code |
| Médiathèque | Images réutilisables |
| Bannières | Bandeau promotionnel daté |
| Paramètres | Identité, livraison, paiement, devise, paliers de fidélité |
| Comptes admin | Créer des comptes, attribuer un rôle, réinitialiser un mot de passe |
| Journal d’audit | Qui a fait quoi, quand — non effaçable |

**Rôles**, du plus limité au plus large : `viewer` (lecture), `vendeur` (commandes,
stock, messages), `gestionnaire` (catalogue et contenus), `proprietaire` (tout).
Un rôle donne accès à ce que permettent les rôles inférieurs. Les vues interdites
n’apparaissent pas dans le menu, et le serveur revérifie le rôle à chaque action.

## Commandes utiles

```bash
npm run dev        # site en développement
npm run build      # construire la version de production
npm run start      # lancer la version construite
npm test           # tests automatisés
npm run db:init    # créer les tables et charger les données de départ
npm run db:studio  # explorer la base dans le navigateur
```

## Ce qui reste à brancher

- **Paiement par carte** : le site accepte aujourd’hui le paiement à la livraison et
  le virement. La carte bancaire (Stripe) demande vos clés ; l’option existe déjà dans
  *Paramètres*.
- **Facture PDF et remboursement en ligne** : prévus après le branchement de Stripe.
- **Chat instantané** : les messages arrivent par relève toutes les 5 secondes, ce qui
  suffit largement au support. Un service temps réel n’est pas nécessaire.

## Technique

Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL ·
Tailwind + design system maison · Vitest. Mots de passe hachés avec scrypt, sessions en
cookie httpOnly, toute action modifiante journalisée.
