# Mettre le site en ligne — pas à pas

Objectif : passer d’un site qui tourne sur votre ordinateur à une adresse publique que
vous pouvez partager. Comptez une heure la première fois. Tout ce qui suit est gratuit
aux volumes d’une boutique qui démarre.

Trois comptes à créer, dans cet ordre : GitHub (le code), Neon (la base de données),
Vercel (l’hébergement).

---

## 1. Mettre le code sur GitHub

1. Créez un compte sur https://github.com puis un dépôt **privé** nommé `fntc`.
   Ne cochez rien d’autre (pas de README, pas de .gitignore).
2. Dans le dossier du projet, un terminal ouvert, tapez :

```bash
git remote add origin https://github.com/VOTRE-NOM/fntc.git
git branch -M main
git push -u origin main
```

GitHub demandera vos identifiants. Si un mot de passe est refusé, créez un jeton dans
*Settings → Developer settings → Personal access tokens* et utilisez-le comme mot de
passe.

La base `prisma/dev.db` n’est pas envoyée : c’est voulu, la vraie base sera ailleurs.

---

## 2. Créer la base de données (Neon)

1. Compte gratuit sur https://neon.tech.
2. *Create project* → nom `fntc`, région la plus proche de vos clients.
3. Neon affiche une **chaîne de connexion** qui commence par `postgresql://`.
   Copiez-la, gardez-la de côté.

Puis, dans le projet, ouvrez `prisma/schema.prisma` et changez une seule ligne :

```prisma
datasource db {
  provider = "postgresql"   // au lieu de "sqlite"
  url      = env("DATABASE_URL")
}
```

Créez ensuite le fichier `.env.production.local` (il n’est jamais envoyé sur GitHub) :

```
DATABASE_URL="la-chaine-copiee-chez-neon"
```

Et préparez la base distante :

```bash
npx dotenv -e .env.production.local -- npx prisma migrate deploy
npx dotenv -e .env.production.local -- npx prisma db seed
```

Si la commande `dotenv` n’existe pas, remplacez temporairement `DATABASE_URL` dans
`.env` par la chaîne Neon, lancez `npx prisma migrate deploy` puis
`npx prisma db seed`, et remettez ensuite l’ancienne valeur.

N’oubliez pas de valider le changement de `schema.prisma` :

```bash
git add prisma/schema.prisma
git commit -m "chore: basculer la base sur PostgreSQL"
git push
```

---

## 3. Publier le site (Vercel)

1. Compte gratuit sur https://vercel.com, en vous connectant **avec GitHub**.
2. *Add New → Project* → choisissez le dépôt `fntc` → *Import*.
3. Avant de cliquer sur *Deploy*, ouvrez **Environment Variables** et ajoutez :

   | Nom | Valeur |
   |---|---|
   | `DATABASE_URL` | la chaîne de connexion Neon |
   | `SESSION_SECRET` | une longue phrase aléatoire, gardée secrète |

4. *Deploy*. Au bout de deux à trois minutes, Vercel donne une adresse du type
   `https://fntc.vercel.app`. **C’est le lien à partager.**

À chaque `git push`, Vercel republie le site automatiquement.

---

## 4. Les premières choses à faire en ligne

1. Ouvrez `https://votre-adresse/admin` et connectez-vous avec `proprietaire` /
   `FNTC-admin-2026`.
2. **Changez immédiatement le mot de passe** dans *Comptes admin* (12 caractères
   minimum).
3. Dans *Paramètres* : nom, slogan, email, téléphone, adresse, logo, symbole de la
   devise, frais de livraison.
4. Dans *Produits* : remplacez les 12 produits d’exemple par les vôtres, avec photos.
5. Dans *Textes du site* : ajustez les textes de l’accueil à votre voix.

---

## 5. Un nom de domaine à vous (facultatif)

Achetez un domaine (OVH, Namecheap, Gandi…), puis dans Vercel : *Settings → Domains →
Add*. Vercel affiche deux lignes à recopier chez votre vendeur de domaine. Le
certificat de sécurité (le cadenas) est automatique.

---

## 6. Brancher le paiement par carte (plus tard)

1. Compte sur https://stripe.com, vérification d’identité, puis *Développeurs → Clés
   API*.
2. Ajoutez `STRIPE_SECRET_KEY` et `STRIPE_PUBLIC_KEY` dans les variables Vercel.
3. Activez la case *Proposer la carte bancaire* dans *Paramètres*.

Tant que ce n’est pas fait, les clients commandent avec paiement à la livraison ou par
virement — c’est déjà pleinement fonctionnel.

---

## En cas de problème

| Symptôme | Cause la plus fréquente |
|---|---|
| Page blanche ou erreur 500 après le déploiement | `DATABASE_URL` absente ou fautive dans Vercel |
| « Session expirée » en boucle dans l’admin | `SESSION_SECRET` non défini dans Vercel |
| Les produits n’apparaissent pas | Le seed n’a pas tourné sur la base Neon (étape 2) |
| Le déploiement échoue | Ouvrez l’onglet *Deployments* de Vercel, lisez la dernière ligne rouge du journal |

Avant tout `git push`, un réflexe utile : `npm run build && npm test`. Si les deux
passent chez vous, le déploiement passera aussi.
