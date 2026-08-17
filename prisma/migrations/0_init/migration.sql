-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "reference" TEXT,
    "marque" TEXT,
    "descriptionCourte" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "prixCentimes" INTEGER NOT NULL,
    "promoCentimes" INTEGER,
    "promoDebut" TIMESTAMP(3),
    "promoFin" TIMESTAMP(3),
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
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" TIMESTAMP(3) NOT NULL,
    "supprimeLe" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "variation" INTEGER NOT NULL,
    "stockApres" INTEGER NOT NULL,
    "motif" TEXT NOT NULL,
    "note" TEXT,
    "auteur" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promo" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "valeur" INTEGER NOT NULL,
    "portee" TEXT NOT NULL DEFAULT 'tout',
    "cibleIds" TEXT NOT NULL DEFAULT '[]',
    "minimumCentimes" INTEGER NOT NULL DEFAULT 0,
    "debut" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "usagesMax" INTEGER,
    "usagesMaxParClient" INTEGER,
    "usages" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "motDePasse" TEXT,
    "badge" TEXT NOT NULL DEFAULT 'aucun',
    "notesInternes" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supprimeLe" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "ligne1" TEXT NOT NULL,
    "ligne2" TEXT,
    "ville" TEXT NOT NULL,
    "region" TEXT,
    "codePostal" TEXT,
    "pays" TEXT NOT NULL DEFAULT 'Haïti',
    "parDefaut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
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
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT,
    "nomProduit" TEXT NOT NULL,
    "referenceProduit" TEXT,
    "prixCentimes" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "auteur" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "jeton" TEXT NOT NULL,
    "clientId" TEXT,
    "nomVisiteur" TEXT NOT NULL DEFAULT 'Visiteur',
    "emailVisiteur" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ouvert',
    "assigneA" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "nomAuteur" TEXT NOT NULL,
    "corps" TEXT NOT NULL,
    "luParAdmin" BOOLEAN NOT NULL DEFAULT false,
    "luParClient" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "valeur" TEXT NOT NULL DEFAULT '',
    "valeurAlt" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "statut" TEXT NOT NULL DEFAULT 'publie',
    "majLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "donnees" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "tailleKo" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "lien" TEXT,
    "couleur" TEXT NOT NULL DEFAULT 'rouge',
    "debut" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("cle")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "echecs" INTEGER NOT NULL DEFAULT 0,
    "bloqueJusqua" TIMESTAMP(3),
    "derniereConnexion" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "jeton" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "cible" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "ip" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "Promo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

