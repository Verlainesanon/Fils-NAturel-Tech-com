# Mettre le site en ligne sur Render — pas à pas

Le projet contient un fichier `render.yaml` : Render lit ce fichier et crée tout seul
le site **et** la base de données. Comptez une trentaine de minutes la première fois.

---

## 1. Le code doit être sur GitHub

C’est déjà fait : https://github.com/Verlainesanon/Fils-NAturel-Tech-com

Après chaque modification, envoyez-la avec :

```bash
git add -A
git commit -m "description du changement"
git push
```

Render republie automatiquement à chaque `git push`.

---

## 2. Créer le site sur Render

1. Compte gratuit sur https://render.com, en vous connectant **avec GitHub**.
2. Tableau de bord → **New → Blueprint**.
3. Choisissez le dépôt `Fils-NAturel-Tech-com`. Render détecte `render.yaml` et propose :
   - un service web `fntc`
   - une base PostgreSQL `fntc-db`
4. **Apply**. Render crée la base, installe les dépendances, applique les tables et
   construit le site.

Le premier déploiement prend cinq à dix minutes. À la fin, Render donne une adresse du
type `https://fntc.onrender.com` — **c’est le lien à partager**.

Vous n’avez aucune variable à saisir à la main : `DATABASE_URL` est branchée sur la base
automatiquement, et `SESSION_SECRET` est généré par Render.

---

## 3. Remplir la base : c’est automatique

Le forfait gratuit de Render ne donne pas accès au Shell. L’initialisation se fait donc
toute seule **pendant la construction** : la commande de build applique les migrations
puis charge les données de départ (4 catégories, 12 produits d’exemple, code promo
`FNTC10`, compte administrateur).

Ce chargement ne s’exécute **qu’une fois** : dès qu’un compte administrateur existe, les
déploiements suivants passent leur chemin. Vos produits ne seront jamais écrasés, et les
produits d’exemple que vous supprimez ne reviennent pas.

Pour forcer un rechargement malgré tout, ajoutez temporairement la variable
`FORCE_SEED` = `1` dans *Environment*, redéployez, puis retirez-la.

---

## 4. Les premières choses à faire en ligne

1. Ouvrez `https://votre-adresse.onrender.com/admin`
2. Connectez-vous : `proprietaire` / `FNTC-admin-2026`
3. **Changez ce mot de passe immédiatement** dans *Comptes admin* (12 caractères minimum).
4. *Paramètres* : nom, slogan, email, téléphone, adresse, logo, devise, frais de livraison.
5. *Produits* : remplacez les produits d’exemple par les vôtres, avec photos.
6. *Textes du site* : ajustez les textes de l’accueil.

---

## 5. À savoir sur le forfait gratuit de Render

- **Le site s’endort** après 15 minutes sans visite. La visite suivante le réveille en
  30 à 50 secondes. Si vous montrez le site à quelqu’un, ouvrez-le une minute avant.
- **La base gratuite expire au bout de 30 jours.** Render prévient par email. Passez la
  base en payant (autour de 7 $/mois) avant l’échéance, sinon les données sont perdues.
- Ces deux limites disparaissent avec le forfait payant du service web (autour de 7 $/mois).

---

## 6. Travailler en local

Le projet utilise désormais PostgreSQL partout, y compris chez vous. Le plus simple est
de pointer votre machine sur la base Render :

1. Dans Render, ouvrez la base `fntc-db` → copiez **External Database URL**.
2. Dans le fichier `.env` du projet :

```
DATABASE_URL="l-url-externe-copiee-chez-render"
SESSION_SECRET="une-longue-chaine-de-votre-choix"
```

3. Puis :

```bash
npm install
npx prisma migrate deploy
npm run dev
```

⚠️ Vous travaillez alors sur la **vraie** base : ce que vous supprimez en local disparaît
du site en ligne. Pour travailler sans risque, créez une seconde base gratuite sur Render
et utilisez son URL dans votre `.env`.

---

## 7. Agir sur la base sans le Shell

Le forfait gratuit n’a pas de Shell, mais la base reste joignable depuis votre
ordinateur :

1. Dans Render, ouvrez `fntc-db` → **Connect** → copiez la **PSQL Command** : elle
   contient déjà l’adresse externe et le mot de passe.
2. Collez-la dans un terminal. Vous obtenez une invite `fntc=>`.
3. Vous pouvez alors taper du SQL, par exemple pour lister vos comptes administrateurs :

```sql
SELECT identifiant, role, "derniereConnexion" FROM "AdminUser";
```

`psql` vient avec PostgreSQL : https://www.postgresql.org/download/windows/

Plus simple encore, sans rien installer de plus : mettez l’**External Database URL** dans
votre `.env` local, puis utilisez les commandes du projet — `npm run db:init` pour
initialiser, `npm run db:studio` pour ouvrir une interface graphique sur vos données.

---

## 8. Un nom de domaine à vous (facultatif)

Achetez un domaine, puis dans Render : service `fntc` → **Settings → Custom Domains →
Add**. Render affiche les lignes à recopier chez votre vendeur de domaine. Le certificat
de sécurité est automatique.

---

## 9. Brancher le paiement par carte (plus tard)

1. Compte sur https://stripe.com, vérification d’identité, puis *Développeurs → Clés API*.
2. Dans Render : service `fntc` → **Environment** → ajoutez `STRIPE_SECRET_KEY` et
   `STRIPE_PUBLIC_KEY`.
3. Cochez *Proposer la carte bancaire* dans *Paramètres*.

Tant que ce n’est pas fait, les clients commandent avec paiement à la livraison ou par
virement.

---

## En cas de problème

| Symptôme | Cause la plus fréquente |
|---|---|
| Le déploiement échoue | Ouvrez l’onglet *Logs* de Render, lisez la dernière ligne rouge |
| Page d’erreur 500 | La base n’est pas branchée : vérifiez `DATABASE_URL` dans *Environment* |
| « Session expirée » en boucle | `SESSION_SECRET` a changé entre deux déploiements |
| Le site met 40 secondes à s’ouvrir | Forfait gratuit : le service dormait, c’est normal |
| Les produits ont disparu | La base gratuite a expiré (30 jours) |

Avant chaque `git push`, un réflexe utile : `npm run build && npm test`. Si les deux
passent chez vous, le déploiement passera aussi.
