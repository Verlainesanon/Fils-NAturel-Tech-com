-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "reference" TEXT,
    "marque" TEXT,
    "descriptionCourte" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "prixCentimes" INTEGER NOT NULL,
    "promoCentimes" INTEGER,
    "promoDebut" DATETIME,
    "promoFin" DATETIME,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 3,
    "poidsGrammes" INTEGER,
    "images" TEXT NOT NULL DEFAULT '[]',
    "caracteristiques" TEXT NOT NULL DEFAULT '[]',
    "statut" TEXT NOT NULL DEFAULT 'publie',
    "miseEnAvant" BOOLEAN NOT NULL DEFAULT false,
    "seoTitre" TEXT,
    "seoDescription" TEXT,
    "categorieId" TEXT NOT NULL,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" DATETIME NOT NULL,
    "supprimeLe" DATETIME,
    CONSTRAINT "Product_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produitId" TEXT NOT NULL,
    "variation" INTEGER NOT NULL,
    "stockApres" INTEGER NOT NULL,
    "motif" TEXT NOT NULL,
    "note" TEXT,
    "auteur" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Promo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "valeur" INTEGER NOT NULL,
    "portee" TEXT NOT NULL DEFAULT 'tout',
    "cibleIds" TEXT NOT NULL DEFAULT '[]',
    "minimumCentimes" INTEGER NOT NULL DEFAULT 0,
    "debut" DATETIME,
    "fin" DATETIME,
    "usagesMax" INTEGER,
    "usagesMaxParClient" INTEGER,
    "usages" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "motDePasse" TEXT,
    "badge" TEXT NOT NULL DEFAULT 'aucun',
    "notesInternes" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supprimeLe" DATETIME
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "ligne1" TEXT NOT NULL,
    "ligne2" TEXT,
    "ville" TEXT NOT NULL,
    "region" TEXT,
    "codePostal" TEXT,
    "pays" TEXT NOT NULL DEFAULT 'Haïti',
    "parDefaut" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Address_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "clientId" TEXT,
    "emailContact" TEXT NOT NULL,
    "nomContact" TEXT NOT NULL,
    "telContact" TEXT,
    "adresseTexte" TEXT NOT NULL,
    "villeLivraison" TEXT NOT NULL,
    "sousTotalCentimes" INTEGER NOT NULL,
    "remiseCentimes" INTEGER NOT NULL DEFAULT 0,
    "livraisonCentimes" INTEGER NOT NULL DEFAULT 0,
    "totalCentimes" INTEGER NOT NULL,
    "promoId" TEXT,
    "statutPaiement" TEXT NOT NULL DEFAULT 'en_attente',
    "modePaiement" TEXT NOT NULL DEFAULT 'hors_ligne',
    "statutTraitement" TEXT NOT NULL DEFAULT 'nouvelle',
    "suivi" TEXT,
    "noteInterne" TEXT,
    "jetonInvite" TEXT NOT NULL,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" DATETIME NOT NULL,
    CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "Promo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT,
    "nomProduit" TEXT NOT NULL,
    "referenceProduit" TEXT,
    "prixCentimes" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commandeId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "auteur" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderEvent_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jeton" TEXT NOT NULL,
    "clientId" TEXT,
    "nomVisiteur" TEXT NOT NULL DEFAULT 'Visiteur',
    "emailVisiteur" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ouvert',
    "assigneA" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" DATETIME NOT NULL,
    CONSTRAINT "Conversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "nomAuteur" TEXT NOT NULL,
    "corps" TEXT NOT NULL,
    "luParAdmin" BOOLEAN NOT NULL DEFAULT false,
    "luParClient" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cle" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "valeur" TEXT NOT NULL DEFAULT '',
    "valeurAlt" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "statut" TEXT NOT NULL DEFAULT 'publie',
    "majLe" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "donnees" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "tailleKo" INTEGER NOT NULL DEFAULT 0,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texte" TEXT NOT NULL,
    "lien" TEXT,
    "couleur" TEXT NOT NULL DEFAULT 'rouge',
    "debut" DATETIME,
    "fin" DATETIME,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Setting" (
    "cle" TEXT NOT NULL PRIMARY KEY,
    "valeur" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifiant" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "echecs" INTEGER NOT NULL DEFAULT 0,
    "bloqueJusqua" DATETIME,
    "derniereConnexion" DATETIME,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jeton" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "expireLe" DATETIME NOT NULL,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auteur" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "cible" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "ip" TEXT,
    "creeLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categorieId_idx" ON "Product"("categorieId");

-- CreateIndex
CREATE INDEX "Product_statut_idx" ON "Product"("statut");

-- CreateIndex
CREATE INDEX "StockMovement_produitId_idx" ON "StockMovement"("produitId");

-- CreateIndex
CREATE UNIQUE INDEX "Promo_code_key" ON "Promo"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Address_clientId_idx" ON "Address"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_numero_key" ON "Order"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Order_jetonInvite_key" ON "Order"("jetonInvite");

-- CreateIndex
CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");

-- CreateIndex
CREATE INDEX "Order_statutTraitement_idx" ON "Order"("statutTraitement");

-- CreateIndex
CREATE INDEX "OrderItem_commandeId_idx" ON "OrderItem"("commandeId");

-- CreateIndex
CREATE INDEX "OrderEvent_commandeId_idx" ON "OrderEvent"("commandeId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_jeton_key" ON "Conversation"("jeton");

-- CreateIndex
CREATE INDEX "Conversation_statut_idx" ON "Conversation"("statut");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_cle_key" ON "ContentBlock"("cle");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_identifiant_key" ON "AdminUser"("identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_jeton_key" ON "AdminSession"("jeton");

-- CreateIndex
CREATE INDEX "AdminSession_adminId_idx" ON "AdminSession"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_creeLe_idx" ON "AuditLog"("creeLe");
